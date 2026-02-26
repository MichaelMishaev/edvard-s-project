import { useNavigate, useLocation } from "react-router-dom";
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
}

interface BottomNavProps {
  variant?: "game" | "results" | "leaderboard";
}

const navConfigs: Record<string, NavItem[]> = {
  game: [
    { path: "/", label: "בית", icon: HomeIcon },
    { path: "/game", label: "משחק", icon: GamepadIcon },
    { path: "/settings", label: "הגדרות", icon: SettingsIcon },
  ],
  results: [
    { path: "/", label: "בית", icon: HomeIcon },
    { path: "/results", label: "תוצאות", icon: TrophyIcon },
    { path: "/profile", label: "פרופיל", icon: UserIcon },
  ],
  leaderboard: [
    { path: "/", label: "בית", icon: HomeIcon },
    { path: "/training", label: "אימון", icon: SwordsIcon },
    { path: "/leaderboard", label: "מובילים", icon: TrophyIcon },
    { path: "/profile", label: "פרופיל", icon: UserIcon },
  ],
};

export default function BottomNav({ variant = "game" }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = navConfigs[variant];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-card bg-bg-primary">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                if (item.path === "/settings" || item.path === "/training" || item.path === "/profile") return;
                navigate(item.path);
              }}
              className="flex flex-col items-center gap-1 px-4 py-1"
            >
              <item.icon
                size={22}
                color={isActive ? "#2563eb" : "#5b6478"}
              />
              <span
                className={`text-[10px] font-medium ${isActive ? "text-blue-primary" : "text-text-muted"}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
