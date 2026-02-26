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

export function calculateBadges(
  answers: AnswerResult[],
  questions: QuestionInfo[],
  totalTimeSeconds: number
): string[] {
  const badges: string[] = [];
  const correctCount = answers.filter((a) => a.correct).length;
  const totalQuestions = answers.length;

  // Participation Hero - always awarded (finished game)
  badges.push("גיבור השתתפות");

  // Smart Explorer - at least 5 correct answers
  if (correctCount >= 5) {
    badges.push("חוקר מתחיל");
  }

  // Jerusalem Expert - all answers correct
  if (correctCount === totalQuestions) {
    badges.push("אלוף ירושלים");
  }

  // Fast Thinker - total time under 120 seconds
  if (totalTimeSeconds < 120) {
    badges.push("מהיר כברק");
  }

  // History Star - all WARS_HISTORY topic questions answered correctly
  const questionTopicMap = new Map(questions.map((q) => [q.id, q.topic]));
  const historyAnswers = answers.filter(
    (a) => questionTopicMap.get(a.questionId) === "WARS_HISTORY"
  );
  if (
    historyAnswers.length > 0 &&
    historyAnswers.every((a) => a.correct)
  ) {
    badges.push("כוכב היסטוריה");
  }

  return badges;
}
