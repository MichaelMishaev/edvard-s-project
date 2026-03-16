import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/Button";
import BadgePopup from "../components/BadgePopup";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import { ArrowRightIcon, ChartIcon, RefreshIcon } from "../components/Icons";
import { getEncouragingMessage, PESACH_BADGE_MAP, BADGE_CONFIG } from "../lib/constants";
import { getBadgeDefinitions } from "../lib/api";

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
  let result = { score: 0, correctAnswers: 0, totalQuestions: 10, badges: [], timeSeconds: 0 };
  try {
    if (resultStr) result = JSON.parse(resultStr);
  } catch {
    // malformed sessionStorage — use defaults
  }

  const gameTheme = sessionStorage.getItem("gameTheme") ?? "jerusalem";
  const totalScore = result.score ?? (result as any).totalScore ?? 0;
  const { correctAnswers, totalQuestions } = result;
  const badges: string[] = (result.badges ?? []).map((b: string) =>
    gameTheme === "pesach" ? (PESACH_BADGE_MAP[b] ?? b) : b
  );

  const [showBadgePopup, setShowBadgePopup] = useState(badges.length > 0);

  const { data: badgeDefs = [] } = useQuery({
    queryKey: ["badge-definitions", gameTheme],
    queryFn: () => getBadgeDefinitions(gameTheme),
    staleTime: 60000,
    enabled: badges.length > 0,
  });

  const earnedBadgeDefs = badgeDefs.filter((b) => badges.includes(b.name));

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
    sessionStorage.removeItem("gameTheme");
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
      <div className="flex justify-center pt-8 pb-6 w-full max-w-lg mx-auto">
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
          {getEncouragingMessage(correctAnswers, totalQuestions, gameTheme)}
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
          <div className="flex flex-wrap items-start justify-center gap-6">
            {(earnedBadgeDefs.length > 0 ? earnedBadgeDefs : badges.map((name) => ({ id: name, name, imageUrl: "", description: "", earned: true }))).map((badge, i) => {
              const config = BADGE_CONFIG[badge.name];
              const borderColor = config?.borderColor ?? (gameTheme === "pesach" ? "#f97316" : "#3b82f6");
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.15, type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="relative h-20 w-20">
                    <div
                      className="absolute inset-0 rounded-full opacity-50 blur-sm"
                      style={{ background: `linear-gradient(135deg, ${borderColor}80, ${borderColor}40)` }}
                    />
                    <div
                      className="relative h-full w-full rounded-full border-4 bg-cover bg-center bg-no-repeat shadow-lg"
                      style={{ borderColor, backgroundImage: badge.imageUrl ? `url(${badge.imageUrl})` : undefined, backgroundColor: badge.imageUrl ? undefined : "#1e2a45" }}
                    />
                  </div>
                  <span className="text-xs font-medium text-text-secondary">{badge.name}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-auto flex flex-col gap-3 px-6 pt-8 w-full max-w-sm mx-auto"
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

      <AnimatePresence>
        {showBadgePopup && (
          <BadgePopup
            badgeNames={badges}
            theme={gameTheme}
            onClose={() => setShowBadgePopup(false)}
          />
        )}
      </AnimatePresence>

      <Footer />
      <BottomNav variant="results" />
    </div>
  );
}
