import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// Local Punch type (not exported from current backend interface)
export interface Punch {
  id: string;
  userId: Principal;
  content: string;
  timestamp: bigint;
  views: bigint;
  likes: bigint;
}

export function useGetAllPunches() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Punch[]>({
    queryKey: ["punches"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getAllPunches();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTrendingPunches(limit = 10) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Punch[]>({
    queryKey: ["trendingPunches", limit],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getTrendingPunches(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserPunches() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: allPunches } = useGetAllPunches();

  return useQuery<Punch[]>({
    queryKey: ["userPunches", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!identity || !allPunches) return [];
      const userPrincipal = identity.getPrincipal().toString();
      return allPunches.filter(
        (punch) => punch.userId.toString() === userPrincipal,
      );
    },
    enabled: !!actor && !actorFetching && !!identity && !!allPunches,
  });
}

export function useCreatePunch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).createPunch(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["punches"] });
      queryClient.invalidateQueries({ queryKey: ["trendingPunches"] });
      queryClient.invalidateQueries({ queryKey: ["userPunches"] });
    },
  });
}

export function useLikePunch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (punchId: string) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).likePunch(punchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["punches"] });
      queryClient.invalidateQueries({ queryKey: ["trendingPunches"] });
    },
  });
}

export function useUnlikePunch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (punchId: string) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).unlikePunch(punchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["punches"] });
      queryClient.invalidateQueries({ queryKey: ["trendingPunches"] });
    },
  });
}

export function useDeletePunch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (punchId: string) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).deletePunch(punchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["punches"] });
      queryClient.invalidateQueries({ queryKey: ["trendingPunches"] });
      queryClient.invalidateQueries({ queryKey: ["userPunches"] });
    },
  });
}

export function useIncrementPunchViews() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (punchId: string) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).incrementPunchViews(punchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["punches"] });
      queryClient.invalidateQueries({ queryKey: ["trendingPunches"] });
    },
  });
}
