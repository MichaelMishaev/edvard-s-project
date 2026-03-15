import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  TrophyIcon,
  GamepadIcon,
  SettingsIcon,
  UserIcon,
  SwordsIcon,
  MilitaryTechIcon,
  CastleIcon,
} from "./Icons";

interface NavItem {
  path: string;
  label: string;
  icon: React.FC<{ size?: number; color?: string }>;
  disabled?: boolean;
}

interface BottomNavProps {
  variant?: "game" | "results" | "leaderboard" | "badges" | "hall-of-fame";
}

const navConfigs: Record<string, NavItem[]> = {
  game: [
    { path: "/", label: "בית", icon: HomeIcon },
    { path: "/game", label: "משחק", icon: GamepadIcon },
    { path: "/settings", label: "הגדרות", icon: SettingsIcon, disabled: true },
  ],
  results: [
    { path: "/", label: "בית", icon: HomeIcon },
    { path: "/hall-of-fame", label: "היכל", icon: CastleIcon },
    { path: "/badges", label: "עיטורים", icon: MilitaryTechIcon },
    { path: "/results", label: "תוצאות", icon: TrophyIcon },
  ],
  leaderboard: [
    { path: "/", label: "בית", icon: HomeIcon },
    { path: "/hall-of-fame", label: "היכל", icon: CastleIcon },
    { path: "/badges", label: "עיטורים", icon: MilitaryTechIcon },
    { path: "/leaderboard", label: "מובילים", icon: TrophyIcon },
  ],
  badges: [
    { path: "/hall-of-fame", label: "היכל", icon: CastleIcon },
    { path: "/badges", label: "עיטורים", icon: MilitaryTechIcon },
    { path: "/leaderboard", label: "מובילים", icon: TrophyIcon },
    { path: "/", label: "בית", icon: HomeIcon },
  ],
  "hall-of-fame": [
    { path: "/", label: "בית", icon: HomeIcon },
    { path: "/hall-of-fame", label: "היכל", icon: CastleIcon },
    { path: "/badges", label: "עיטורים", icon: MilitaryTechIcon },
    { path: "/leaderboard", label: "מובילים", icon: TrophyIcon },
  ],
};

export default function BottomNav({ variant = "game" }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = navConfigs[variant];
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (label: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(label);
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  };

  return (
    <>
      {/* "Coming soon" toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-bg-card px-5 py-2.5 shadow-lg border border-border-card"
          >
            <span className="text-sm font-medium text-text-secondary">
              {toast} - בקרוב!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-card bg-bg-primary shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
        aria-label="ניווט ראשי"
      >
        <div className="mx-auto flex max-w-md items-center justify-around py-2 px-2">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  if (item.disabled) {
                    showToast(item.label);
                    return;
                  }
                  navigate(item.path);
                }}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex min-h-[56px] min-w-[60px] flex-1 flex-col items-center justify-center gap-1.5 rounded-lg transition-all duration-200 ${
                  item.disabled
                    ? "opacity-40 cursor-not-allowed"
                    : isActive
                      ? "bg-blue-primary/10"
                      : "hover:bg-bg-card active:bg-bg-card-hover"
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-blue-light" />
                )}
                <item.icon
                  size={24}
                  color={isActive ? "#3b82f6" : "#5b6478"}
                />
                <span
                  className={`text-xs font-semibold ${
                    isActive ? "text-blue-light" : "text-text-muted"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
