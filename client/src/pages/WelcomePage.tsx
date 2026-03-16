import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/Button";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import ContestTimer from "../components/ContestTimer";
import CharacterCounter from "../components/CharacterCounter";
import ValidationIcon, { type ValidationState } from "../components/ValidationIcon";
import ClassSelector from "../components/ClassSelector";
import { PlayIcon, ChartIcon, CastleIcon, UserIcon, MedalIcon, BadgeStarIcon } from "../components/Icons";
import { useCreatePlayer, useStartGame, useLeaderboard, useCurrentContest } from "../hooks/useGame";
import { RANK_COLORS, AVATAR_COLORS, BADGE_CONFIG, CLASSES } from "../lib/constants";
import type { Player } from "../lib/types";
import { validateName, validateClass, debounce } from "../utils/formValidation";
import AboutProjectModal from "../components/AboutProjectModal";

export default function WelcomePage() {
  const [name, setName] = useState(() => {
    // Preserve player name for quick replay (Fix #17)
    return sessionStorage.getItem("playerName") || "";
  });
  const [selectedClass, setSelectedClass] = useState(() => {
    return sessionStorage.getItem("playerClassName") || "";
  });
  const [selectedTheme, setSelectedTheme] = useState<"jerusalem" | "pesach">("jerusalem");
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [error, setError] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [validationState, setValidationState] = useState<{
    name: ValidationState;
    class: ValidationState;
  }>({
    name: "idle",
    class: "idle",
  });
  const navigate = useNavigate();
  const createPlayer = useCreatePlayer();
  const startGame = useStartGame();
  const { data: leaderboard } = useLeaderboard();
  const { data: contest } = useCurrentContest();
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const heroSrc = selectedTheme === "pesach"
    ? "/images/ui/pesach-hero.png"
    : "/images/ui/jerusalem-hero.png";

  // Track the currently visible image src — only swaps when new image is ready
  const [visibleHeroSrc, setVisibleHeroSrc] = useState<string | null>(null);

  // Preload hero image when theme changes, swap only when loaded (no flicker)
  useEffect(() => {
    const img = new Image();
    img.onload = () => setVisibleHeroSrc(heroSrc);
    img.onerror = () => setVisibleHeroSrc(null);
    img.src = heroSrc;
  }, [heroSrc]);

  // Real-time validation with debouncing
  const validateNameDebounced = useCallback(
    debounce((value: string) => {
      const result = validateName(value);
      setValidationState((prev) => ({
        ...prev,
        name: result.isValid ? "valid" : "invalid",
      }));
    }, 500),
    []
  );

  const validateClassDebounced = useCallback(
    debounce((value: string) => {
      const result = validateClass(value);
      setValidationState((prev) => ({
        ...prev,
        class: result.isValid ? "valid" : "invalid",
      }));
    }, 300),
    []
  );

  // Clear error timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleStart = async () => {
    // Validate name
    const nameResult = validateName(name);
    if (!nameResult.isValid) {
      setError(nameResult.error!);
      setValidationState((prev) => ({ ...prev, name: "invalid" }));
      setSubmissionStatus("error");
      return;
    }

    // Validate class
    const classResult = validateClass(selectedClass);
    if (!classResult.isValid) {
      setError(classResult.error!);
      setValidationState((prev) => ({ ...prev, class: "invalid" }));
      setSubmissionStatus("error");
      return;
    }

    try {
      setError("");
      setSubmissionStatus("loading");

      const player = await createPlayer.mutateAsync({
        name: name.trim(),
        className: selectedClass,
      });

      sessionStorage.setItem("playerId", player.id);
      sessionStorage.setItem("playerName", player.name);
      sessionStorage.setItem("playerClassName", player.className);

      const gameData = await startGame.mutateAsync({ playerId: player.id, theme: selectedTheme });

      sessionStorage.setItem("sessionId", gameData.sessionId);
      sessionStorage.setItem("questions", JSON.stringify(gameData.questions));
      sessionStorage.setItem("gameTheme", selectedTheme);

      // Show success state briefly before navigating
      setSubmissionStatus("success");
      setTimeout(() => {
        navigate("/game");
      }, 1000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || "שגיאה בהתחברות לשרת, נסה שוב";
      setError(msg);
      setSubmissionStatus("error");
    }
  };

  const isLoading = submissionStatus === "loading";

  return (
    <div className="flex min-h-dvh flex-col items-center bg-bg-primary">
      {/* Hero Image Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[45vh] min-h-[280px] max-h-[50vh] w-full overflow-hidden"
      >
        {/* Gradient fallback — always behind, transitions instantly */}
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{
            background: selectedTheme === "pesach"
              ? "linear-gradient(180deg, #4a1a0a 0%, #8b3a1a 30%, #c4762c 60%, #d4a44c 80%, #0a0e1a 100%)"
              : "linear-gradient(180deg, #1a3a5c 0%, #2d5a7b 30%, #c4a86c 60%, #8b7a4a 80%, #0a0e1a 100%)",
          }}
        />
        {/* Hero image — cross-fades when new image is ready, no flicker */}
        <AnimatePresence>
          {visibleHeroSrc && (
            <motion.img
              key={visibleHeroSrc}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              src={visibleHeroSrc}
              alt={selectedTheme === "pesach" ? "סדר פסח חגיגי" : "נוף פנורמי של ירושלים"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-bg-primary" />

        {/* Info button top-left */}
        <button
          onClick={() => setIsAboutOpen(true)}
          className="absolute top-4 start-4 z-20 flex items-center gap-1.5 rounded-xl bg-white/20 px-2 py-1.5 backdrop-blur-sm hover:bg-white/30 transition-colors"
          aria-label="איך בניתי את זה?"
        >
          <span>ℹ️</span>
          <img
            src="/images/ui/how-i-built-btn.png"
            alt="איך בניתי"
            className="h-8 w-8 rounded-lg object-cover"
          />
        </button>

        {/* Theme icon top-right — changes with selected theme */}
        <motion.div
          key={selectedTheme}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="absolute top-4 end-4 z-10 rounded-xl bg-white/20 p-2 backdrop-blur-sm"
          aria-hidden="true"
        >
          {selectedTheme === "pesach"
            ? <span className="text-2xl leading-none">🍷</span>
            : <CastleIcon size={28} color="white" />
          }
        </motion.div>

        {/* Jerusalem Quest Logo - Main Hero */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <img
              src="/logo.png"
              alt="לוגו מסע ירושלים"
              className="h-32 w-32 rounded-full border-4 border-white/30 object-cover shadow-2xl backdrop-blur-sm"
            />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-blue-primary/20 blur-xl" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-heebo text-4xl font-extrabold tracking-tight text-white drop-shadow-lg"
          >
            Jerusalem Quest
          </motion.h1>
          {/* Theme badge — animates when theme changes */}
          <AnimatePresence mode="wait">
            <motion.span
              key={selectedTheme}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className={`rounded-full px-3 py-0.5 text-sm font-semibold ${
                selectedTheme === "pesach"
                  ? "bg-orange-500/30 text-orange-200"
                  : "bg-blue-primary/30 text-blue-200"
              }`}
            >
              {selectedTheme === "pesach" ? "🍷 פסח" : "🕌 ירושלים"}
            </motion.span>
          </AnimatePresence>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className={`h-1 w-16 rounded-full transition-colors duration-500 ${
              selectedTheme === "pesach" ? "bg-orange-400" : "bg-blue-primary"
            }`}
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex flex-1 flex-col px-4 sm:px-6 md:px-8 pb-8 w-full max-w-xl"
      >
        {/* Theme Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-4"
          role="group"
          aria-label="בחר נושא משחק"
        >
          <p className="mb-3 text-center text-sm font-semibold text-white/70">בחר נושא</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedTheme("jerusalem")}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition-all duration-200 ${
                selectedTheme === "jerusalem"
                  ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20"
                  : "border-white/20 bg-white/5 hover:border-white/40"
              }`}
              aria-pressed={selectedTheme === "jerusalem"}
            >
              <span className="text-3xl" aria-hidden="true">🕌</span>
              <span className={`text-base font-bold ${selectedTheme === "jerusalem" ? "text-yellow-300" : "text-white/80"}`}>
                ירושלים
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTheme("pesach")}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition-all duration-200 ${
                selectedTheme === "pesach"
                  ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20"
                  : "border-white/20 bg-white/5 hover:border-white/40"
              }`}
              aria-pressed={selectedTheme === "pesach"}
            >
              <span className="text-3xl" aria-hidden="true">🍷</span>
              <span className={`text-base font-bold ${selectedTheme === "pesach" ? "text-yellow-300" : "text-white/80"}`}>
                פסח
              </span>
            </button>
          </div>
        </motion.div>

        {/* Contest Banner */}
        {contest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 rounded-xl border border-blue-primary/30 bg-gradient-to-br from-blue-primary/10 to-purple-600/10 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 text-right">
                <h3 className="text-lg font-bold text-white">
                  תחרות שבוע {contest.weekNumber}
                </h3>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {contest.totalParticipants} משתתפים
                </p>
                <div className="mt-2">
                  <ContestTimer endDate={contest.endDate} />
                </div>
              </div>
              {/* Jerusalem Quest Logo */}
              <div className="flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="לוגו מסע ירושלים"
                  className="h-20 w-20 rounded-full border-2 border-blue-primary/20 object-cover"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Form Card - groups title + form + button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 rounded-2xl border border-white/15 bg-bg-card px-5 py-6 shadow-xl"
        >
        {/* Title with theme emoji */}
        <motion.div
          key={selectedTheme}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="mb-1 text-3xl" aria-hidden="true">
            {selectedTheme === "pesach" ? "🍷" : "🕌"}
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {selectedTheme === "pesach" ? "!בואו נגלה את סודות הפסח" : "!בואו נגלה את סודות ירושלים"}
          </h2>
          <p className="mt-1 text-sm text-white/55">
            {selectedTheme === "pesach" ? "צאו למסע מרתק בעקבות יציאת מצרים" : "צאו למסע מרתק בין סמטאות העיר העתיקה"}
          </p>
        </motion.div>

        <div className="my-5 h-px bg-white/10" />

        {/* Form Container - Centered & Compact */}
        <form
          className="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleStart();
          }}
          noValidate
        >
          {/* Name Input - Enhanced UX */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="player-name"
              className="block text-right text-lg font-bold text-white"
            >
              ?איך קוראים לך
            </label>
            <div className="relative">
              <input
                id="player-name"
                type="text"
                value={name}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setName(newValue);

                  // Clear error only if input becomes valid
                  const result = validateName(newValue);
                  if (result.isValid && error) {
                    setError("");
                  }

                  // Real-time validation with debounce
                  if (newValue.trim()) {
                    validateNameDebounced(newValue);
                  } else {
                    setValidationState((prev) => ({ ...prev, name: "idle" }));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleStart();
                  }
                }}
                placeholder="הכנס את שמך כאן..."
                maxLength={15}
                autoComplete="off"
                aria-invalid={validationState.name === "invalid"}
                aria-describedby={error ? "form-error" : undefined}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-5 py-4 pe-24 text-right text-lg font-medium text-gray-900 shadow-sm outline-none transition-colors duration-200 placeholder:text-gray-500 hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                dir="rtl"
              />
              {/* Icons Container */}
              <div className="pointer-events-none absolute end-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
                <ValidationIcon state={validationState.name} />
                <div className="text-gray-400" aria-hidden="true">
                  <UserIcon size={20} color="currentColor" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <CharacterCounter
                current={name.length}
                max={15}
                isError={validationState.name === "invalid"}
              />
            </div>
          </div>

          {/* Class Selection - Two-Step Enhanced UX */}
          <div className="mt-5">
            <label
              className="mb-3 block text-right text-lg font-bold text-white"
            >
              ?באיזו כיתה את/ה לומד
            </label>
            <ClassSelector
              value={selectedClass}
              onChange={(newValue: string) => {
                setSelectedClass(newValue);

                // Clear error only if selection becomes valid
                const result = validateClass(newValue);
                if (result.isValid && error) {
                  setError("");
                }

                // Real-time validation
                if (newValue.trim()) {
                  validateClassDebounced(newValue);
                } else {
                  setValidationState((prev) => ({ ...prev, class: "idle" }));
                }
              }}
              error={validationState.class === "invalid"}
            />
          </div>

          {/* Error Message - Enhanced visibility and contrast */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
              role="alert"
              aria-live="polite"
            >
              <p
                id="form-error"
                className="rounded-lg bg-red-900/30 px-4 py-3 text-center text-base font-medium text-red-300 shadow-sm"
              >
                {error}
              </p>
            </motion.div>
          )}

          {/* Success Message */}
          {submissionStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center justify-center gap-2 rounded-lg bg-green-900/30 px-4 py-3 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-400"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <p className="text-base font-medium text-green-300">
                  !נרשמת בהצלחה
                </p>
              </div>
            </motion.div>
          )}
          {/* Start button - inside form card */}
          <div className="mb-1 mt-8 h-px bg-white/10" />
          <div className="mt-6">
            <Button
              onClick={handleStart}
              disabled={isLoading || submissionStatus === "success"}
              aria-label={
                submissionStatus === "success"
                  ? "נרשמת בהצלחה"
                  : isLoading
                  ? "מתחבר לשרת"
                  : "התחל משחק"
              }
              icon={
                submissionStatus === "success" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <PlayIcon size={20} color="white" />
                )
              }
            >
              {submissionStatus === "success"
                ? "!נרשמת בהצלחה"
                : isLoading
                ? "...מתחבר"
                : "התחל משחק"}
            </Button>
          </div>
        </form>
        </motion.div>
        {/* End Form Card */}

        {/* Leaderboard Preview */}
        {leaderboard && leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-8 pb-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => navigate("/leaderboard")}
                className="flex items-center gap-1.5 text-blue-primary"
                aria-label="צפה בלוח תוצאות המלא"
              >
                <ChartIcon size={18} color="#2563eb" />
                <span className="text-sm font-medium">צפה בכולם</span>
              </button>
              <h3 className="flex items-center gap-1.5 text-base font-extrabold text-white">
                <span aria-hidden="true">🏆</span>
                מובילים
              </h3>
            </div>

            {/* Top 3 Mini Cards */}
            <div className="space-y-2">
              {leaderboard.slice(0, 3).map((player: Player, index: number) => {
                const rank = index + 1;
                const rankColor = RANK_COLORS[rank];
                const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                const medals = ["🥇", "🥈", "🥉"];
                const isFirst = rank === 1;

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${
                      isFirst
                        ? "border-yellow-400/40 bg-yellow-400/8 shadow-md shadow-yellow-400/10"
                        : "border-border-card bg-bg-card/50"
                    }`}
                  >
                    {/* Medal */}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center text-xl"
                      aria-label={`מקום ${rank}`}
                    >
                      {medals[index]}
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
                      <div className={`text-sm font-bold ${isFirst ? "text-yellow-200" : "text-white"}`}>{player.name}</div>
                    </div>

                    {/* Score */}
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-base font-extrabold"
                        style={{ color: rankColor?.text || "#ffffff" }}
                      >
                        {player.score}
                      </span>
                      <span className="text-xs text-white/40">נק׳</span>
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
      <BottomNav variant="leaderboard" />

      {/* About Project Modal */}
      <AnimatePresence>
        {isAboutOpen && (
          <AboutProjectModal onClose={() => setIsAboutOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
