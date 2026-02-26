export interface Player {
  id: string;
  name: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSeconds: number;
  badges: string[];
  createdAt: string;
}

export interface Question {
  id: string;
  topic: string;
  difficulty: number;
  question: string;
  answers: { id: string; text: string }[];
  timeLimitSec: number;
  explanation: string;
  tags: string[];
  imageUrl: string | null;
}

export interface StartGameResponse {
  sessionId: string;
  questions: Question[];
}

export interface SubmitAnswerResponse {
  correct: boolean;
  correctAnswerId: string;
  explanation: string;
}

export interface CompleteGameResponse {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSeconds: number;
  badges: string[];
}

export type LeaderboardEntry = Player;
