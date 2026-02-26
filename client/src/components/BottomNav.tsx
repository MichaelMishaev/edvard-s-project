import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  TrophyIcon,
  GamepadIcon,
  SettingsIcon,
  UserIcon,
  SwordsIcon,
} from "./Icons";

interface NavItem {
  path: string;
  label: string;
  icon: React.FC<{ size?: number; color?: string }>;
  disabled?: boolean;
}

interface BottomNavProps {
  variant?: "game" | "results" | "leaderboard";
}

const navConfigs: Record<string, NavItem[]> = {
  game: [
    { path: "/", label: "בית", icon: HomeIcon },
    { path: "/game", label: "משחק", icon: GamepadIcon },
    { path: "/settings", label: "הגדרות", icon: SettingsIcon, disabled: true },
  ],
  results: [
    { path: "/", label: "בית", icon: HomeIcon },
    { path: "/results", label: "תוצאות", icon: TrophyIcon },
    { path: "/profile", label: "פרופיל", icon: UserIcon, disabled: true },
  ],
  leaderboard: [
    { path: "/", label: "בית", icon: HomeIcon },
    { path: "/training", label: "אימון", icon: SwordsIcon, disabled: true },
    { path: "/leaderboard", label: "מובילים", icon: TrophyIcon },
    { path: "/profile", label: "פרופיל", icon: UserIcon, disabled: true },
  ],
};

export default function BottomNav({ variant = "game" }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = navConfigs[variant];
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (label: string) => {
    setToast(label);
    setTimeout(() => setToast(null), 2000);
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
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-card bg-bg-primary"
        aria-label="ניווט ראשי"
      >
        <div className="mx-auto flex max-w-md items-center justify-around py-2">
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
                className={`flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-1 px-4 py-1 ${
                  item.disabled ? "opacity-50" : ""
                }`}
              >
                <item.icon
                  size={22}
                  color={isActive ? "#2563eb" : "#5b6478"}
                />
                <span
                  className={`text-xs font-medium ${isActive ? "text-blue-primary" : "text-text-muted"}`}
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
