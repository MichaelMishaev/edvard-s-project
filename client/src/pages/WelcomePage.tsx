import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/Button";
import Footer from "../components/Footer";
import { PlayIcon, ChartIcon, CastleIcon, UserIcon, MedalIcon, BadgeStarIcon } from "../components/Icons";
import { useCreatePlayer, useStartGame, useLeaderboard } from "../hooks/useGame";
import { RANK_COLORS, AVATAR_COLORS, BADGE_CONFIG } from "../lib/constants";
import type { Player } from "../lib/types";

export default function WelcomePage() {
  const [name, setName] = useState(() => {
    // Preserve player name for quick replay (Fix #17)
    return sessionStorage.getItem("playerName") || "";
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const createPlayer = useCreatePlayer();
  const startGame = useStartGame();
  const { data: leaderboard } = useLeaderboard();
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Preload hero image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setHeroLoaded(true);
    img.src = "/images/ui/jerusalem-hero.png";
    // If image doesn't exist, still show gradient fallback
    img.onerror = () => setHeroLoaded(false);
  }, []);

  const validateName = (value: string): string | null => {
    if (!value.trim()) return "יש להזין שם";
    if (value.trim().length > 15) return "השם ארוך מדי (עד 15 תווים)";
    if (/[^a-zA-Zא-ת0-9\s]/.test(value.trim()))
      return "אין להשתמש בתווים מיוחדים";
    return null;
  };

  const handleStart = async () => {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");
      const player = await createPlayer.mutateAsync(name.trim());

      sessionStorage.setItem("playerId", player.id);
      sessionStorage.setItem("playerName", player.name);

      const gameData = await startGame.mutateAsync(player.id);

      sessionStorage.setItem("sessionId", gameData.sessionId);
      sessionStorage.setItem("questions", JSON.stringify(gameData.questions));

      navigate("/game");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || "שגיאה בהתחברות לשרת, נסה שוב";
      setError(msg);
    }
  };

  const isLoading = createPlayer.isPending || startGame.isPending;

  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary">
      {/* Hero Image Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[45vh] min-h-[280px] overflow-hidden"
      >
        {/* Jerusalem panorama - real image or gradient fallback */}
        {heroLoaded ? (
          <img
            src="/images/ui/jerusalem-hero.png"
            alt="נוף פנורמי של ירושלים"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #1a3a5c 0%, #2d5a7b 30%, #c4a86c 60%, #8b7a4a 80%, #0a0e1a 100%)",
            }}
          />
        )}
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-bg-primary" />

        {/* Castle icon top-right */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          className="absolute top-4 end-4 z-10 rounded-xl bg-white/20 p-2 backdrop-blur-sm"
          aria-hidden="true"
        >
          <CastleIcon size={28} color="white" />
        </motion.div>

        {/* Title overlay */}
        <div className="absolute bottom-8 left-0 right-0 z-10 text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-heebo text-4xl font-extrabold tracking-tight text-white drop-shadow-lg"
          >
            Jerusalem Quest
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mx-auto mt-2 h-1 w-16 rounded-full bg-blue-primary"
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex flex-1 flex-col px-6 pb-8"
      >
        {/* Hebrew subtitle */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-2xl font-bold text-white"
        >
          !בואו נגלה את סודות ירושלים
        </motion.h2>
        <p className="mt-2 text-center text-base text-white/70 drop-shadow-sm">
          צאו למסע מרתק בין סמטאות העיר העתיקה
        </p>

        {/* Name input - compact design */}
        <div className="mt-8 flex flex-col gap-1.5">
          <label
            htmlFor="player-name"
            className="text-end text-xs font-medium text-text-secondary"
          >
            ?איך קוראים לך
          </label>
          <div className="relative">
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleStart();
              }}
              placeholder="...הכנס שם"
              maxLength={15}
              aria-invalid={!!error}
              aria-describedby={error ? "name-error" : undefined}
              className="w-full rounded-xl border border-border-card bg-bg-card px-4 py-2.5 pe-10 text-right text-base text-white placeholder-text-muted outline-none transition-colors focus:border-blue-primary focus:ring-2 focus:ring-blue-primary/20"
              dir="rtl"
            />
            <div className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">
              <UserIcon size={16} color="#5b6478" />
            </div>
          </div>
          {error && (
            <motion.p
              id="name-error"
              role="alert"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-xs text-error"
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Start button */}
        <div className="mt-6">
          <Button
            onClick={handleStart}
            disabled={isLoading}
            aria-label={isLoading ? "מתחבר לשרת" : "התחל משחק"}
            icon={
              isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <PlayIcon size={20} color="white" />
              )
            }
          >
            {isLoading ? "...מתחבר" : "התחל משחק"}
          </Button>
        </div>

        {/* Leaderboard Preview */}
        {leaderboard && leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-auto pt-8"
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => navigate("/leaderboard")}
                className="flex items-center gap-1.5 text-blue-primary"
                aria-label="צפה בלוח תוצאות המלא"
              >
                <ChartIcon size={18} color="#2563eb" />
                <span className="text-sm font-medium">צפה בכולם</span>
              </button>
              <h3 className="text-sm font-bold text-white">מובילים</h3>
            </div>

            {/* Top 3 Mini Cards */}
            <div className="space-y-2">
              {leaderboard.slice(0, 3).map((player: Player, index: number) => {
                const rank = index + 1;
                const rankColor = RANK_COLORS[rank];
                const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-2.5 rounded-xl border border-border-card bg-bg-card/50 px-3 py-2"
                  >
                    {/* Rank Badge */}
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{
                        color: rankColor?.text || "#8b95a8",
                        backgroundColor: rankColor?.bg || "transparent",
                      }}
                      aria-label={`מקום ${rank}`}
                    >
                      {rank}
                    </div>

                    {/* Avatar */}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold text-white"
                      style={{
                        borderColor: avatarColor,
                        backgroundColor: `${avatarColor}22`,
                      }}
                      aria-hidden="true"
                    >
                      {player.name.charAt(0)}
                    </div>

                    {/* Name */}
                    <div className="flex-1 text-right">
                      <div className="text-sm font-bold text-white">{player.name}</div>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                      <span
                        className="text-sm font-bold"
                        style={{ color: rankColor?.text || "#ffffff" }}
                      >
                        {player.score}
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-0.5">
                      {player.badges.slice(0, 2).map((badge, i) => {
                        const config = BADGE_CONFIG[badge];
                        const color = config?.color || "#9ca3af";
                        return <BadgeStarIcon key={i} size={12} color={color} />;
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Leaderboard link (fallback when no data) */}
        {(!leaderboard || leaderboard.length === 0) && (
          <div className="mt-auto pt-8">
            <button
              onClick={() => navigate("/leaderboard")}
              className="mx-auto flex min-h-[48px] items-center gap-2 text-blue-primary"
              aria-label="צפה בלוח תוצאות"
            >
              <ChartIcon size={20} color="#2563eb" />
              <span className="text-base font-medium">לוח תוצאות</span>
            </button>
          </div>
        )}

        {/* Attribution */}
        <Footer />
      </motion.div>
    </div>
  );
}
