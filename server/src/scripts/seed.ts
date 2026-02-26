import { db } from "../db/index.js";
import { questions } from "../db/schema.js";
import { readFileSync } from "fs";
import { resolve } from "path";

async function seed() {
  console.log("Seeding questions...");

  const questionsPath = resolve(
    import.meta.dirname,
    "../../../docs/Questionsanswers.json"
  );
  const raw = readFileSync(questionsPath, "utf-8");
  const data = JSON.parse(raw) as {
    questions: Array<{
      id: string;
      topic: string;
      difficulty: number;
      question: string;
      answers: { id: string; text: string }[];
      correctAnswerId: string;
      timeLimitSec: number;
      explanation: string;
      tags: string[];
    }>;
  };

  for (const q of data.questions) {
    await db
      .insert(questions)
      .values({
        id: q.id,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        answers: q.answers,
        correctAnswerId: q.correctAnswerId,
        timeLimitSec: q.timeLimitSec,
        explanation: q.explanation,
        tags: q.tags,
      })
      .onConflictDoNothing({ target: questions.id });
  }

  console.log(`Seeded ${data.questions.length} questions successfully.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
