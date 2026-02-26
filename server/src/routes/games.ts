import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { gameSessions, players, questions } from "../db/schema.js";
import { eq, inArray, sql } from "drizzle-orm";
import { calculateBadges } from "../services/badges.js";

const router = Router();

// POST /api/games/start - Start a new game session
router.post("/start", async (req: Request, res: Response) => {
  try {
    const { playerId } = req.body as { playerId?: string };

    if (!playerId) {
      res.status(400).json({ error: "playerId is required" });
      return;
    }

    // Verify player exists
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId));

    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    // Pick 10 random questions
    const allQuestions = await db
      .select()
      .from(questions)
      .orderBy(sql`RANDOM()`)
      .limit(10);

    if (allQuestions.length === 0) {
      res.status(500).json({ error: "No questions available" });
      return;
    }

    const questionIds = allQuestions.map((q) => q.id);

    // Create game session
    const [session] = await db
      .insert(gameSessions)
      .values({
        playerId,
        questionIds,
        answers: [],
      })
      .returning();

    // For each question: pick 3 answers (correct + 2 random wrong), shuffle, strip correctAnswerId
    const sanitizedQuestions = allQuestions.map(
      ({ correctAnswerId, answers, imageUrl, ...rest }) => {
        const correctAnswer = answers.find((a) => a.id === correctAnswerId)!;
        const wrongAnswers = answers.filter((a) => a.id !== correctAnswerId);
        // Shuffle wrong answers and pick 2
        const shuffledWrong = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
        // Combine correct + 2 wrong and shuffle
        const picked = [correctAnswer, ...shuffledWrong].sort(() => Math.random() - 0.5);
        // Always derive imageUrl from question ID (images are static assets)
        const resolvedImageUrl = `/images/questions/${rest.id}.png`;
        return { ...rest, imageUrl: resolvedImageUrl, answers: picked };
      }
    );

    res.status(201).json({
      sessionId: session.id,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error("Error starting game:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/games/:id/answer - Submit an answer
router.post("/:id/answer", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { questionId, answerId, timeMs } = req.body as {
      questionId?: string;
      answerId?: string;
      timeMs?: number;
    };

    if (!questionId || !answerId || timeMs === undefined) {
      res
        .status(400)
        .json({ error: "questionId, answerId, and timeMs are required" });
      return;
    }

    // Get the session
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, id));

    if (!session) {
      res.status(404).json({ error: "Game session not found" });
      return;
    }

    if (session.completedAt) {
      res.status(400).json({ error: "Game session already completed" });
      return;
    }

    // Get the question to validate
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId));

    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    const correct = question.correctAnswerId === answerId;

    // Update session answers
    const updatedAnswers = [
      ...session.answers,
      { questionId, answerId, timeMs, correct },
    ];

    await db
      .update(gameSessions)
      .set({ answers: updatedAnswers })
      .where(eq(gameSessions.id, id));

    res.json({
      correct,
      correctAnswerId: question.correctAnswerId,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/games/:id/complete - Complete a game session
router.post("/:id/complete", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Get the session
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, id));

    if (!session) {
      res.status(404).json({ error: "Game session not found" });
      return;
    }

    if (session.completedAt) {
      res.status(400).json({ error: "Game session already completed" });
      return;
    }

    // Get questions for badge calculation
    const questionIds = session.questionIds;
    const sessionQuestions = await db
      .select({ id: questions.id, topic: questions.topic, timeLimitSec: questions.timeLimitSec })
      .from(questions)
      .where(inArray(questions.id, questionIds));

    // Calculate score
    const answers = session.answers;
    let score = 0;
    let totalTimeMs = 0;

    // Build a map of question ID to timeLimitSec
    const timeLimitMap = new Map(
      sessionQuestions.map((q) => [q.id, q.timeLimitSec])
    );

    for (const answer of answers) {
      totalTimeMs += answer.timeMs;
      if (answer.correct) {
        score += 10; // base points

        // Speed bonus: +5 if answered in under half the time limit
        const timeLimit = timeLimitMap.get(answer.questionId);
        if (timeLimit && answer.timeMs < (timeLimit * 1000) / 2) {
          score += 5;
        }
      }
    }

    const totalTimeSeconds = Math.round(totalTimeMs / 1000);
    const correctCount = answers.filter((a) => a.correct).length;

    // Calculate badges
    const badges = calculateBadges(answers, sessionQuestions, totalTimeSeconds);

    // Update player
    await db
      .update(players)
      .set({
        score,
        correctAnswers: correctCount,
        totalQuestions: answers.length,
        timeSeconds: totalTimeSeconds,
        badges,
      })
      .where(eq(players.id, session.playerId));

    // Mark session as completed
    await db
      .update(gameSessions)
      .set({ completedAt: new Date() })
      .where(eq(gameSessions.id, id));

    res.json({
      score,
      correctAnswers: correctCount,
      totalQuestions: answers.length,
      timeSeconds: totalTimeSeconds,
      badges,
    });
  } catch (error) {
    console.error("Error completing game:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
