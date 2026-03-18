import type React from "react";
import { parseMessageSegments } from "../lib/emojis";

interface MessageBubbleProps {
  content: string;
  mediaBlobId?: string | null;
  timestamp: bigint;
  isMine: boolean;
  principalId: string;
  children?: React.ReactNode; // for media content wrapped in MediaProtection
}

function renderContent(content: string) {
  const segments = parseMessageSegments(content);
  return segments.map((seg, i) => {
    if (seg.type === "emoji") {
      return (
        <img
          key={`emoji-${i}-${seg.emoji.id}`}
          src={seg.emoji.filename}
          alt={seg.emoji.name}
          title={seg.emoji.name}
          className="inline-block align-middle mx-0.5"
          style={{
            width: 24,
            height: 24,
            objectFit: "contain",
            verticalAlign: "middle",
          }}
          draggable={false}
        />
      );
    }
    return <span key={`text-${i}-${seg.value.slice(0, 8)}`}>{seg.value}</span>;
  });
}

function formatTime(timestamp: bigint) {
  return new Date(Number(timestamp) / 1_000_000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({
  content,
  timestamp,
  isMine,
  children,
}: MessageBubbleProps) {
  const showContent = content && content !== "📎 Media";

  return (
    <div
      className={`max-w-[75%] rounded-sm px-4 py-3 relative ${
        isMine
          ? "bg-blood-red/20 border border-blood-red/40 text-stone-100"
          : "bg-stone-900/80 border border-stone-700/60 text-stone-300"
      }`}
      style={{
        boxShadow: isMine
          ? "0 2px 12px rgba(139,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Stone crack texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none rounded-sm overflow-hidden"
        style={{
          backgroundImage:
            "url(/assets/generated/stone-texture.dim_512x512.png)",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Media content (wrapped in MediaProtection by parent) */}
      {children && (
        <div className="mb-2 rounded-sm overflow-hidden">{children}</div>
      )}

      {/* Text content with emoji rendering */}
      {showContent && (
        <p className="text-sm leading-relaxed relative z-10 font-mono break-words">
          {renderContent(content)}
        </p>
      )}

      {/* Timestamp */}
      <div
        className={`text-xs mt-1 font-mono ${
          isMine ? "text-blood-red/60 text-right" : "text-stone-600"
        }`}
      >
        {formatTime(timestamp)}
      </div>
    </div>
  );
}
