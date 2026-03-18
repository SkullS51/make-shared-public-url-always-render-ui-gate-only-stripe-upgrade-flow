import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// Local type definitions for chat messages (backend methods not in current interface)
export interface ChatMessage {
  id: string;
  senderId: Principal;
  receiverId: Principal;
  content: string;
  timestamp: bigint;
  isRead: boolean;
  mediaBlobId?: string | null;
}

export function useGetConversation(otherUserId: Principal | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ChatMessage[]>({
    queryKey: ["conversation", otherUserId?.toString()],
    queryFn: async () => {
      if (!actor || !otherUserId) return [];
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (actor as any).getConversation(otherUserId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity && !!otherUserId,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      receiverId,
      content,
    }: {
      receiverId: Principal;
      content: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).sendMessage(receiverId, content);
    },
    onSuccess: (
      _: unknown,
      variables: { receiverId: Principal; content: string },
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.receiverId.toString()],
      });
    },
  });
}

export function useSendMediaMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      receiverId,
      content,
      mediaBlobId,
    }: {
      receiverId: Principal;
      content: string;
      mediaBlobId: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).sendMediaMessage(receiverId, content, mediaBlobId);
    },
    onSuccess: (
      _: unknown,
      variables: {
        receiverId: Principal;
        content: string;
        mediaBlobId: string;
      },
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.receiverId.toString()],
      });
    },
  });
}

export function useMarkAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).markMessageAsRead(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}

export function useGetOnlineStatus(userId: Principal | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ["onlineStatus", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getOnlineStatus(userId);
    },
    enabled: !!actor && !isFetching && !!identity && !!userId,
    refetchInterval: 30000,
  });
}

export function useSetOnlineStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (isOnline: boolean) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).setOnlineStatus(isOnline);
    },
  });
}

export function useGetUnreadMessageCount() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getUnreadMessageCount();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 30000,
  });
}
