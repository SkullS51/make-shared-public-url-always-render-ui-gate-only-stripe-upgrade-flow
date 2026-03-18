import { Principal } from "@dfinity/principal";
import { Compass, Flame, Loader2, Lock } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import EmojiPicker from "./EmojiPicker";
import GatekeeperModal from "./GatekeeperModal";
import MediaProtection from "./MediaProtection";
import MediaUploadGate from "./MediaUploadGate";
import MessageBubble from "./MessageBubble";
import SensoryGroundingWheel from "./SensoryGroundingWheel";
import SovereigntyMeter from "./SovereigntyMeter";

// Local message type for client-side chat
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

// Generate a simple unique ID
function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ChatScreen() {
  const { identity } = useInternetIdentity();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [mediaState, setMediaState] = useState<MediaUploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const principalId = identity?.getPrincipal().toString() ?? "";
  const isAuthenticated = !!identity;

  const { data: _profile } = useGetCallerUserProfile();

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // Insert emoji syntax at cursor position in textarea
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
    if (!isAuthenticated) return;
    const text = inputText.trim();
    if (!text && !mediaState.file) return;

    const senderPrincipal = identity!.getPrincipal();
    const broadcastPrincipal = Principal.fromText("2vxsx-fae");

    try {
      if (mediaState.file) {
        setMediaState((prev) => ({ ...prev, uploading: true, progress: 30 }));

        // Read file as data URL for local preview
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("File read failed"));
          reader.readAsDataURL(mediaState.file!);
        });

        setMediaState((prev) => ({ ...prev, progress: 80 }));

        const newMsg: LocalMessage = {
          id: genId(),
          senderId: senderPrincipal,
          receiverId: broadcastPrincipal,
          content: text || "📎 Media",
          timestamp: BigInt(Date.now()) * BigInt(1_000_000),
          isRead: false,
          mediaBlobId: dataUrl,
        };

        setMessages((prev) => [...prev, newMsg]);

        if (mediaState.preview) URL.revokeObjectURL(mediaState.preview);
        setMediaState({
          file: null,
          preview: null,
          uploading: false,
          progress: 0,
        });
      } else {
        setIsSendingMsg(true);

        const newMsg: LocalMessage = {
          id: genId(),
          senderId: senderPrincipal,
          receiverId: broadcastPrincipal,
          content: text,
          timestamp: BigInt(Date.now()) * BigInt(1_000_000),
          isRead: false,
          mediaBlobId: null,
        };

        setMessages((prev) => [...prev, newMsg]);
        setIsSendingMsg(false);
      }

      setInputText("");
    } catch (err) {
      console.error("Send failed:", err);
      setMediaState((prev) => ({ ...prev, uploading: false, progress: 0 }));
      setIsSendingMsg(false);
    }
  }, [inputText, mediaState, isAuthenticated, identity]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSending = isSendingMsg || mediaState.uploading;

  const isVideoUrl = (url: string) =>
    url.startsWith("data:video/") || !!url.match(/\.(mp4|webm|mov|avi)$/i);

  return (
    <>
      {/* Gatekeeper — one-time dismissible overlay */}
      <GatekeeperModal />

      {/* Sensory Grounding Wheel overlay */}
      {showGrounding && (
        <SensoryGroundingWheel onClose={() => setShowGrounding(false)} />
      )}

      <div className="relative flex flex-col h-screen overflow-hidden bg-void">
        {/* Sovereignty Meter — fixed left edge */}
        <SovereigntyMeter />

        {/* Dragon background with breathing animation */}
        <div className="absolute inset-0 z-0">
          {/* Breathing dragon layer */}
          <img
            src="/assets/generated/dragon-breathing-bg-transparent.dim_1080x1920.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-10"
            draggable={false}
            style={{
              animation: "dragon-breathe 4s ease-in-out infinite",
            }}
          />
          <img
            src="/assets/generated/gargoyle-dragon-bg.dim_1080x1920.png"
            alt=""
            className="w-full h-full object-cover opacity-10"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/60 to-void/90" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "url(/assets/generated/dragon-scale-texture.dim_512x512.png)",
              backgroundSize: "256px 256px",
            }}
          />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-center pt-16 pb-4 px-4 border-b border-stone-800/60">
          <div className="text-center">
            <h1 className="font-cinzel text-blood-red text-xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(139,0,0,0.8)]">
              GUT PUNCH
            </h1>
            <p className="text-stone-500 text-xs font-mono tracking-wider mt-1">
              FOREVERRAW · UNLIMITED · UNFILTERED
            </p>
          </div>
          <div className="absolute right-4 flex items-center gap-1 text-stone-600">
            <Lock size={12} />
            <span className="text-xs font-mono">ENCRYPTED</span>
          </div>
        </div>

        {/* Messages */}
        <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {!isAuthenticated && (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
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
                Login to unleash your gut punches. The Dragon protects all who
                enter.
              </p>
              <div className="mt-4 flex items-center gap-2 text-stone-600 text-xs font-mono">
                <Flame size={12} className="text-ember-orange" />
                <span>OPEN THE SIDE MENU TO LOGIN</span>
              </div>
            </div>
          )}

          {isAuthenticated && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Flame size={40} className="text-blood-red mb-4 opacity-60" />
              <p className="text-stone-500 font-mono text-sm">
                THE FORGE AWAITS YOUR FIRST PUNCH
              </p>
            </div>
          )}

          {isAuthenticated &&
            messages.map((msg) => {
              const mine = msg.senderId.toString() === principalId;
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
                    principalId={principalId}
                  >
                    {msg.mediaBlobId && (
                      <MediaProtection principalId={principalId}>
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
                  if (mediaState.preview)
                    URL.revokeObjectURL(mediaState.preview);
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
              {/* Media upload button — gated behind MediaUploadGate */}
              <MediaUploadGate onAllowed={handleUploadClick}>
                <button
                  type="button"
                  disabled={isSending}
                  data-ocid="chat.upload_button"
                  className="text-stone-500 hover:text-ember-orange transition-colors p-1 flex-shrink-0 disabled:opacity-40"
                  title="Upload photo or video (Identity required)"
                >
                  <img
                    src="/assets/generated/dragon-icon-small.dim_32x32.png"
                    alt="Upload"
                    className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity"
                    draggable={false}
                    style={{
                      filter: "sepia(1) saturate(3) hue-rotate(330deg)",
                    }}
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
                data-ocid="chat.textarea"
                className="flex-1 bg-transparent text-stone-200 placeholder-stone-600 font-mono text-sm resize-none outline-none min-h-[24px] max-h-24 py-1 disabled:opacity-50"
                style={{ lineHeight: "1.5" }}
              />

              {/* Dragon claw send button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || (!inputText.trim() && !mediaState.file)}
                data-ocid="chat.submit_button"
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

        {/* Grounding Wheel floating trigger */}
        <button
          type="button"
          onClick={() => setShowGrounding(true)}
          className="fixed bottom-24 right-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-sm font-cinzel text-xs font-bold tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "oklch(0.08 0.006 270 / 0.9)",
            border: "1px solid oklch(0.30 0.10 145 / 0.6)",
            color: "oklch(0.55 0.20 145)",
            boxShadow: "0 0 12px oklch(0.55 0.20 145 / 0.2)",
            backdropFilter: "blur(4px)",
          }}
          title="Open Sensory Grounding Protocol"
          data-ocid="chat.grounding_button"
        >
          <Compass size={13} />
          GROUND
        </button>
      </div>
    </>
  );
}
