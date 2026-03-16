import { useMutation, useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";
import type { StartGameResponse } from "../lib/types";

export function useCreatePlayer() {
  return useMutation({
    mutationFn: ({ name, className }: { name: string; className: string }) =>
      api.createPlayer(name, className),
  });
}

export function useStartGame() {
  return useMutation<StartGameResponse, Error, { playerId: string; theme: string }>({
    mutationFn: ({ playerId, theme }) => api.startGame(playerId, theme),
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
    mutationFn: ({ sessionId, theme }: { sessionId: string; theme?: string }) =>
      api.completeGame(sessionId, theme),
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

export function useBadgeCollection(playerId: string | null, theme?: string) {
  return useQuery({
    queryKey: ["badges", playerId, theme],
    queryFn: () => api.getPlayerBadges(playerId!, theme),
    enabled: !!playerId,
    staleTime: 10000,
  });
}

export function useCurrentContest() {
  return useQuery({
    queryKey: ["contest", "current"],
    queryFn: api.getCurrentContest,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useHallOfFame() {
  return useQuery({
    queryKey: ["hall-of-fame"],
    queryFn: api.getHallOfFame,
    staleTime: 60000,
  });
}

export function useClassLeaderboard(className: string | null) {
  return useQuery({
    queryKey: ["leaderboard", "class", className],
    queryFn: () => api.getClassLeaderboard(className!),
    enabled: !!className,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useSchoolLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard", "school"],
    queryFn: api.getSchoolLeaderboard,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useRegisterContestParticipation() {
  return useMutation({
    mutationFn: ({
      contestId,
      playerId,
      className,
    }: {
      contestId: string;
      playerId: string;
      className: string;
    }) => api.registerContestParticipation(contestId, playerId, className),
  });
}
