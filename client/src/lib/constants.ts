export const BADGE_CONFIG: Record<
  string,
  { icon: string; color: string; bgColor: string }
> = {
  "אלוף ירושלים": {
    icon: "star-medal",
    color: "#22c55e",
    bgColor: "#14532d",
  },
  "מהיר כברק": {
    icon: "lightning",
    color: "#f59e0b",
    bgColor: "#78350f",
  },
  "חוקר מתחיל": {
    icon: "compass",
    color: "#3b82f6",
    bgColor: "#1e3a5f",
  },
  "כוכב היסטוריה": {
    icon: "history-star",
    color: "#a855f7",
    bgColor: "#581c87",
  },
  "גיבור השתתפות": {
    icon: "participation",
    color: "#ec4899",
    bgColor: "#831843",
  },
};

export function getRankTitle(score: number): string {
  if (score >= 130) return "דרגה מקצועית";
  if (score >= 100) return "דרגה מתקדמת";
  if (score >= 60) return "דרגה בינונית";
  return "דרגה התחלתית";
}

export function getEncouragingMessage(
  correctAnswers: number,
  totalQuestions: number
): string {
  const ratio = correctAnswers / totalQuestions;
  if (ratio === 1) return "מושלם! אתה מומחה אמיתי לירושלים!";
  if (ratio >= 0.8) return "כל הכבוד! אתה ממש מומחה לירושלים!";
  if (ratio >= 0.6) return "יופי! אתה יודע הרבה על ירושלים!";
  if (ratio >= 0.4) return "לא רע! יש לך בסיס טוב, המשך ללמוד!";
  return "כל התחלה היא טובה! נסה שוב ותשתפר!";
}

export const RANK_COLORS: Record<number, { text: string; bg: string; border: string }> = {
  1: { text: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  2: { text: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.3)" },
  3: { text: "#d97706", bg: "rgba(217,119,6,0.1)", border: "rgba(217,119,6,0.3)" },
  4: { text: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)" },
  5: { text: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" },
};

export const AVATAR_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#22c55e",
  "#ef4444",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];
