import { useState } from "react";
import { motion } from "framer-motion";
import BottomNav from "../components/BottomNav";
import { MedalIcon, BadgeStarIcon } from "../components/Icons";
import { useLeaderboard } from "../hooks/useGame";
import { getRankTitle, RANK_COLORS, AVATAR_COLORS, BADGE_CONFIG } from "../lib/constants";
import type { Player } from "../lib/types";

type FilterTab = "all" | "month" | "week";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const { data: leaderboard, isLoading } = useLeaderboard();

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "הכל" },
    { key: "month", label: "החודש" },
    { key: "week", label: "השבוע" },
  ];

  const entries: Player[] = leaderboard || [];

  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-xl font-bold text-white">טבלת האלופים</span>
        <MedalIcon size={28} color="#2563eb" />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-end gap-6 px-4 pt-4 pb-2 border-b border-border-subtle">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-blue-primary text-blue-primary"
                : "text-text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        <h3 className="mb-3 text-right text-lg font-bold text-white">מובילים</h3>

        {/* Column headers */}
        <div className="mb-2 flex items-center justify-between px-2 text-xs font-medium text-text-muted">
          <span>עיטורים</span>
          <span>ניקוד</span>
          <span className="flex-1 text-center">שם</span>
          <span>דרגה</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-primary border-t-transparent" />
          </div>
        )}

        {/* Player rows */}
        <div className="flex flex-col gap-3">
          {entries.map((entry, index) => (
            <PlayerRow key={entry.id} entry={entry} rank={index + 1} index={index} />
          ))}
        </div>

        {/* Empty state */}
        {!isLoading && entries.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-text-muted">עדיין אין שחקנים</p>
            <p className="mt-1 text-sm text-text-muted">היה הראשון לשחק!</p>
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
}: {
  entry: Player;
  rank: number;
  index: number;
}) {
  const isTop5 = rank <= 5;
  const rankColor = RANK_COLORS[rank];
  const avatarColor = AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length];
  const rankTitle = getRankTitle(entry.score);

  const scoreColor = rankColor?.text || "#ffffff";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
        isTop5
          ? "border border-border-card bg-bg-card"
          : ""
      }`}
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

      {/* Name + rank title */}
      <div className="flex flex-1 items-center gap-3 justify-end">
        <div className="text-right">
          <div className="text-sm font-bold text-white">{entry.name}</div>
          <div className="text-[10px] text-text-muted">{rankTitle}</div>
        </div>

        {/* Avatar */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold text-white"
          style={{ borderColor: avatarColor, backgroundColor: `${avatarColor}22` }}
        >
          {entry.name.charAt(0)}
        </div>
      </div>

      {/* Rank number */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
        style={{
          color: rankColor?.text || "#8b95a8",
          backgroundColor: rankColor?.bg || "transparent",
        }}
      >
        {rank}
      </div>
    </motion.div>
  );
}
