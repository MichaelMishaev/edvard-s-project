import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import { MedalIcon, BadgeStarIcon } from "../components/Icons";
import { useClassLeaderboard, useSchoolLeaderboard } from "../hooks/useGame";
import { getRankTitle, RANK_COLORS, AVATAR_COLORS, BADGE_CONFIG, formatClassName, CLASSES } from "../lib/constants";
import type { Player } from "../lib/types";

type LeaderboardView = "class" | "school";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<LeaderboardView>("school");
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    return sessionStorage.getItem("playerClassName") || CLASSES[0].id;
  });

  useEffect(() => {
    const className = sessionStorage.getItem("playerClassName");
    if (className) {
      setSelectedClass(className);
      setView("class");
    }
  }, []);

  const { data: classLeaderboard, isLoading: isLoadingClass } = useClassLeaderboard(selectedClass);
  const { data: schoolLeaderboard, isLoading: isLoadingSchool } = useSchoolLeaderboard();

  const entries: Player[] = view === "class" ? (classLeaderboard || []) : (schoolLeaderboard || []);
  const isLoading = view === "class" ? isLoadingClass : isLoadingSchool;

  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 w-full max-w-2xl mx-auto">
        <span className="text-xl font-bold text-white">טבלת האלופים</span>
        <MedalIcon size={28} color="#2563eb" />
      </div>

      {/* Toggle Buttons */}
      <div className="mx-4 mt-4 flex gap-2 rounded-xl bg-bg-card p-1 max-w-2xl md:mx-auto">
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
        <button
          onClick={() => setView("class")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            view === "class"
              ? "bg-blue-primary text-white"
              : "text-text-muted hover:text-white"
          }`}
        >
          לפי כיתה
        </button>
      </div>

      {/* Class picker — only shown in class view */}
      {view === "class" && (
        <div className="mx-4 mt-3 max-w-2xl md:mx-auto">
          <ClassPicker value={selectedClass} onChange={setSelectedClass} />
        </div>
      )}

      {/* Content */}
      <div className="px-4 pt-6 w-full max-w-2xl mx-auto">
        <h3 className="mb-3 text-right text-lg font-bold text-white">
          {view === "class"
            ? `מובילי כיתה ${CLASSES.find(c => c.id === selectedClass)?.label ?? ""}`
            : "מובילי בית הספר"}
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

      <Footer />
      <BottomNav variant="leaderboard" />
    </div>
  );
}

const CLASS_GROUPS = [
  { grade: "ד׳", ids: ["dalet1", "dalet2", "dalet3", "dalet4"] },
  { grade: "ה׳", ids: ["heh1", "heh2", "heh3", "heh4"] },
  { grade: "ו׳", ids: ["vav1", "vav2", "vav3", "vav4"] },
];

function ClassPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = CLASSES.find((c) => c.id === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} dir="rtl">
      {/* ── Desktop: badge grid ── */}
      <div className="hidden md:block">
        <p className="mb-3 text-right text-xs font-medium text-text-muted">בחר כיתה</p>
        <div className="flex flex-wrap justify-end gap-3">
          {CLASSES.map((cls) => {
            const isSelected = cls.id === value;
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => onChange(cls.id)}
                title={`כיתה ${cls.label}`}
                className={`group relative flex flex-col items-center transition-all duration-150 active:scale-95 focus:outline-none ${
                  isSelected ? "scale-110" : "opacity-70 hover:opacity-100 hover:scale-105"
                }`}
              >
                <div className={`relative rounded-xl overflow-hidden ${isSelected ? "ring-2 ring-blue-primary shadow-lg shadow-blue-primary/40" : "ring-1 ring-white/10 hover:ring-white/30"}`}
                  style={{ width: 72, height: 72 }}>
                  <img
                    src={`/images/class-badges/${cls.id}.png`}
                    alt={`כיתה ${cls.label}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-primary/20 flex items-center justify-center">
                      <svg className="h-6 w-6 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className={`mt-1 text-xs font-bold ${isSelected ? "text-blue-primary" : "text-text-muted"}`}>
                  {cls.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Mobile: dropdown ── */}
      <div className="relative md:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-blue-primary bg-blue-primary/10 px-4 py-3.5 transition-all hover:bg-blue-primary/20 focus:outline-none active:scale-[0.98]"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="בחר כיתה"
        >
          <div className="flex flex-1 flex-col items-end gap-0.5">
            <span className="text-xs font-medium text-blue-primary/80">כיתה נבחרת</span>
            <span className="text-lg font-bold text-white">{selected ? `כיתה ${selected.label}` : "בחר כיתה"}</span>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-primary">
            <svg
              className={`h-5 w-5 text-white transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              role="listbox"
              aria-label="רשימת כיתות"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 w-full overflow-y-auto rounded-xl border border-white/15 bg-bg-card shadow-xl"
              style={{ maxHeight: "260px" }}
            >
              {CLASSES.map((cls) => {
                const isSelected = cls.id === value;
                return (
                  <li
                    key={cls.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => { onChange(cls.id); setOpen(false); }}
                    className={`flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-white/8 ${
                      isSelected ? "bg-blue-primary/10 text-blue-primary" : "text-white"
                    }`}
                  >
                    {isSelected && (
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className="flex-1 text-right">כיתה {cls.label}</span>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
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
            {entry.className ? (
              <>
                {rankTitle} • {formatClassName(entry.className)}
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
