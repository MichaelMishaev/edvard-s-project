import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ScoreDisplay from "../components/ScoreDisplay";
import ProgressBar from "../components/ProgressBar";
import BottomNav from "../components/BottomNav";
import { CloseIcon, QuestionIcon, LightbulbIcon } from "../components/Icons";
import { useSubmitAnswer, useCompleteGame } from "../hooks/useGame";
import type { Question } from "../lib/types";

type GameState = "countdown" | "playing";

// Server already picks 3 answers and shuffles them, just use as-is

export default function GamePage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("countdown");
  const [countdownNum, setCountdownNum] = useState(3);
  const [showYalla, setShowYalla] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<{
    correct: boolean;
    correctAnswerId: string;
    explanation: string;
  } | null>(null);
  const [displayedAnswers, setDisplayedAnswers] = useState<
    { id: string; text: string }[]
  >([]);
  const questionStartTime = useRef(Date.now());

  const submitAnswer = useSubmitAnswer();
  const completeGame = useCompleteGame();

  const playerName = sessionStorage.getItem("playerName") || "";
  const sessionId = sessionStorage.getItem("sessionId") || "";
  const questionsStr = sessionStorage.getItem("questions");
  const questions: Question[] = questionsStr ? JSON.parse(questionsStr) : [];
  const totalQuestions = questions.length;

  const currentQuestion = questions[currentQuestionIndex];

  // Server already sends 3 shuffled answers per question
  useEffect(() => {
    if (currentQuestion) {
      setDisplayedAnswers(currentQuestion.answers);
    }
  }, [currentQuestionIndex]);

  // Redirect if no game data
  useEffect(() => {
    if (!sessionId || questions.length === 0) {
      navigate("/");
    }
  }, [sessionId, questions.length, navigate]);

  // Countdown timer
  useEffect(() => {
    if (gameState !== "countdown") return;

    if (countdownNum > 0) {
      const timer = setTimeout(() => setCountdownNum((n) => n - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!showYalla) {
      setShowYalla(true);
      const timer = setTimeout(() => {
        setGameState("playing");
        questionStartTime.current = Date.now();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, countdownNum, showYalla]);

  const handleAnswer = useCallback(
    async (answerId: string) => {
      if (selectedAnswer || !currentQuestion) return;

      setSelectedAnswer(answerId);
      const timeMs = Date.now() - questionStartTime.current;

      try {
        const result = await submitAnswer.mutateAsync({
          sessionId,
          questionId: currentQuestion.id,
          answerId,
          timeMs,
        });

        setAnswerResult({
          correct: result.correct,
          correctAnswerId: result.correctAnswerId,
          explanation: result.explanation,
        });
        if (result.correct) {
          setScore((prev) => prev + 10);
        }

        // Auto advance after 2 seconds
        setTimeout(() => {
          const nextIndex = currentQuestionIndex + 1;
          if (nextIndex >= totalQuestions) {
            // Game complete
            handleGameComplete();
          } else {
            setCurrentQuestionIndex(nextIndex);
            setSelectedAnswer(null);
            setAnswerResult(null);
            questionStartTime.current = Date.now();
          }
        }, 2000);
      } catch {
        // If API fails, still advance (we don't know correct answer, just mark as wrong)
        setAnswerResult({
          correct: false,
          correctAnswerId: "",
          explanation: currentQuestion.explanation,
        });
        setTimeout(() => {
          const nextIndex = currentQuestionIndex + 1;
          if (nextIndex >= totalQuestions) {
            handleGameComplete();
          } else {
            setCurrentQuestionIndex(nextIndex);
            setSelectedAnswer(null);
            setAnswerResult(null);
            questionStartTime.current = Date.now();
          }
        }, 2000);
      }
    },
    [currentQuestion, currentQuestionIndex, selectedAnswer, sessionId, totalQuestions]
  );

  const handleGameComplete = async () => {
    try {
      const result = await completeGame.mutateAsync(sessionId);
      sessionStorage.setItem("gameResult", JSON.stringify(result));
    } catch {
      // Store fallback data
      sessionStorage.setItem(
        "gameResult",
        JSON.stringify({ score, correctAnswers: 0, totalQuestions, badges: [], timeSeconds: 0 })
      );
    }
    navigate("/results");
  };

  if (gameState === "countdown") {
    return <CountdownScreen countdownNum={countdownNum} showYalla={showYalla} playerName={playerName} />;
  }

  if (!currentQuestion) return null;

  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary pb-20">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          onClick={() => navigate("/")}
          className="rounded-full border border-border-card p-2"
        >
          <QuestionIcon size={18} color="#5b6478" />
        </button>

        <div className="flex flex-1 flex-col items-center gap-1 px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">התקדמות</span>
            <span className="text-sm font-bold text-blue-primary">
              {currentQuestionIndex + 1}/{totalQuestions}
            </span>
          </div>
          <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
        </div>

        <ScoreDisplay score={score} />
      </div>

      {/* Question content */}
      <div className="flex flex-1 flex-col items-center px-6 pt-8">
        {/* Lightbulb icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-primary/20"
        >
          <LightbulbIcon size={32} color="#2563eb" />
        </motion.div>

        {/* Question text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="w-full text-center"
          >
            <h2 className="text-2xl font-bold text-white leading-relaxed">
              {currentQuestion.question}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              בחר את התשובה הנכונה ביותר
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Answer buttons */}
        <div className="mt-8 flex w-full flex-col gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3"
            >
              {displayedAnswers.map((answer, idx) => {
                let borderColor = "border-border-card";
                let radioColor = "border-text-muted";
                let radioFill = "transparent";

                if (answerResult && selectedAnswer) {
                  if (answer.id === answerResult.correctAnswerId) {
                    borderColor = "border-success";
                    radioColor = "border-success";
                    radioFill = "#22c55e";
                  } else if (
                    answer.id === selectedAnswer &&
                    !answerResult.correct
                  ) {
                    borderColor = "border-error";
                    radioColor = "border-error";
                    radioFill = "#ef4444";
                  }
                }

                return (
                  <motion.button
                    key={answer.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(answer.id)}
                    disabled={!!selectedAnswer}
                    className={`flex items-center gap-4 rounded-2xl border ${borderColor} bg-bg-card px-5 py-4 text-right transition-colors disabled:cursor-default`}
                  >
                    {/* Radio circle on LEFT (visually, since RTL it goes to right of flex) */}
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${radioColor}`}
                    >
                      {radioFill !== "transparent" && (
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: radioFill }}
                        />
                      )}
                    </div>
                    <span className="flex-1 text-right text-lg font-semibold text-white">
                      {answer.text}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Explanation box */}
        <div className="mt-6 w-full rounded-2xl border-2 border-dashed border-border-card px-5 py-4">
          <p className="text-center text-sm text-text-muted leading-relaxed">
            {answerResult
              ? answerResult.explanation
              : "הסבר קצר על התשובה יופיע כאן לאחר הבחירה"}
          </p>
        </div>
      </div>

      <BottomNav variant="game" />
    </div>
  );
}

// --- Countdown sub-component ---
function CountdownScreen({
  countdownNum,
  showYalla,
  playerName,
}: {
  countdownNum: number;
  showYalla: boolean;
  playerName: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-lg font-bold text-white">מתחילים</span>
        <button className="text-text-muted">
          <CloseIcon size={24} color="#5b6478" />
        </button>
      </div>

      {/* Map background area */}
      <div className="relative flex flex-1 flex-col items-center justify-center">
        {/* Semi-transparent map overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(circle at center, #2d5a7b 0%, transparent 70%)",
          }}
        />

        {/* Countdown numbers */}
        <div className="relative z-10 text-center">
          <AnimatePresence mode="wait">
            {!showYalla ? (
              <motion.div
                key={countdownNum}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-7xl font-extrabold text-white"
              >
                ...{countdownNum}...{countdownNum > 1 ? countdownNum - 1 : ""}
                ...{countdownNum > 2 ? countdownNum - 2 : ""}
              </motion.div>
            ) : (
              <motion.div
                key="yalla"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-6xl font-extrabold text-blue-primary"
              >
                !יאללה
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player name pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 inline-block rounded-full bg-bg-card/80 px-6 py-2 backdrop-blur-sm"
          >
            <span className="text-sm text-text-secondary">
              ...מתכוננים למסע, <span className="font-bold text-white">{playerName}</span>
            </span>
          </motion.div>
        </div>
      </div>

      {/* Loading card at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-4 mb-8 rounded-2xl bg-bg-card p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-success">65%</span>
          <span className="text-sm text-text-secondary">...טוען נתונים</span>
        </div>
        <div className="h-2 w-full rounded-full bg-border-card overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-blue-primary"
            initial={{ width: "20%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
        {/* Jerusalem image placeholder */}
        <div
          className="mt-3 h-32 rounded-xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #2d5a7b 0%, #c4a86c 50%, #4a7c5b 100%)",
          }}
        />
      </motion.div>
    </div>
  );
}
