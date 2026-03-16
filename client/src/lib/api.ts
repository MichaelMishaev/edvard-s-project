import axios from "axios";
import type {
  Player,
  StartGameResponse,
  SubmitAnswerResponse,
  CompleteGameResponse,
  BadgeDefinition,
  BadgeCollectionResponse,
  Contest,
  HallOfFameContest,
} from "./types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function createPlayer(
  name: string,
  className: string
): Promise<Player> {
  const { data } = await api.post("/players", { name, className });
  return data;
}

export async function getPlayer(id: string): Promise<Player> {
  const { data } = await api.get(`/players/${id}`);
  return data;
}

export async function startGame(playerId: string, theme: string = "jerusalem"): Promise<StartGameResponse> {
  const { data } = await api.post("/games/start", { playerId, theme });
  return data;
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  answerId: string,
  timeMs: number
): Promise<SubmitAnswerResponse> {
  const { data } = await api.post(`/games/${sessionId}/answer`, {
    questionId,
    answerId,
    timeMs,
  });
  return data;
}

export async function completeGame(
  sessionId: string,
  theme?: string
): Promise<CompleteGameResponse> {
  const { data } = await api.post(`/games/${sessionId}/complete`, { theme: theme || "jerusalem" });
  return data;
}

export async function getLeaderboard(): Promise<Player[]> {
  const { data } = await api.get("/leaderboard");
  return data;
}

export async function getBadgeDefinitions(): Promise<BadgeDefinition[]> {
  const { data } = await api.get("/badges");
  return data;
}

export async function getPlayerBadges(
  playerId: string,
  theme?: string
): Promise<BadgeCollectionResponse> {
  const params = theme ? `?theme=${theme}` : "";
  const { data } = await api.get(`/badges/${playerId}${params}`);
  return data;
}

// Contest API
export async function getCurrentContest(): Promise<Contest | null> {
  try {
    const { data } = await api.get("/contests/current");
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getHallOfFame(): Promise<HallOfFameContest[]> {
  const { data } = await api.get("/contests/hall-of-fame");
  return data;
}

export async function registerContestParticipation(
  contestId: string,
  playerId: string,
  className: string
): Promise<void> {
  await api.post(`/contests/${contestId}/participate`, {
    playerId,
    className,
  });
}

// Leaderboard API
export async function getClassLeaderboard(className: string): Promise<Player[]> {
  const { data } = await api.get(`/players/leaderboard/class/${className}`);
  return data;
}

export async function getSchoolLeaderboard(): Promise<Player[]> {
  const { data } = await api.get(`/players/leaderboard/school`);
  return data;
}
