import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useBadgeCollection } from "../hooks/useGame";
import BottomNav from "../components/BottomNav";
import { ArrowRightIcon } from "../components/Icons";
import { BADGE_CONFIG } from "../lib/constants";
import type { BadgeDefinition } from "../lib/types";

export default function BadgeCollectionPage() {
  const navigate = useNavigate();
  const playerId = sessionStorage.getItem("playerId");
  const { data, isLoading } = useBadgeCollection(playerId);

  const badges = data?.badges || [];
  const earnedCount = data?.earnedCount || 0;
  const totalCount = data?.totalCount || 12;
  const remaining = totalCount - earnedCount;
  const progressPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary pb-20">
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

      {/* Progress Section */}
      <div className="m-4 flex flex-col gap-4 rounded-xl border border-border-card bg-bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <p className="text-sm font-medium text-text-secondary">התקדמות האוסף</p>
            <p className="text-2xl font-bold text-blue-primary">
              {earnedCount} / {totalCount}
            </p>
          </div>
          <p className="text-sm text-text-secondary">
            עוד {remaining} עיטורים לסיום האוסף
          </p>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[#1e2a45]">
          <motion.div
            className="h-full rounded-full bg-blue-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="px-4 pb-8">
        <h2 className="px-2 pb-4 pt-2 text-lg font-bold text-white">
          העיטורים שלי
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

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {!isLoading && !playerId
            ? Object.keys(BADGE_CONFIG).slice(0, 12).map((badgeName, i) => (
                <BadgeCard
                  key={badgeName}
                  badge={{ id: badgeName, name: badgeName, description: "השג כדי לגלות...", imageUrl: "", earned: false }}
                  index={i}
                />
              ))
            : badges.map((badge, i) => <BadgeCard key={badge.id} badge={badge} index={i} />)
          }
        </div>
      </div>

      <BottomNav variant="badges" />
    </div>
  );
}

function BadgeCard({ badge, index }: { badge: BadgeDefinition; index: number }) {
  const config = BADGE_CONFIG[badge.name];
  const borderColor = config?.borderColor || "#3b82f6";

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

  // Locked badge
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 0.6, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#334155] bg-[#0a0f1a]/30 p-4"
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1e293b]">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="11" rx="2" stroke="#475569" strokeWidth="2" />
          <path
            d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11"
            stroke="#475569"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-[#94a3b8]">{badge.name}</p>
        <p className="mt-1 text-xs leading-tight text-[#64748b]">
          {badge.description}
        </p>
      </div>
    </motion.div>
  );
}
