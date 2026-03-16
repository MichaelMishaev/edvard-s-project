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
  // ---- Jerusalem badges ----

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
  // ---- Pesach badges ----
  {
    id: "pesach-hero",
    name: "גיבור הפסח",
    description: "השלמת משחק הפסח",
    imageUrl: "/images/badges/pesach-hero.png",
  },
  {
    id: "pesach-explorer",
    name: "חוקר המגילה",
    description: "5 תשובות נכונות",
    imageUrl: "/images/badges/pesach-explorer.png",
  },
  {
    id: "pesach-champion",
    name: "אלוף הפסח",
    description: "כל התשובות נכונות",
    imageUrl: "/images/badges/pesach-champion.png",
  },
  {
    id: "fast-as-moses",
    name: "מהיר כמשה",
    description: "סיום תחת 2 דקות",
    imageUrl: "/images/badges/fast-as-moses.png",
  },
  {
    id: "pesach-sage",
    name: "חכם הפסח",
    description: "כל שאלות ההיסטוריה נכונות",
    imageUrl: "/images/badges/pesach-sage.png",
  },
  {
    id: "four-cups",
    name: "ארבע הכוסות",
    description: "השלמת המשימה הראשונה",
    imageUrl: "/images/badges/four-cups.png",
  },
  {
    id: "parting-of-sea",
    name: "קריעת ים סוף",
    description: "ביקור בים סוף",
    imageUrl: "/images/badges/parting-of-sea.png",
  },
  {
    id: "ten-plagues",
    name: "עשר המכות",
    description: "כל שאלות יציאת מצרים נכונות",
    imageUrl: "/images/badges/ten-plagues.png",
  },
  {
    id: "sinai-desert",
    name: "מדבר סיני",
    description: "7 תשובות נכונות ומעלה",
    imageUrl: "/images/badges/sinai-desert.png",
  },
  {
    id: "four-sons",
    name: "ארבע הבנים",
    description: "כל שאלות הגדה נכונות",
    imageUrl: "/images/badges/four-sons.png",
  },
  {
    id: "elijah-cup",
    name: "כוס אליהו",
    description: "8 תשובות נכונות ומעלה",
    imageUrl: "/images/badges/elijah-cup.png",
  },
  {
    id: "pesach-crown",
    name: "כתר הפסח",
    description: "5 עיטורים במשחק אחד",
    imageUrl: "/images/badges/pesach-crown.png",
  },
];

export const JERUSALEM_BADGE_DEFINITIONS = BADGE_DEFINITIONS.filter((_, i) => i < 12);
export const PESACH_BADGE_DEFINITIONS = BADGE_DEFINITIONS.filter((_, i) => i >= 12);

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

export function calculatePesachBadges(
  answers: AnswerResult[],
  questions: QuestionInfo[],
  totalTimeSeconds: number
): string[] {
  const badges: string[] = [];
  const correctCount = answers.filter((a) => a.correct).length;
  const totalQuestions = answers.length;
  const questionTopicMap = new Map(questions.map((q) => [q.id, q.topic]));

  // 1. Participation → גיבור הפסח
  badges.push("גיבור הפסח");

  // 2. 5+ correct → חוקר המגילה
  if (correctCount >= 5) badges.push("חוקר המגילה");

  // 3. All correct → אלוף הפסח
  if (correctCount === totalQuestions) badges.push("אלוף הפסח");

  // 4. Under 2 min → מהיר כמשה
  if (totalTimeSeconds < 120) badges.push("מהיר כמשה");

  // 5. All WARS_HISTORY correct → חכם הפסח
  const historyAnswers = answers.filter(
    (a) => questionTopicMap.get(a.questionId) === "WARS_HISTORY"
  );
  if (historyAnswers.length > 0 && historyAnswers.every((a) => a.correct)) {
    badges.push("חכם הפסח");
  }

  // 6. Score 100+ → ארבע הכוסות
  const baseScore = correctCount * 10;
  if (baseScore >= 100) badges.push("ארבע הכוסות");

  // 7. Score 50+ → קריעת ים סוף
  if (baseScore >= 50) badges.push("קריעת ים סוף");

  // 8. All HOLY_CITY correct → עשר המכות
  const holyCityAnswers = answers.filter(
    (a) => questionTopicMap.get(a.questionId) === "HOLY_CITY"
  );
  if (holyCityAnswers.length > 0 && holyCityAnswers.every((a) => a.correct)) {
    badges.push("עשר המכות");
  }

  // 9. 7+ correct → מדבר סיני
  if (correctCount >= 7) badges.push("מדבר סיני");

  // 10. All THREE_RELIGIONS correct → ארבע הבנים
  const haggadahAnswers = answers.filter(
    (a) => questionTopicMap.get(a.questionId) === "THREE_RELIGIONS"
  );
  if (haggadahAnswers.length > 0 && haggadahAnswers.every((a) => a.correct)) {
    badges.push("ארבע הבנים");
  }

  // 11. 8+ correct → כוס אליהו
  if (correctCount >= 8) badges.push("כוס אליהו");

  // 12. 5+ badges → כתר הפסח
  if (badges.length >= 5) badges.push("כתר הפסח");

  return badges;
}
