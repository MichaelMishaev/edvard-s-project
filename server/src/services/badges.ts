interface AnswerResult {
  questionId: string;
  answerId: string;
  timeMs: number;
  correct: boolean;
}

interface QuestionInfo {
  id: string;
  topic: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "participation-hero",
    name: "גיבור השתתפות",
    description: "השלמת המשחק",
    imageUrl: "/images/badges/participation-hero.png",
  },
  {
    id: "smart-explorer",
    name: "חוקר מתחיל",
    description: "5 תשובות נכונות",
    imageUrl: "/images/badges/smart-explorer.png",
  },
  {
    id: "jerusalem-expert",
    name: "אלוף ירושלים",
    description: "כל התשובות נכונות",
    imageUrl: "/images/badges/jerusalem-expert.png",
  },
  {
    id: "fast-thinker",
    name: "מהיר כברק",
    description: "סיום תחת 2 דקות",
    imageUrl: "/images/badges/fast-thinker.png",
  },
  {
    id: "history-star",
    name: "כוכב היסטוריה",
    description: "כל שאלות ההיסטוריה נכונות",
    imageUrl: "/images/badges/history-star.png",
  },
  {
    id: "magen-david",
    name: "מגן דוד",
    description: "השלמת המשימה הראשונה",
    imageUrl: "/images/badges/magen-david.png",
  },
  {
    id: "lions-gate",
    name: "שער האריות",
    description: "ביקור בשער האריות",
    imageUrl: "/images/badges/lions-gate.png",
  },
  {
    id: "golden-menorah",
    name: "מנורת הזהב",
    description: "כל שאלות העיר הקדושה נכונות",
    imageUrl: "/images/badges/golden-menorah.png",
  },
  {
    id: "jerusalem-walls",
    name: "חומות ירושלים",
    description: "7 תשובות נכונות ומעלה",
    imageUrl: "/images/badges/jerusalem-walls.png",
  },
  {
    id: "olive-branch",
    name: "ענף זית",
    description: "כל שאלות שלוש הדתות נכונות",
    imageUrl: "/images/badges/olive-branch.png",
  },
  {
    id: "davids-harp",
    name: "נבל דוד",
    description: "8 תשובות נכונות ומעלה",
    imageUrl: "/images/badges/davids-harp.png",
  },
  {
    id: "royal-crown",
    name: "כתר מלכות",
    description: "5 עיטורים במשחק אחד",
    imageUrl: "/images/badges/royal-crown.png",
  },
];

export function calculateBadges(
  answers: AnswerResult[],
  questions: QuestionInfo[],
  totalTimeSeconds: number
): string[] {
  const badges: string[] = [];
  const correctCount = answers.filter((a) => a.correct).length;
  const totalQuestions = answers.length;

  // Build topic map
  const questionTopicMap = new Map(questions.map((q) => [q.id, q.topic]));

  // 1. Participation Hero - always awarded (finished game)
  badges.push("גיבור השתתפות");

  // 2. Smart Explorer - at least 5 correct answers
  if (correctCount >= 5) {
    badges.push("חוקר מתחיל");
  }

  // 3. Jerusalem Expert - all answers correct
  if (correctCount === totalQuestions) {
    badges.push("אלוף ירושלים");
  }

  // 4. Fast Thinker - total time under 120 seconds
  if (totalTimeSeconds < 120) {
    badges.push("מהיר כברק");
  }

  // 5. History Star - all WARS_HISTORY topic questions answered correctly
  const historyAnswers = answers.filter(
    (a) => questionTopicMap.get(a.questionId) === "WARS_HISTORY"
  );
  if (historyAnswers.length > 0 && historyAnswers.every((a) => a.correct)) {
    badges.push("כוכב היסטוריה");
  }

  // 6. Magen David - score 100+ (computed from correctCount: 10 correct = 100 base)
  const baseScore = correctCount * 10;
  if (baseScore >= 100) {
    badges.push("מגן דוד");
  }

  // 7. Lions Gate - score 50+ (at least 5 correct answers worth of base points)
  if (baseScore >= 50) {
    badges.push("שער האריות");
  }

  // 8. Golden Menorah - all HOLY_CITY topic questions answered correctly
  const holyCityAnswers = answers.filter(
    (a) => questionTopicMap.get(a.questionId) === "HOLY_CITY"
  );
  if (holyCityAnswers.length > 0 && holyCityAnswers.every((a) => a.correct)) {
    badges.push("מנורת הזהב");
  }

  // 9. Jerusalem Walls - 7+ correct answers
  if (correctCount >= 7) {
    badges.push("חומות ירושלים");
  }

  // 10. Olive Branch - all THREE_RELIGIONS topic questions answered correctly
  const threeReligionsAnswers = answers.filter(
    (a) => questionTopicMap.get(a.questionId) === "THREE_RELIGIONS"
  );
  if (
    threeReligionsAnswers.length > 0 &&
    threeReligionsAnswers.every((a) => a.correct)
  ) {
    badges.push("ענף זית");
  }

  // 11. David's Harp - 8+ correct answers
  if (correctCount >= 8) {
    badges.push("נבל דוד");
  }

  // 12. Royal Crown - earned 5+ other badges in this game
  if (badges.length >= 5) {
    badges.push("כתר מלכות");
  }

  return badges;
}
