import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getBadgeDefinitions } from "../lib/api";
import Button from "./Button";

interface BadgePopupProps {
  badgeNames: string[];
  theme: string;
  onClose: () => void;
}

const BURST_COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#a855f7", "#ec4899"];
const BURST_PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: Math.cos((i / 8) * 2 * Math.PI) * 110 + (i % 2 === 0 ? 20 : -20),
  y: Math.sin((i / 8) * 2 * Math.PI) * 80 + (i % 3 === 0 ? 15 : -15),
  color: BURST_COLORS[i % BURST_COLORS.length],
  size: 6 + (i % 3) * 3,
}));

export default function BadgePopup({ badgeNames, theme, onClose }: BadgePopupProps) {
  const { data: allBadges = [] } = useQuery({
    queryKey: ["badge-definitions", theme],
    queryFn: () => getBadgeDefinitions(theme),
    staleTime: 60000,
  });

  // Filter to only the badges earned in this game
  const earnedBadges = allBadges.filter((b) => badgeNames.includes(b.name));

  // Fall back to name-only display while loading
  const displayBadges =
    earnedBadges.length > 0
      ? earnedBadges
      : badgeNames.map((name) => ({ id: name, name, description: "", imageUrl: "", earned: true }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-sm rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl overflow-hidden max-h-[90dvh] overflow-y-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Burst particles */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          {BURST_PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{ width: p.size, height: p.size, backgroundColor: p.color }}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: p.x, y: p.y, opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-8 text-center">
          <div className="text-5xl leading-none" role="img" aria-label="תג">
            🏅
          </div>
          <h2 className="text-2xl font-extrabold text-white">!קיבלת תגים</h2>
          <p className="text-sm text-white/70">!כל הכבוד! הרווחת את התגים הבאים</p>

          {/* Badge grid — same style as BadgeCollectionPage */}
          <div className="flex flex-wrap items-start justify-center gap-6 py-2">
            {displayBadges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="relative h-20 w-20">
                  {/* Glow */}
                  <div
                    className="absolute inset-0 rounded-full opacity-50 blur-sm"
                    style={{
                      background: "linear-gradient(135deg, #3b82f680, #3b82f640)",
                    }}
                  />
                  {/* Image */}
                  {badge.imageUrl ? (
                    <div
                      className="relative h-full w-full rounded-full border-4 border-blue-500 bg-cover bg-center bg-no-repeat shadow-lg"
                      style={{ backgroundImage: `url(${badge.imageUrl})` }}
                    />
                  ) : (
                    <div className="relative h-full w-full rounded-full border-4 border-blue-500 bg-[#1e2a45]" />
                  )}
                </div>
                <span className="text-sm font-bold text-white">{badge.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Close button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full mt-2"
          >
            <Button onClick={onClose}>!יאללה, בוא נראה את הניקוד</Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
