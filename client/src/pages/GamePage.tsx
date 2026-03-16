import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ScoreDisplay from "../components/ScoreDisplay";
import ProgressBar from "../components/ProgressBar";
import BottomNav from "../components/BottomNav";
import { CloseIcon, QuestionIcon, LightbulbIcon } from "../components/Icons";
import {
  useSubmitAnswer,
  useCompleteGame,
  useCurrentContest,
  useRegisterContestParticipation,
} from "../hooks/useGame";
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
  const { data: currentContest } = useCurrentContest();
  const registerParticipation = useRegisterContestParticipation();

  const playerName = localStorage.getItem("playerName") || "";
  const sessionId = sessionStorage.getItem("sessionId") || "";
  const questionsStr = sessionStorage.getItem("questions");
  let questions: Question[] = [];
  try {
    questions = questionsStr ? JSON.parse(questionsStr) : [];
  } catch {
    questions = [];
  }
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
          setScore((prev) => prev + (result.pointsAwarded ?? 10));
        }

        // Correct: advance after 2s. Wrong: give 3.5s to read the hint
        const delay = result.correct ? 2000 : 3500;
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
        }, delay);
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
        }, 3500);
      }
    },
    [currentQuestion, currentQuestionIndex, selectedAnswer, sessionId, totalQuestions]
  );

  const handleGameComplete = async () => {
    try {
      const theme = sessionStorage.getItem("gameTheme") || "jerusalem";
      const result = await completeGame.mutateAsync({ sessionId, theme });
      sessionStorage.setItem("gameResult", JSON.stringify(result));

      // Register contest participation if there's an active contest
      if (currentContest) {
        const playerId = localStorage.getItem("playerId");
        const playerClassName = localStorage.getItem("playerClassName");

        if (playerId && playerClassName) {
          try {
            await registerParticipation.mutateAsync({
              contestId: currentContest.contestId,
              playerId,
              className: playerClassName,
            });
          } catch (error) {
            // Silent fail - contest registration is non-critical
            console.error("Failed to register contest participation:", error);
          }
        }
      }
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
    <div className="relative flex min-h-dvh flex-col bg-bg-primary">
      {/* Jerusalem skyline — absolute backdrop, never takes layout space */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg-primary to-transparent z-10" />
        <img
          src="/images/ui/jerusalem-quiz-bg.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-top opacity-20"
        />
      </div>

      {/* Top bar — sticky, full-width, contained */}
      <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 w-full max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          aria-label="חזרה לדף הבית"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border-card bg-bg-card/60 backdrop-blur-sm hover:bg-bg-card transition-colors"
        >
          <CloseIcon size={16} color="#5b6478" />
        </button>

        <div className="flex flex-1 flex-col items-center gap-1 px-4">
          <div className="flex items-center gap-1.5 rounded-full bg-bg-card px-3 py-1 border border-border-card">
            <span className="text-sm font-bold text-white">{currentQuestionIndex + 1}</span>
            <span className="text-sm text-text-muted">/ {totalQuestions}</span>
          </div>
          <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
        </div>

        <ScoreDisplay score={score} />
      </div>

      {/* ── Main content: vertically centered, fills remaining viewport ── */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 sm:px-6 pb-24 md:pb-8 pt-2 md:pt-0">
        <div className="w-full max-w-5xl">

          {/* ── Mobile: stack / Desktop: side-by-side (RTL aware) ── */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-10 lg:gap-16">

            {/* ── Column A (RIGHT in RTL): Question heading + answers ── */}
            {/* DOM order first = RTL renders on the right side */}
            <div className="flex flex-col md:flex-[3] gap-5 md:gap-6">

              {/* Mobile image (hidden on desktop) */}
              <div className="flex justify-center md:hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`img-mobile-${currentQuestionIndex}`}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentQuestion.imageUrl ? (
                      <QuestionImage src={currentQuestion.imageUrl} alt="איור לשאלה" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-primary/20">
                        <LightbulbIcon size={32} color="#2563eb" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Question heading */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.28 }}
                >
                  <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-white leading-snug text-right">
                    {currentQuestion.question}
                  </h2>
                  <p className="mt-2 text-sm text-text-secondary text-right">
                    בחר את התשובה הנכונה ביותר
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Answer buttons */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`answers-${currentQuestionIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3"
                >
                  {displayedAnswers.map((answer, idx) => {
                    let borderColor = "border-border-card";
                    let radioColor = "border-text-muted";
                    let radioFill = "transparent";
                    let bgColor = "bg-bg-card";

                    if (selectedAnswer === answer.id && !answerResult) {
                      borderColor = "border-blue-primary";
                      radioColor = "border-blue-primary";
                      radioFill = "#2563eb";
                      bgColor = "bg-blue-primary/10";
                    }

                    if (answerResult && selectedAnswer) {
                      if (answer.id === answerResult.correctAnswerId) {
                        borderColor = "border-success";
                        radioColor = "border-success";
                        radioFill = "#22c55e";
                        bgColor = "bg-success/10";
                      } else if (answer.id === selectedAnswer && !answerResult.correct) {
                        borderColor = "border-error";
                        radioColor = "border-error";
                        radioFill = "#ef4444";
                        bgColor = "bg-error/10";
                      }
                    }

                    return (
                      <motion.button
                        key={answer.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        whileTap={!selectedAnswer ? { scale: 0.985 } : {}}
                        onClick={() => handleAnswer(answer.id)}
                        disabled={!!selectedAnswer}
                        aria-label={`תשובה: ${answer.text}`}
                        className={`flex items-center gap-4 rounded-2xl border-2 ${borderColor} ${bgColor} px-5 py-4 md:py-5 min-h-[60px] md:min-h-[68px] text-right transition-all duration-150 disabled:cursor-default hover:brightness-110`}
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${radioColor} transition-colors`}
                        >
                          {radioFill !== "transparent" && (
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: radioFill }} />
                          )}
                        </div>
                        <span className="flex-1 text-right text-base md:text-lg lg:text-xl font-semibold text-white">
                          {answer.text}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Explanation box */}
              {answerResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full rounded-2xl border-2 border-amber-400/60 bg-amber-400/10 px-5 py-4"
                >
                  <p className="text-right text-sm md:text-base text-amber-200 font-medium leading-relaxed">
                    💡 {answerResult.explanation}
                  </p>
                </motion.div>
              )}
            </div>

            {/* ── Column B (LEFT in RTL): Large image — desktop only ── */}
            <div className="hidden md:flex md:flex-[2] items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`img-desktop-${currentQuestionIndex}`}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.35, type: "spring", stiffness: 200 }}
                >
                  {currentQuestion.imageUrl ? (
                    <QuestionImage src={currentQuestion.imageUrl} alt="איור לשאלה" desktop />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-primary/20">
                      <LightbulbIcon size={48} color="#2563eb" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      <BottomNav variant="game" />
    </div>
  );
}

// --- Question image with fallback ---
function QuestionImage({ src, alt, desktop = false }: { src: string; alt: string; desktop?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-center justify-center rounded-full bg-blue-primary/20 ${desktop ? "h-24 w-24" : "h-16 w-16"}`}>
        <LightbulbIcon size={desktop ? 48 : 32} color="#2563eb" />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-3xl border-2 border-blue-primary/30 shadow-2xl ${
      desktop
        ? "w-full max-w-xs lg:max-w-sm aspect-square"
        : "h-44 w-44 sm:h-52 sm:w-52"
    }`}>
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
