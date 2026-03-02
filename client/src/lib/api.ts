import axios from "axios";
import type {
  Player,
  StartGameResponse,
  SubmitAnswerResponse,
  CompleteGameResponse,
  BadgeDefinition,
  BadgeCollectionResponse,
} from "./types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function createPlayer(name: string): Promise<Player> {
  const { data } = await api.post("/players", { name });
  return data;
}

export async function getPlayer(id: string): Promise<Player> {
  const { data } = await api.get(`/players/${id}`);
  return data;
}

export async function startGame(playerId: string): Promise<StartGameResponse> {
  const { data } = await api.post("/games/start", { playerId });
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
  sessionId: string
): Promise<CompleteGameResponse> {
  const { data } = await api.post(`/games/${sessionId}/complete`);
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
  playerId: string
): Promise<BadgeCollectionResponse> {
  const { data } = await api.get(`/badges/${playerId}`);
  return data;
}
