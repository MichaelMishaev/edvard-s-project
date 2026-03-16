import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useBadgeCollection } from "../hooks/useGame";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import { ArrowRightIcon } from "../components/Icons";
import { BADGE_CONFIG } from "../lib/constants";
import type { BadgeDefinition } from "../lib/types";

export default function BadgeCollectionPage() {
  const navigate = useNavigate();
  const playerId = localStorage.getItem("playerId");
  const lastTheme = sessionStorage.getItem("gameTheme") || "jerusalem";
  const [activeTheme, setActiveTheme] = useState<"jerusalem" | "pesach">(
    lastTheme as "jerusalem" | "pesach"
  );

  const { data, isLoading } = useBadgeCollection(playerId, activeTheme);

  const badges = data?.badges || [];
  const earnedCount = data?.earnedCount || 0;
  const totalCount = data?.totalCount || 12;
  const remaining = totalCount - earnedCount;
  const progressPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  const progressColor = activeTheme === "pesach" ? "#f97316" : "#2563eb";

  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border-card bg-bg-primary/80 p-4 backdrop-blur-md">
        <div className="w-10" />
        <h1 className="flex-1 text-center text-xl font-bold text-white">
          אוסף העיטורים שלי
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-card"
          aria-label="חזרה"
        >
          <ArrowRightIcon size={20} color="#8b95a8" />
        </button>
      </header>

      {/* Theme Toggle */}
      <div className="mx-4 mt-4 max-w-2xl md:mx-auto">
        <div className="flex rounded-xl border border-border-card bg-bg-card p-1">
          <button
            onClick={() => setActiveTheme("jerusalem")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
              activeTheme === "jerusalem"
                ? "bg-blue-primary text-white shadow-md"
                : "text-text-secondary hover:text-white"
            }`}
          >
            <span>🕌</span>
            <span>ירושלים</span>
          </button>
          <button
            onClick={() => setActiveTheme("pesach")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
              activeTheme === "pesach"
                ? "bg-orange-500 text-white shadow-md"
                : "text-text-secondary hover:text-white"
            }`}
          >
            <span>🍷</span>
            <span>פסח</span>
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="m-4 flex flex-col gap-4 rounded-xl border border-border-card bg-bg-card p-6 max-w-2xl md:mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <p className="text-sm font-medium text-text-secondary">התקדמות האוסף</p>
            <p className="text-2xl font-bold" style={{ color: progressColor }}>
              {earnedCount} / {totalCount}
            </p>
          </div>
          <p className="text-sm text-text-secondary">
            עוד {remaining} עיטורים לסיום האוסף
          </p>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[#1e2a45]">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: progressColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="px-4 pb-8 w-full max-w-2xl mx-auto">
        <h2 className="px-2 pb-4 pt-2 text-lg font-bold text-white">
          {activeTheme === "pesach" ? "עיטורי פסח" : "עיטורי ירושלים"}
        </h2>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-primary border-t-transparent" />
          </div>
        )}

        {!isLoading && !playerId && (
          <div className="mb-4 rounded-xl border border-blue-primary/20 bg-blue-primary/5 px-4 py-3 text-center">
            <p className="text-base font-semibold text-blue-light">
              התחל משחק כדי לאסוף עיטורים!
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-3 min-h-[44px] rounded-xl bg-blue-primary px-6 py-2.5 text-sm font-bold text-white"
            >
              התחל לשחק
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTheme}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4"
          >
            {badges.map((badge, i) => (
              <BadgeCard key={badge.id} badge={badge} index={i} theme={activeTheme} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
      <BottomNav variant="badges" />
    </div>
  );
}

function BadgeCard({
  badge,
  index,
  theme,
}: {
  badge: BadgeDefinition;
  index: number;
  theme: "jerusalem" | "pesach";
}) {
  const config = BADGE_CONFIG[badge.name];
  const borderColor = config?.borderColor || (theme === "pesach" ? "#f97316" : "#3b82f6");

  if (badge.earned) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className="flex flex-col items-center gap-3 rounded-xl border border-border-card bg-bg-card p-4 shadow-sm"
      >
        <div className="relative h-24 w-24">
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-full opacity-50 blur-sm"
            style={{
              background: `linear-gradient(135deg, ${borderColor}80, ${borderColor}40)`,
            }}
          />
          {/* Image */}
          <div
            className="relative h-full w-full rounded-full border-4 bg-cover bg-center bg-no-repeat shadow-lg"
            style={{
              borderColor,
              backgroundImage: `url(${badge.imageUrl})`,
            }}
          />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-white">{badge.name}</p>
          <p className="mt-1 text-xs leading-tight text-text-secondary">
            {badge.description}
          </p>
        </div>
      </motion.div>
    );
  }

  // Locked badge — show image dimmed with lock overlay
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#334155] bg-[#0a0f1a]/30 p-4"
    >
      <div className="relative h-24 w-24">
        {/* Dimmed image */}
        <div
          className="h-full w-full rounded-full border-4 border-[#334155] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: badge.imageUrl ? `url(${badge.imageUrl})` : undefined,
            backgroundColor: badge.imageUrl ? undefined : "#1e293b",
            filter: "grayscale(80%) brightness(35%)",
          }}
        />
        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="11" rx="2" fill="#475569" stroke="#64748b" strokeWidth="1.5" />
            <path
              d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-[#94a3b8]">{badge.name}</p>
        <p className="mt-1 text-xs leading-tight text-[#64748b]">
          {badge.description}
        </p>
      </div>
    </motion.div>
  );
}
