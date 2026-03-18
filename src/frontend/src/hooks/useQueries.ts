import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BanRecord, SubscriptionUpdate, UserProfile } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export function useGetCallerSubscription() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<SubscriptionUpdate | null>({
    queryKey: ["callerSubscription"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerSubscription();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUpdateCallerSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscription: SubscriptionUpdate) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCallerSubscription(subscription);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerSubscription"] });
    },
  });
}

// ─── Usage Stats ──────────────────────────────────────────────────────────────

export function useGetCallerUsageStats() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["callerUsageStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUsageStats();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useIncrementDailyScans() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.incrementDailyScans();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUsageStats"] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetUsageStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["usageStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getUsageStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function useGetProducts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Stripe ───────────────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isStripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: {
      secretKey: string;
      allowedCountries: string[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isStripeConfigured"] });
    },
  });
}

export function useGetStripeSessionStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getStripeSessionStatus(sessionId);
    },
  });
}

// ─── Market Config ────────────────────────────────────────────────────────────

export function useGetMarketConfig() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ["marketConfig"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getMarketConfig();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUpdateMarketConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (config: any) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).updateMarketConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketConfig"] });
    },
  });
}

export function usePublish() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).publish();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketConfig"] });
    },
  });
}

// ─── Track App Open ───────────────────────────────────────────────────────────

export function useTrackAppOpen() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.trackAppOpen();
    },
  });
}

// ─── Ban Status ───────────────────────────────────────────────────────────────

/**
 * Check if the currently authenticated user is banned.
 * Used by BanGate in App.tsx.
 */
export function useIsBannedUser() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ["isBannedUser", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      const principal = identity.getPrincipal();
      if (principal.isAnonymous()) return false;
      return actor.isBanned(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false,
    staleTime: 60_000,
  });
}

/**
 * Check if a specific principal is banned.
 * Used by MediaUploadGate to check before allowing uploads.
 */
export function useIsBanned(principal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isBanned", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return false;
      if (principal.isAnonymous()) return false;
      return actor.isBanned(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
    retry: false,
    staleTime: 60_000,
  });
}

/**
 * Get the full ban record for a principal (self or admin).
 */
export function useGetBanStatus(principal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<BanRecord | null>({
    queryKey: ["banStatus", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      if (principal.isAnonymous()) return null;
      return actor.getBanStatus(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
    retry: false,
  });
}

/**
 * Ban the current authenticated user for media theft.
 * Called by MediaProtection when theft is detected.
 */
export function useBanUserForMediaTheft() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reason: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.banUserForMediaTheft(reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isBannedUser"] });
      queryClient.invalidateQueries({ queryKey: ["isBanned"] });
    },
  });
}

/**
 * Admin: ban any principal.
 */
export function useBanUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      principal,
      reason,
    }: { principal: Principal; reason: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.banUser(principal, reason);
    },
  });
}

/**
 * Admin: unban a principal.
 */
export function useUnbanUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unbanUser(principal);
    },
  });
}

// Legacy alias kept for backward compatibility
export const useReportSelfForMediaTheft = useBanUserForMediaTheft;
