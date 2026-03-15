import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BottomNav from "../components/BottomNav";
import { MedalIcon, BadgeStarIcon } from "../components/Icons";
import { useClassLeaderboard, useSchoolLeaderboard } from "../hooks/useGame";
import { getRankTitle, RANK_COLORS, AVATAR_COLORS, BADGE_CONFIG } from "../lib/constants";
import type { Player } from "../lib/types";

type LeaderboardView = "class" | "school";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [playerClassName, setPlayerClassName] = useState<string | null>(null);
  const [view, setView] = useState<LeaderboardView>("school");

  useEffect(() => {
    const className = sessionStorage.getItem("playerClassName");
    setPlayerClassName(className);
    if (className) setView("class");
  }, []);

  const { data: classLeaderboard, isLoading: isLoadingClass } = useClassLeaderboard(playerClassName);
  const { data: schoolLeaderboard, isLoading: isLoadingSchool } = useSchoolLeaderboard();

  const entries: Player[] = view === "class" ? (classLeaderboard || []) : (schoolLeaderboard || []);
  const isLoading = view === "class" ? isLoadingClass : isLoadingSchool;

  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-xl font-bold text-white">טבלת האלופים</span>
        <MedalIcon size={28} color="#2563eb" />
      </div>

      {/* Toggle Buttons */}
      <div className="mx-4 mt-4 flex gap-2 rounded-xl bg-bg-card p-1">
        <button
          onClick={() => setView("school")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            view === "school"
              ? "bg-blue-primary text-white"
              : "text-text-muted hover:text-white"
          }`}
        >
          כל בית הספר
        </button>
        {playerClassName && (
          <button
            onClick={() => setView("class")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              view === "class"
                ? "bg-blue-primary text-white"
                : "text-text-muted hover:text-white"
            }`}
          >
            הכיתה שלי
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        <h3 className="mb-3 text-right text-lg font-bold text-white">
          {view === "class" ? "מובילי הכיתה" : "מובילי בית הספר"}
        </h3>

        {/* Column headers */}
        <div
          className="mb-2 flex items-center justify-between px-2 text-xs font-medium text-text-muted"
          aria-hidden="true"
        >
          <span>עיטורים</span>
          <span>ניקוד</span>
          <span className="flex-1 text-center">שם</span>
          <span>דרגה</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12" role="status" aria-label="טוען נתונים">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-primary border-t-transparent" />
          </div>
        )}

        {/* Player rows */}
        <div className="flex flex-col gap-3" role="list" aria-label="רשימת שחקנים">
          {entries.map((entry, index) => (
            <PlayerRow
              key={entry.id}
              entry={entry}
              rank={index + 1}
              index={index}
              view={view}
            />
          ))}
        </div>

        {/* Empty state */}
        {!isLoading && entries.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="text-5xl" aria-hidden="true">🏆</span>
            <div>
              <p className="text-lg font-bold text-white">עדיין אין שחקנים</p>
              <p className="mt-1 text-sm text-text-secondary">היה הראשון לשחק!</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="min-h-[48px] rounded-xl bg-blue-primary px-8 py-3 text-base font-bold text-white"
            >
              התחל לשחק
            </button>
          </div>
        )}
      </div>

      <BottomNav variant="leaderboard" />
    </div>
  );
}

function PlayerRow({
  entry,
  rank,
  index,
  view,
}: {
  entry: Player;
  rank: number;
  index: number;
  view: LeaderboardView;
}) {
  const isTopHighlight = view === "class" ? rank <= 3 : rank <= 10;
  const rankColor = view === "class" && rank <= 3 ? RANK_COLORS[rank] : undefined;

  // School view gradient for top 10
  const getSchoolTopGradient = (rank: number): string => {
    if (view !== "school" || rank > 10) return "";
    const opacity = 0.15 - (rank - 1) * 0.015; // Fade from 15% to 1.5%
    return `rgba(37, 99, 235, ${opacity})`;
  };

  const avatarColor = AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length];
  const rankTitle = getRankTitle(entry.score);
  const scoreColor = rankColor?.text || "#ffffff";

  const bgStyle = view === "school" && rank <= 10
    ? { backgroundColor: getSchoolTopGradient(rank) }
    : {};

  return (
    <motion.div
      role="listitem"
      aria-label={`מקום ${rank}: ${entry.name}, ניקוד ${entry.score}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
        isTopHighlight
          ? "border border-border-card bg-bg-card"
          : ""
      }`}
      style={{
        ...bgStyle,
        boxShadow: view === "class" && rank === 1
          ? "0 0 20px rgba(245,158,11,0.15)"
          : view === "class" && rank === 2
            ? "0 0 15px rgba(156,163,175,0.1)"
            : view === "class" && rank === 3
              ? "0 0 15px rgba(217,119,6,0.1)"
              : undefined,
      }}
    >
      {/* Badges (far left) */}
      <div className="flex items-center gap-0.5 w-16 justify-start">
        {entry.badges.slice(0, 3).map((badge, i) => {
          const config = BADGE_CONFIG[badge];
          const color = config?.color || "#9ca3af";
          return (
            <BadgeStarIcon key={i} size={14} color={color} />
          );
        })}
      </div>

      {/* Score */}
      <div className="w-16 text-center">
        <span
          className="text-lg font-bold"
          style={{ color: scoreColor }}
        >
          {entry.score.toLocaleString()}
        </span>
      </div>

      {/* Name + rank title + class (school view) */}
      <div className="flex flex-1 items-center gap-3 justify-end">
        <div className="text-right">
          <div className="text-sm font-bold text-white">{entry.name}</div>
          <div className="text-xs text-text-muted">
            {view === "school" && entry.className ? (
              <>
                {rankTitle} • {entry.className}
              </>
            ) : (
              rankTitle
            )}
          </div>
        </div>

        {/* Avatar */}
        <div
          className={`flex ${rank === 1 ? "h-12 w-12 text-base" : "h-10 w-10 text-sm"} shrink-0 items-center justify-center rounded-full border-2 font-bold text-white`}
          style={{ borderColor: avatarColor, backgroundColor: `${avatarColor}22` }}
          aria-hidden="true"
        >
          {entry.name.charAt(0)}
        </div>
      </div>

      {/* Rank number */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center ${rank <= 3 ? "rounded-full" : "rounded-lg"} text-sm font-bold`}
        style={{
          color: rankColor?.text || "#8b95a8",
          backgroundColor: rankColor?.bg || "transparent",
        }}
        aria-hidden="true"
      >
        {rank}
      </div>
    </motion.div>
  );
}
