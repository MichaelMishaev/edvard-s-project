import { useEffect, useState } from "react";

interface ContestTimerProps {
  endDate: string;
  onExpire?: () => void;
}

type TimeRemaining = {
  days: number;
  hours: number;
  minutes: number;
  total: number;
};

export default function ContestTimer({ endDate, onExpire }: ContestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining => {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const total = Math.max(0, end - now);

      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));

      return { days, hours, minutes, total };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every minute
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining.total === 0 && onExpire) {
        onExpire();
        clearInterval(interval);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  if (!timeRemaining) return null;

  const { days, hours, total } = timeRemaining;

  // Determine color based on time remaining
  const getColorStyles = (): { bg: string; text: string; border: string } => {
    const hoursRemaining = total / (1000 * 60 * 60);

    if (hoursRemaining > 48) {
      return { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" };
    }
    if (hoursRemaining > 24) {
      return { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" };
    }
    if (hoursRemaining > 6) {
      return { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" };
    }
    return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" };
  };

  // Format display text
  const getDisplayText = (): string => {
    if (total === 0) return "התחרות הסתיימה";
    if (days > 0) return `${days} ימים ${hours} שעות ⏱`;
    if (hours > 0) return `${hours} שעות ⏱`;
    return "פחות משעה ⏱";
  };

  const colorStyles = getColorStyles();

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${colorStyles.bg} ${colorStyles.text} ${colorStyles.border}`}
      role="timer"
      aria-label={getDisplayText()}
    >
      {getDisplayText()}
    </div>
  );
}
