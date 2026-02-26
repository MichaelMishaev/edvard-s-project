import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/Button";
import { PlayIcon, ChartIcon, CastleIcon, UserIcon } from "../components/Icons";
import { useCreatePlayer, useStartGame } from "../hooks/useGame";

export default function WelcomePage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const createPlayer = useCreatePlayer();
  const startGame = useStartGame();

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
        {/* Jerusalem panorama gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1a3a5c 0%, #2d5a7b 30%, #c4a86c 60%, #8b7a4a 80%, #0a0e1a 100%)",
          }}
        />
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-primary" />

        {/* Castle icon top-right */}
        <div className="absolute top-4 right-4 z-10 rounded-xl bg-white/20 p-2 backdrop-blur-sm">
          <CastleIcon size={28} color="white" />
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-8 left-0 right-0 z-10 text-center">
          <h1 className="font-heebo text-4xl font-extrabold tracking-tight text-white drop-shadow-lg">
            Jerusalem Quest
          </h1>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-blue-primary" />
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
        <h2 className="mt-6 text-center text-2xl font-bold text-white">
          !בואו נגלה את סודות ירושלים
        </h2>
        <p className="mt-2 text-center text-base text-text-secondary">
          צאו למסע מרתק בין סמטאות העיר העתיקה
        </p>

        {/* Name input */}
        <div className="mt-8 flex flex-col gap-2">
          <label className="text-left text-sm font-medium text-text-secondary">
            ?איך קוראים לך
          </label>
          <div className="relative">
            <input
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
              className="w-full rounded-full border border-border-card bg-bg-card px-6 py-4 pr-12 text-right text-lg text-white placeholder-text-muted outline-none transition-colors focus:border-blue-primary"
              dir="rtl"
            />
            <div className="absolute left-auto right-4 top-1/2 -translate-y-1/2 text-text-muted">
              <UserIcon size={20} color="#5b6478" />
            </div>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-error"
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
            icon={<PlayIcon size={20} color="white" />}
          >
            {isLoading ? "...מתחבר" : "התחל משחק"}
          </Button>
        </div>

        {/* Leaderboard link */}
        <div className="mt-auto pt-8">
          <button
            onClick={() => navigate("/leaderboard")}
            className="mx-auto flex items-center gap-2 text-blue-primary"
          >
            <ChartIcon size={20} color="#2563eb" />
            <span className="text-base font-medium">לוח תוצאות</span>
          </button>
        </div>

        {/* Attribution */}
        <p className="mt-4 text-center text-[10px] text-text-muted">
          Developed by Edvard
        </p>
      </motion.div>
    </div>
  );
}
