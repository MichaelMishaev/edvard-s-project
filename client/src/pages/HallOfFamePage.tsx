import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../components/BottomNav";
import { MedalIcon, BadgeStarIcon } from "../components/Icons";
import { useHallOfFame } from "../hooks/useGame";
import { RANK_COLORS, BADGE_CONFIG } from "../lib/constants";
import type { HallOfFameContest } from "../lib/types";

export default function HallOfFamePage() {
  const navigate = useNavigate();
  const { data: contests, isLoading } = useHallOfFame();
  const [expandedContest, setExpandedContest] = useState<number | null>(null);

  const toggleContest = (weekNumber: number) => {
    setExpandedContest(expandedContest === weekNumber ? null : weekNumber);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary pb-20">
      {/* Header with Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-4 pt-6"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Jerusalem Quest Logo */}
          <div className="relative">
            <img
              src="/logo.png"
              alt="לוגו מסע ירושלים"
              className="h-40 w-40 rounded-full border-4 border-blue-primary/30 object-cover shadow-xl"
            />
            <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
              <MedalIcon size={24} color="#ffffff" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white">היכל התהילה</h1>
            <p className="mt-2 text-sm text-text-secondary">
              אלופי התחרויות הקודמות
            </p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 pt-6">
        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12" role="status" aria-label="טוען נתונים">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-primary border-t-transparent" />
          </div>
        )}

        {/* Contest List */}
        <div className="flex flex-col gap-4" role="list" aria-label="תחרויות קודמות">
          {contests?.map((contest, index) => (
            <ContestCard
              key={contest.weekNumber}
              contest={contest}
              index={index}
              isExpanded={expandedContest === contest.weekNumber}
              onToggle={() => toggleContest(contest.weekNumber)}
            />
          ))}
        </div>

        {/* Empty state */}
        {!isLoading && (!contests || contests.length === 0) && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="text-5xl" aria-hidden="true">🏰</span>
            <div>
              <p className="text-lg font-bold text-white">עדיין אין תחרויות קודמות</p>
              <p className="mt-1 text-sm text-text-secondary">התחרות הראשונה תופיע כאן בקרוב!</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="min-h-[48px] rounded-xl bg-blue-primary px-8 py-3 text-base font-bold text-white"
            >
              שחק עכשיו
            </button>
          </div>
        )}
      </div>

      <BottomNav variant="hall-of-fame" />
    </div>
  );
}

interface ContestCardProps {
  contest: HallOfFameContest;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function ContestCard({ contest, index, isExpanded, onToggle }: ContestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="overflow-hidden rounded-2xl border border-border-card bg-bg-card"
    >
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-4 text-right transition-colors hover:bg-white/5"
        aria-expanded={isExpanded}
        aria-controls={`contest-${contest.weekNumber}`}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon size={20} color="#8b95a8" />
        </motion.div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">שבוע {contest.weekNumber}</h3>
          <p className="mt-0.5 text-xs text-text-muted">{contest.dateRange}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {contest.totalParticipants} משתתפים
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-primary/20 to-purple-600/20">
          <MedalIcon size={24} color="#f59e0b" />
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`contest-${contest.weekNumber}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border-card px-4 pb-4 pt-3">
              {/* Class Champions */}
              <div className="mb-6">
                <h4 className="mb-3 text-right text-sm font-bold text-white">
                  אלופי הכיתות
                </h4>
                <div className="space-y-2">
                  {contest.classChampions.map((champion, i) => {
                    const rankColor = RANK_COLORS[champion.rank];
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-border-card bg-bg-primary/50 px-3 py-2.5"
                      >
                        {/* Rank badge */}
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                          style={{
                            color: rankColor?.text || "#8b95a8",
                            backgroundColor: rankColor?.bg || "transparent",
                          }}
                        >
                          {champion.rank}
                        </div>

                        {/* Score */}
                        <div className="w-14 text-center text-sm font-bold text-white">
                          {champion.score}
                        </div>

                        {/* Name + Class */}
                        <div className="flex-1 text-right">
                          <div className="text-sm font-bold text-white">
                            {champion.playerName}
                          </div>
                          <div className="text-xs text-text-muted">
                            {champion.className}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* School Top 10 */}
              <div className="mb-6">
                <h4 className="mb-3 text-right text-sm font-bold text-white">
                  מובילי בית הספר
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="border-b border-border-card">
                        <th className="pb-2 pr-2 text-xs font-medium text-text-muted">
                          ניקוד
                        </th>
                        <th className="pb-2 text-xs font-medium text-text-muted">כיתה</th>
                        <th className="pb-2 text-xs font-medium text-text-muted">שם</th>
                        <th className="pb-2 pl-2 text-xs font-medium text-text-muted">
                          דרגה
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {contest.schoolTop10.map((player, i) => (
                        <tr
                          key={i}
                          className={`border-b border-border-card/50 ${
                            i <= 2 ? "bg-blue-primary/5" : ""
                          }`}
                        >
                          <td className="py-2 pr-2 font-bold text-white">
                            {player.score}
                          </td>
                          <td className="py-2 text-text-secondary">
                            {player.className}
                          </td>
                          <td className="py-2 text-white">{player.playerName}</td>
                          <td className="py-2 pl-2 font-bold text-blue-primary">
                            {player.rank}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Badge Statistics */}
              <div>
                <h4 className="mb-3 text-right text-sm font-bold text-white">
                  סטטיסטיקת עיטורים
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {contest.badgeStats.map((stat, i) => {
                    const config = BADGE_CONFIG[stat.badgeName];
                    const color = config?.color || "#9ca3af";
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg bg-bg-primary/50 px-3 py-2"
                      >
                        <span className="text-sm font-bold text-white">{stat.count}</span>
                        <BadgeStarIcon size={14} color={color} />
                        <span className="flex-1 text-right text-xs text-text-muted">
                          {stat.badgeName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ChevronDownIcon({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
