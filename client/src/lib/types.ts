export interface Player {
  id: string;
  name: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSeconds: number;
  badges: string[];
  className: string;
  contestBadges: string[];
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
  pointsAwarded: number;
}

export interface CompleteGameResponse {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSeconds: number;
  badges: string[];
}

export type LeaderboardEntry = Player;

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earned: boolean;
}

export interface BadgeCollectionResponse {
  badges: BadgeDefinition[];
  earnedCount: number;
  totalCount: number;
}

export interface Contest {
  contestId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: "active" | "closed" | "cancelled";
  totalParticipants: number;
  minParticipants: number;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    total: number;
  };
}

export interface Class {
  id: string;
  label: string;
}

export interface HallOfFameContest {
  weekNumber: number;
  dateRange: string;
  totalParticipants: number;
  classChampions: {
    className: string;
    playerName: string;
    score: number;
    rank: number;
  }[];
  schoolTop10: {
    rank: number;
    playerName: string;
    className: string;
    score: number;
  }[];
  badgeStats: {
    badgeName: string;
    count: number;
  }[];
}
