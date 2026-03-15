export const BADGE_CONFIG: Record<
  string,
  { icon: string; color: string; bgColor: string; borderColor: string }
> = {
  "אלוף ירושלים": {
    icon: "star-medal",
    color: "#22c55e",
    bgColor: "#14532d",
    borderColor: "#22c55e",
  },
  "מהיר כברק": {
    icon: "lightning",
    color: "#f59e0b",
    bgColor: "#78350f",
    borderColor: "#f59e0b",
  },
  "חוקר מתחיל": {
    icon: "compass",
    color: "#3b82f6",
    bgColor: "#1e3a5f",
    borderColor: "#3b82f6",
  },
  "כוכב היסטוריה": {
    icon: "history-star",
    color: "#a855f7",
    bgColor: "#581c87",
    borderColor: "#a855f7",
  },
  "גיבור השתתפות": {
    icon: "participation",
    color: "#ec4899",
    bgColor: "#831843",
    borderColor: "#ec4899",
  },
  "מגן דוד": {
    icon: "shield",
    color: "#eab308",
    bgColor: "#713f12",
    borderColor: "#eab308",
  },
  "שער האריות": {
    icon: "lion",
    color: "#60a5fa",
    bgColor: "#1e3a5f",
    borderColor: "#60a5fa",
  },
  "מנורת הזהב": {
    icon: "menorah",
    color: "#fbbf24",
    bgColor: "#78350f",
    borderColor: "#fbbf24",
  },
  "חומות ירושלים": {
    icon: "walls",
    color: "#94a3b8",
    bgColor: "#334155",
    borderColor: "#94a3b8",
  },
  "ענף זית": {
    icon: "olive",
    color: "#4ade80",
    bgColor: "#14532d",
    borderColor: "#4ade80",
  },
  "נבל דוד": {
    icon: "harp",
    color: "#c084fc",
    bgColor: "#581c87",
    borderColor: "#c084fc",
  },
  "כתר מלכות": {
    icon: "crown",
    color: "#fbbf24",
    bgColor: "#78350f",
    borderColor: "#fbbf24",
  },
  // Pesach equivalents
  "אלוף הפסח": {
    icon: "star-medal",
    color: "#22c55e",
    bgColor: "#14532d",
    borderColor: "#22c55e",
  },
  "קריעת ים סוף": {
    icon: "compass",
    color: "#60a5fa",
    bgColor: "#1e3a5f",
    borderColor: "#60a5fa",
  },
  "מדבר סיני": {
    icon: "compass",
    color: "#94a3b8",
    bgColor: "#334155",
    borderColor: "#94a3b8",
  },
  "עשר המכות": {
    icon: "history-star",
    color: "#fbbf24",
    bgColor: "#78350f",
    borderColor: "#fbbf24",
  },
  "ארבע הכוסות": {
    icon: "star-medal",
    color: "#eab308",
    bgColor: "#713f12",
    borderColor: "#eab308",
  },
  "ארבע הבנים": {
    icon: "compass",
    color: "#4ade80",
    bgColor: "#14532d",
    borderColor: "#4ade80",
  },
  "כוס אליהו": {
    icon: "lightning",
    color: "#c084fc",
    bgColor: "#581c87",
    borderColor: "#c084fc",
  },
  "חכם הפסח": {
    icon: "history-star",
    color: "#a855f7",
    bgColor: "#581c87",
    borderColor: "#a855f7",
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
  totalQuestions: number,
  theme: string = "jerusalem"
): string {
  const ratio = correctAnswers / totalQuestions;
  const topic = theme === "pesach" ? "פסח" : "ירושלים";
  if (ratio === 1) return `מושלם! אתה מומחה אמיתי ל${topic}!`;
  if (ratio >= 0.8) return `כל הכבוד! אתה ממש מומחה ל${topic}!`;
  if (ratio >= 0.6) return `יופי! אתה יודע הרבה על ${topic}!`;
  if (ratio >= 0.4) return "לא רע! יש לך בסיס טוב, המשך ללמוד!";
  return "כל התחלה היא טובה! נסה שוב ותשתפר!";
}

export const PESACH_BADGE_MAP: Record<string, string> = {
  "אלוף ירושלים": "אלוף הפסח",
  "שער האריות": "קריעת ים סוף",
  "חומות ירושלים": "מדבר סיני",
  "מנורת הזהב": "עשר המכות",
  "מגן דוד": "ארבע הכוסות",
  "ענף זית": "ארבע הבנים",
  "נבל דוד": "כוס אליהו",
  "כוכב היסטוריה": "חכם הפסח",
};

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

export type Class = {
  id: string;
  label: string;
};

export const CLASSES: Class[] = [
  { id: "dalet1", label: "ד׳1" },
  { id: "dalet2", label: "ד׳2" },
  { id: "dalet3", label: "ד׳3" },
  { id: "dalet4", label: "ד׳4" },
  { id: "heh1", label: "ה׳1" },
  { id: "heh2", label: "ה׳2" },
  { id: "heh3", label: "ה׳3" },
  { id: "heh4", label: "ה׳4" },
  { id: "vav1", label: "ו׳1" },
  { id: "vav2", label: "ו׳2" },
  { id: "vav3", label: "ו׳3" },
  { id: "vav4", label: "ו׳4" },
];
