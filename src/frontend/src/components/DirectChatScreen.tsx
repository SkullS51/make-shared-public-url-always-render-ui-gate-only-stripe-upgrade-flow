import { Principal } from "@dfinity/principal";
import { useParams } from "@tanstack/react-router";
import { Flame, Loader2, Lock, Users } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useGetConversation,
  useGetOnlineStatus,
  useMarkAsRead,
  useSendMediaMessage,
  useSendMessage,
  useSetOnlineStatus,
} from "../hooks/useChat";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import { upsertConversation } from "../lib/conversationStore";
import EmojiPicker from "./EmojiPicker";
import MediaProtection from "./MediaProtection";
import MediaUploadGate from "./MediaUploadGate";
import MessageBubble from "./MessageBubble";

interface LocalMessage {
  id: string;
  senderId: Principal;
  receiverId: Principal;
  content: string;
  timestamp: bigint;
  isRead: boolean;
  mediaBlobId?: string | null;
}

interface MediaUploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
}

function genId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function truncatePrincipal(id: string): string {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

export default function DirectChatScreen() {
  const { userId } = useParams({ from: "/chat/$userId" });
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const myPrincipalId = identity?.getPrincipal().toString() ?? "";

  // Convert route param to Principal
  const otherUserPrincipal = (() => {
    try {
      return Principal.fromText(userId);
    } catch {
      return null;
    }
  })();

  const [inputText, setInputText] = useState("");
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [mediaState, setMediaState] = useState<MediaUploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markedReadIds = useRef<Set<string>>(new Set());

  const { data: profile } = useGetCallerUserProfile();
  const { data: conversation, isLoading: convLoading } =
    useGetConversation(otherUserPrincipal);
  const { data: isOtherOnline } = useGetOnlineStatus(otherUserPrincipal);
  const { mutate: setOnlineStatus } = useSetOnlineStatus();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutateAsync: sendMessageMutation } = useSendMessage();
  const { mutateAsync: sendMediaMessageMutation } = useSendMediaMessage();

  // Set online status on mount/unmount
  useEffect(() => {
    if (!isAuthenticated) return;
    setOnlineStatus(true);
    return () => {
      setOnlineStatus(false);
    };
  }, [isAuthenticated, setOnlineStatus]);

  // Mark incoming messages as read
  useEffect(() => {
    if (!conversation || !myPrincipalId) return;
    for (const msg of conversation) {
      if (
        !msg.isRead &&
        msg.senderId.toString() !== myPrincipalId &&
        !markedReadIds.current.has(msg.id)
      ) {
        markedReadIds.current.add(msg.id);
        markAsRead(msg.id);
      }
    }
  }, [conversation, myPrincipalId, markAsRead]);

  // Merge backend conversation with local optimistic messages
  const backendIds = new Set((conversation ?? []).map((m) => m.id));
  const optimisticOnly = localMessages.filter((m) => !backendIds.has(m.id));
  const allMessages: LocalMessage[] = [
    ...(conversation ?? []).map((m) => ({
      ...m,
      timestamp: typeof m.timestamp === "bigint" ? m.timestamp : BigInt(0),
    })),
    ...optimisticOnly,
  ].sort((a, b) => {
    const ta = Number(a.timestamp);
    const tb = Number(b.timestamp);
    return ta - tb;
  });

  // Scroll to bottom
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) return;
    const preview = URL.createObjectURL(file);
    setMediaState({ file, preview, uploading: false, progress: 0 });
    e.target.value = "";
  };

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleEmojiSelect = useCallback(
    (emojiId: string) => {
      const emojiText = `:${emojiId}:`;
      const textarea = textareaRef.current;
      if (!textarea) {
        setInputText((prev) => prev + emojiText);
        return;
      }
      const start = textarea.selectionStart ?? inputText.length;
      const end = textarea.selectionEnd ?? inputText.length;
      const newText =
        inputText.slice(0, start) + emojiText + inputText.slice(end);
      setInputText(newText);
      setTimeout(() => {
        textarea.focus();
        const newPos = start + emojiText.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    },
    [inputText],
  );

  const handleSend = useCallback(async () => {
    if (!isAuthenticated || !otherUserPrincipal) return;
    const text = inputText.trim();
    if (!text && !mediaState.file) return;

    const senderPrincipal = identity!.getPrincipal();

    try {
      if (mediaState.file) {
        setMediaState((prev) => ({ ...prev, uploading: true, progress: 30 }));

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("File read failed"));
          reader.readAsDataURL(mediaState.file!);
        });

        setMediaState((prev) => ({ ...prev, progress: 80 }));

        const optimisticMsg: LocalMessage = {
          id: genId(),
          senderId: senderPrincipal,
          receiverId: otherUserPrincipal,
          content: text || "📎 Media",
          timestamp: BigInt(Date.now()) * BigInt(1_000_000),
          isRead: false,
          mediaBlobId: dataUrl,
        };
        setLocalMessages((prev) => [...prev, optimisticMsg]);

        try {
          await sendMediaMessageMutation({
            receiverId: otherUserPrincipal,
            content: text || "📎 Media",
            mediaBlobId: dataUrl,
          });
        } catch {
          // graceful — local message already shown
        }

        upsertConversation({
          userId: otherUserPrincipal.toString(),
          displayName: undefined,
          lastMessage: text || "📎 Media",
          lastTimestamp: Date.now(),
          unreadCount: 0,
        });

        if (mediaState.preview) URL.revokeObjectURL(mediaState.preview);
        setMediaState({
          file: null,
          preview: null,
          uploading: false,
          progress: 0,
        });
      } else {
        setIsSendingMsg(true);
        const optimisticMsg: LocalMessage = {
          id: genId(),
          senderId: senderPrincipal,
          receiverId: otherUserPrincipal,
          content: text,
          timestamp: BigInt(Date.now()) * BigInt(1_000_000),
          isRead: false,
          mediaBlobId: null,
        };
        setLocalMessages((prev) => [...prev, optimisticMsg]);
        setInputText("");

        try {
          await sendMessageMutation({
            receiverId: otherUserPrincipal,
            content: text,
          });
        } catch {
          // graceful — local message already shown
        }

        upsertConversation({
          userId: otherUserPrincipal.toString(),
          displayName: undefined,
          lastMessage: text,
          lastTimestamp: Date.now(),
          unreadCount: 0,
        });

        setIsSendingMsg(false);
      }

      setInputText("");
    } catch (err) {
      console.error("Send failed:", err);
      setMediaState((prev) => ({ ...prev, uploading: false, progress: 0 }));
      setIsSendingMsg(false);
    }
  }, [
    inputText,
    mediaState,
    isAuthenticated,
    identity,
    otherUserPrincipal,
    sendMessageMutation,
    sendMediaMessageMutation,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSending = isSendingMsg || mediaState.uploading;
  const isVideoUrl = (url: string) =>
    url.startsWith("data:video/") || !!url.match(/\.(mp4|webm|mov|avi)$/i);

  const otherUserIdStr = otherUserPrincipal?.toString() ?? userId;

  // Available for future display use
  const _displayName =
    (profile as any)?.displayName || truncatePrincipal(otherUserIdStr);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-void">
      {/* Dragon background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/gargoyle-dragon-bg.dim_1080x1920.png"
          alt=""
          className="w-full h-full object-cover opacity-15"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void/90 via-void/70 to-void/95" />
        <div
          className="absolute inset-0 opacity-4"
          style={{
            backgroundImage:
              "url(/assets/generated/dragon-scale-texture.dim_512x512.png)",
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pt-16 pb-4 px-4 border-b border-stone-800/60">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar placeholder */}
          <div className="w-10 h-10 rounded-sm bg-stone-800 border border-stone-700 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-stone-500" />
          </div>
          <div className="min-w-0">
            <h1 className="font-cinzel text-blood-red text-base font-bold tracking-widest truncate drop-shadow-[0_0_8px_rgba(139,0,0,0.6)]">
              DIRECT PUNCH
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isOtherOnline ? "bg-green-500" : "bg-stone-600"
                }`}
                title={isOtherOnline ? "Online" : "Offline"}
              />
              <span className="text-stone-500 text-xs font-mono truncate">
                {truncatePrincipal(otherUserIdStr)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-stone-600 flex-shrink-0">
          <Lock size={12} />
          <span className="text-xs font-mono">ENCRYPTED</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Not authenticated */}
        {!isAuthenticated && (
          <div
            data-ocid="directchat.error_state"
            className="flex flex-col items-center justify-center h-full text-center py-20"
          >
            <img
              src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
              alt="Dragon"
              className="w-32 h-32 object-contain opacity-60 mb-6"
              draggable={false}
            />
            <h2 className="font-cinzel text-blood-red text-2xl font-bold mb-3 tracking-wider">
              ENTER THE FORGE
            </h2>
            <p className="text-stone-400 font-mono text-sm max-w-xs">
              Login to punch with this soul. The Dragon guards all who enter.
            </p>
            <div className="mt-4 flex items-center gap-2 text-stone-600 text-xs font-mono">
              <Flame size={12} className="text-ember-orange" />
              <span>OPEN THE SIDE MENU TO LOGIN</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {isAuthenticated && convLoading && localMessages.length === 0 && (
          <div
            data-ocid="directchat.loading_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Loader2
              size={36}
              className="text-blood-red animate-spin mb-4 opacity-70"
            />
            <p className="text-stone-500 font-mono text-sm tracking-wider">
              THE DRAGON PREPARES THE FORGE…
            </p>
          </div>
        )}

        {/* Empty state */}
        {isAuthenticated && !convLoading && allMessages.length === 0 && (
          <div
            data-ocid="directchat.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <img
              src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
              alt="Dragon"
              className="w-20 h-20 object-contain opacity-40 mb-4"
              draggable={false}
            />
            <p className="text-stone-500 font-mono text-sm max-w-xs leading-relaxed">
              THE FORGE AWAITS YOUR FIRST PUNCH TO THIS SOUL
            </p>
          </div>
        )}

        {/* Messages */}
        {isAuthenticated &&
          allMessages.map((msg) => {
            const mine = msg.senderId.toString() === myPrincipalId;
            return (
              <div
                key={msg.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <MessageBubble
                  content={msg.content}
                  mediaBlobId={msg.mediaBlobId}
                  timestamp={msg.timestamp}
                  isMine={mine}
                  principalId={myPrincipalId}
                >
                  {msg.mediaBlobId && (
                    <MediaProtection principalId={myPrincipalId}>
                      {isVideoUrl(msg.mediaBlobId) ? (
                        <video
                          src={msg.mediaBlobId}
                          controls
                          className="max-w-full max-h-48 rounded-sm"
                          controlsList="nodownload"
                          disablePictureInPicture
                        >
                          <track kind="captions" />
                        </video>
                      ) : (
                        <img
                          src={msg.mediaBlobId}
                          alt="Media"
                          className="max-w-full max-h-48 rounded-sm object-cover"
                          draggable={false}
                        />
                      )}
                    </MediaProtection>
                  )}
                </MessageBubble>
              </div>
            );
          })}

        <div ref={messagesEndRef} />
      </div>

      {/* Media preview */}
      {mediaState.preview && (
        <div className="relative z-10 px-4 pb-2">
          <div className="flex items-center gap-3 bg-stone-900/90 border border-stone-700 rounded-sm p-3">
            {mediaState.file?.type.startsWith("video/") ? (
              <video
                src={mediaState.preview}
                className="w-16 h-16 object-cover rounded-sm"
              >
                <track kind="captions" />
              </video>
            ) : (
              <img
                src={mediaState.preview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-sm"
              />
            )}
            <div className="flex-1">
              <p className="text-stone-300 text-xs font-mono truncate">
                {mediaState.file?.name}
              </p>
              {mediaState.uploading && (
                <div className="mt-1 h-1 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blood-red transition-all duration-300"
                    style={{ width: `${mediaState.progress}%` }}
                  />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (mediaState.preview) URL.revokeObjectURL(mediaState.preview);
                setMediaState({
                  file: null,
                  preview: null,
                  uploading: false,
                  progress: 0,
                });
              }}
              className="text-stone-500 hover:text-blood-red text-lg leading-none font-mono"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="relative z-10 px-4 pb-6 pt-2 border-t border-stone-800/60">
        {!isAuthenticated ? (
          <div className="flex items-center justify-center py-3 text-stone-600 font-mono text-sm">
            <Lock size={14} className="mr-2" />
            LOGIN TO PUNCH
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-stone-900/90 border border-stone-700 rounded-sm px-3 py-2 focus-within:border-blood-red/60 transition-colors">
            {/* Media upload */}
            <MediaUploadGate onAllowed={handleUploadClick}>
              <button
                type="button"
                disabled={isSending}
                data-ocid="directchat.upload_button"
                className="text-stone-500 hover:text-ember-orange transition-colors p-1 flex-shrink-0 disabled:opacity-40"
                title="Upload photo or video (Identity required)"
              >
                <img
                  src="/assets/generated/dragon-icon-small.dim_32x32.png"
                  alt="Upload"
                  className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity"
                  draggable={false}
                  style={{ filter: "sepia(1) saturate(3) hue-rotate(330deg)" }}
                />
              </button>
            </MediaUploadGate>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Emoji picker */}
            <EmojiPicker onSelect={handleEmojiSelect} disabled={isSending} />

            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your punch…"
              rows={1}
              disabled={isSending}
              data-ocid="directchat.textarea"
              className="flex-1 bg-transparent text-stone-200 placeholder-stone-600 font-mono text-sm resize-none outline-none min-h-[24px] max-h-24 py-1 disabled:opacity-50"
              style={{ lineHeight: "1.5" }}
            />

            {/* Dragon claw send */}
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || (!inputText.trim() && !mediaState.file)}
              data-ocid="directchat.submit_button"
              className="flex-shrink-0 p-1 transition-all duration-200 disabled:opacity-30 hover:scale-110 active:scale-95"
              title="Send"
            >
              {isSending ? (
                <Loader2 size={22} className="animate-spin text-blood-red" />
              ) : (
                <img
                  src="/assets/generated/dragon-claw-send.dim_24x24.png"
                  alt="Send"
                  className="w-6 h-6 object-contain"
                  draggable={false}
                />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
