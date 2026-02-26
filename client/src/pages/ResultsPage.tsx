import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/Button";
import Badge from "../components/Badge";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import { ArrowRightIcon, ChartIcon, RefreshIcon } from "../components/Icons";
import { getEncouragingMessage } from "../lib/constants";

// Celebratory floating particles for kids
function CelebrationParticles({ count = 12 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 3,
        size: 4 + Math.random() * 8,
        color: ["#f59e0b", "#3b82f6", "#22c55e", "#a855f7", "#ec4899"][i % 5],
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{ y: "-20vh", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const [displayScore, setDisplayScore] = useState(0);

  const resultStr = sessionStorage.getItem("gameResult");
  const result = resultStr
    ? JSON.parse(resultStr)
    : { score: 0, correctAnswers: 0, totalQuestions: 10, badges: [], timeSeconds: 0 };

  const totalScore = result.score ?? result.totalScore ?? 0;
  const { correctAnswers, totalQuestions, badges } = result;

  // Count-up animation for score
  useEffect(() => {
    if (totalScore === 0) return;

    const duration = 1500;
    const steps = 40;
    const increment = totalScore / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.round(increment * step);
      if (step >= steps) {
        setDisplayScore(totalScore);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalScore]);

  const handlePlayAgain = () => {
    // Keep playerName for quick replay (Fix #17)
    sessionStorage.removeItem("sessionId");
    sessionStorage.removeItem("questions");
    sessionStorage.removeItem("gameResult");
    navigate("/");
  };

  return (
    <div className="relative flex min-h-dvh flex-col bg-bg-primary pb-20">
      {/* Celebration particles */}
      {totalScore > 0 && <CelebrationParticles count={correctAnswers >= totalQuestions / 2 ? 16 : 8} />}

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-lg font-bold text-white">תוצאות המשחק</span>
        <button
          onClick={() => navigate("/")}
          className="flex h-12 w-12 items-center justify-center text-text-muted"
          aria-label="חזרה לדף הבית"
        >
          <ArrowRightIcon size={24} color="#8b95a8" />
        </button>
      </div>

      {/* Score circle */}
      <div className="flex justify-center pt-8 pb-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="relative flex h-52 w-52 items-center justify-center"
        >
          {/* Ring */}
          <svg
            className="absolute inset-0"
            viewBox="0 0 208 208"
            fill="none"
          >
            {/* Background ring */}
            <circle
              cx="104"
              cy="104"
              r="98"
              stroke="#1e2a45"
              strokeWidth="6"
            />
            {/* Blue ring */}
            <motion.circle
              cx="104"
              cy="104"
              r="98"
              stroke="#2563eb"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 98}`}
              strokeDashoffset={`${2 * Math.PI * 98}`}
              animate={{
                strokeDashoffset: `${2 * Math.PI * 98 * (1 - Math.min(totalScore / 150, 1))}`,
              }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              transform="rotate(-90 104 104)"
            />
          </svg>

          {/* Score text */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-5xl font-extrabold text-blue-primary">
              {displayScore}
            </span>
            <span className="mt-1 text-sm text-text-secondary">ניקוד סופי</span>
          </div>
        </motion.div>
      </div>

      {/* Correct answers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <h3 className="text-xl font-bold text-white">
          {correctAnswers}/{totalQuestions} תשובות נכונות
        </h3>
        <p className="mt-2 text-sm text-text-secondary">
          {getEncouragingMessage(correctAnswers, totalQuestions)}
        </p>
      </motion.div>

      {/* Badges */}
      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 px-6"
        >
          <h4 className="mb-4 text-center text-sm font-medium text-text-secondary">
            הישגים שקיבלת
          </h4>
          <div className="flex items-start justify-center gap-6">
            {badges.map((badge: string, i: number) => (
              <Badge key={badge} name={badge} size="lg" delay={0.8 + i * 0.15} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-auto flex flex-col gap-3 px-6 pt-8"
      >
        <Button
          onClick={() => navigate("/leaderboard")}
          icon={<ChartIcon size={20} color="white" />}
        >
          צפה בלוח התוצאות
        </Button>
        <Button
          variant="secondary"
          onClick={handlePlayAgain}
          icon={<RefreshIcon size={20} color="#8b95a8" />}
        >
          שחק שוב
        </Button>
      </motion.div>

      <Footer />
      <BottomNav variant="results" />
    </div>
  );
}
