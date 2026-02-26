import { useMutation, useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";

export function useCreatePlayer() {
  return useMutation({
    mutationFn: (name: string) => api.createPlayer(name),
  });
}

export function useStartGame() {
  return useMutation({
    mutationFn: (playerId: string) => api.startGame(playerId),
  });
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({
      sessionId,
      questionId,
      answerId,
      timeMs,
    }: {
      sessionId: string;
      questionId: string;
      answerId: string;
      timeMs: number;
    }) => api.submitAnswer(sessionId, questionId, answerId, timeMs),
  });
}

export function useCompleteGame() {
  return useMutation({
    mutationFn: (sessionId: string) => api.completeGame(sessionId),
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: api.getLeaderboard,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}
