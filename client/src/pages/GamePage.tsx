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
    }
  }, [gameState, countdownNum, showYalla]);

  // Transition from "yalla" to playing (separate effect to avoid cleanup race)
  useEffect(() => {
    if (gameState !== "countdown" || !showYalla) return;

    const timer = setTimeout(() => {
      setGameState("playing");
      questionStartTime.current = Date.now();
    }, 1000);
    return () => clearTimeout(timer);
  }, [gameState, showYalla]);

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
          aria-label="חזרה לדף הבית"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border-card"
        >
          <QuestionIcon size={18} color="#5b6478" />
        </button>

        <div className="flex flex-1 flex-col items-center gap-1 px-4">
          <span className="text-sm text-text-secondary">התקדמות</span>
          <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
        </div>

        <ScoreDisplay score={score} />
      </div>

      {/* Question content */}
      <div className="flex flex-1 flex-col items-center px-6 pt-6">
        {/* Question image or lightbulb fallback */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`img-${currentQuestionIndex}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            {currentQuestion.imageUrl ? (
              <QuestionImage
                src={currentQuestion.imageUrl}
                alt={`איור לשאלה`}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-primary/20">
                <LightbulbIcon size={32} color="#2563eb" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

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
                let bgColor = "bg-bg-card";

                // Immediate "selected" feedback before API responds
                if (selectedAnswer === answer.id && !answerResult) {
                  borderColor = "border-blue-primary";
                  radioColor = "border-blue-primary";
                  radioFill = "#2563eb";
                  bgColor = "bg-blue-primary/10";
                }

                // Final correct/wrong state after API responds
                if (answerResult && selectedAnswer) {
                  if (answer.id === answerResult.correctAnswerId) {
                    borderColor = "border-success";
                    radioColor = "border-success";
                    radioFill = "#22c55e";
                    bgColor = "bg-success/10";
                  } else if (
                    answer.id === selectedAnswer &&
                    !answerResult.correct
                  ) {
                    borderColor = "border-error";
                    radioColor = "border-error";
                    radioFill = "#ef4444";
                    bgColor = "bg-error/10";
                  } else {
                    bgColor = "bg-bg-card";
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
                    aria-label={`תשובה: ${answer.text}`}
                    className={`flex items-center gap-4 rounded-2xl border ${borderColor} ${bgColor} px-5 py-4 min-h-[56px] text-right transition-colors disabled:cursor-default`}
                  >
                    {/* Radio circle */}
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
              : "בחר את התשובה הנכונה ביותר"}
          </p>
        </div>
      </div>

      <BottomNav variant="game" />
    </div>
  );
}

// --- Question image with fallback ---
function QuestionImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-primary/20">
        <LightbulbIcon size={32} color="#2563eb" />
      </div>
    );
  }

  return (
    <div className="h-28 w-28 overflow-hidden rounded-2xl border-2 border-blue-primary/30 shadow-lg">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
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
        <button
          aria-label="סגור"
          className="rounded-full p-2 text-text-muted"
        >
          <CloseIcon size={24} color="#5b6478" />
        </button>
      </div>

      {/* Map background area */}
      <div className="relative flex flex-1 flex-col items-center justify-center">
        {/* Map background image */}
        <img
          src="/images/ui/jerusalem-map-bg.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-15"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
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
                className="text-8xl font-extrabold text-white"
              >
                {countdownNum}
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
            <span className="text-base text-text-secondary">
              ,<span className="font-bold text-white">{playerName}</span> המשחק עומד להתחיל
            </span>
          </motion.div>
        </div>
      </div>

      {/* Jerusalem image card at bottom (no fake progress bar) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-4 mb-8 rounded-2xl bg-bg-card p-4"
      >
        <p className="mb-3 text-center text-sm text-text-secondary">
          ...טוען נתונים
        </p>
        {/* Loading bar that matches design */}
        <div className="mb-3 h-2 w-full rounded-full bg-border-card overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-blue-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
        {/* Jerusalem image */}
        <div className="h-32 rounded-xl overflow-hidden">
          <img
            src="/images/ui/jerusalem-countdown.png"
            alt="נוף ירושלים"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.style.background =
                "linear-gradient(135deg, #2d5a7b 0%, #c4a86c 50%, #4a7c5b 100%)";
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
