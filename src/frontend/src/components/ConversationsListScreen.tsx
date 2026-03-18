import { useNavigate } from "@tanstack/react-router";
import { Flame, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  type ConversationEntry,
  getConversations,
} from "../lib/conversationStore";

function truncatePrincipal(id: string): string {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

function formatTimestamp(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export default function ConversationsListScreen() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);

  // Load and refresh conversations from localStorage
  useEffect(() => {
    setConversations(getConversations());
    // Poll for updates (other tabs, etc.)
    const interval = setInterval(() => {
      setConversations(getConversations());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenConversation = (userId: string) => {
    navigate({ to: `/chat/${userId}` });
  };

  const handleFindSouls = () => {
    navigate({ to: "/people" });
  };

  return (
    <div className="relative min-h-screen bg-void">
      {/* Texture overlay */}
      <div
        className="absolute inset-0 z-0 opacity-4 pointer-events-none"
        style={{
          backgroundImage:
            "url(/assets/generated/dragon-scale-texture.dim_512x512.png)",
          backgroundSize: "256px 256px",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
            alt="Dragon"
            className="w-16 h-16 object-contain opacity-70 mx-auto mb-4"
            draggable={false}
          />
          <h1 className="font-cinzel text-blood-red text-2xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(139,0,0,0.7)]">
            THE FORGE
          </h1>
          <p className="text-stone-500 text-xs font-mono tracking-wider mt-1">
            YOUR ACTIVE CONVERSATIONS
          </p>
        </div>

        {/* Not authenticated */}
        {!isAuthenticated ? (
          <div
            data-ocid="conversations.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div
              className="border border-blood-red/30 bg-blood-red/5 rounded-sm p-8 max-w-sm w-full"
              style={{ boxShadow: "0 0 20px rgba(139,0,0,0.15)" }}
            >
              <img
                src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
                alt="Dragon"
                className="w-24 h-24 object-contain opacity-50 mx-auto mb-4"
                draggable={false}
              />
              <h2 className="font-cinzel text-blood-red text-lg font-bold tracking-widest mb-3">
                LOGIN TO ENTER THE FORGE
              </h2>
              <p className="text-stone-400 font-mono text-sm leading-relaxed mb-4">
                Only verified souls can access their conversations. The Dragon
                protects all who enter.
              </p>
              <div className="flex items-center justify-center gap-2 text-stone-600 text-xs font-mono">
                <Flame size={12} className="text-ember-orange" />
                <span>OPEN THE SIDE MENU TO LOGIN</span>
              </div>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          /* Empty state */
          <div
            data-ocid="conversations.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div
              className="border border-stone-700 bg-stone-900/40 rounded-sm p-10 max-w-sm w-full"
              style={{
                backgroundImage:
                  "url(/assets/generated/stone-texture.dim_512x512.png)",
                backgroundSize: "200px 200px",
                backgroundBlendMode: "overlay",
              }}
            >
              <MessageCircle
                size={48}
                className="text-stone-700 mx-auto mb-4"
              />
              <p className="text-stone-500 font-mono text-sm mb-2 tracking-wider leading-relaxed">
                NO ACTIVE CONVERSATIONS
              </p>
              <p className="text-stone-700 font-mono text-xs mb-6">
                FIND SOULS TO PUNCH WITH
              </p>
              <button
                type="button"
                onClick={handleFindSouls}
                data-ocid="conversations.find_souls.button"
                className="w-full py-3 font-cinzel text-sm font-bold tracking-widest text-blood-red border border-blood-red/50 bg-blood-red/10 hover:bg-blood-red/20 rounded-sm transition-all duration-200"
                style={{ boxShadow: "0 0 12px rgba(139,0,0,0.2)" }}
              >
                FIND SOULS
              </button>
            </div>
          </div>
        ) : (
          /* Conversations list */
          <div className="space-y-2">
            {conversations.map((conv, idx) => (
              <button
                type="button"
                key={conv.userId}
                data-ocid={`conversations.item.${idx + 1}`}
                onClick={() => handleOpenConversation(conv.userId)}
                className="w-full flex items-center gap-4 bg-stone-900/70 border border-stone-800 hover:border-blood-red/40 rounded-sm p-4 transition-all duration-200 text-left group"
                style={{
                  backgroundImage:
                    "url(/assets/generated/stone-texture.dim_512x512.png)",
                  backgroundSize: "200px 200px",
                  backgroundBlendMode: "overlay",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-sm bg-stone-800 border border-stone-700 flex items-center justify-center">
                    <img
                      src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
                      alt=""
                      className="w-8 h-8 object-contain opacity-60"
                      draggable={false}
                    />
                  </div>
                  {conv.unreadCount > 0 && (
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blood-red flex items-center justify-center"
                      style={{ boxShadow: "0 0 8px rgba(139,0,0,0.6)" }}
                    >
                      <span className="text-white text-xs font-bold font-mono leading-none">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-cinzel text-stone-200 text-sm font-bold tracking-wide truncate group-hover:text-blood-red transition-colors">
                      {conv.displayName || truncatePrincipal(conv.userId)}
                    </h3>
                    <span className="text-stone-600 text-xs font-mono flex-shrink-0 ml-2">
                      {formatTimestamp(conv.lastTimestamp)}
                    </span>
                  </div>
                  <p className="text-stone-500 font-mono text-xs truncate">
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            ))}

            {/* Find more souls */}
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={handleFindSouls}
                data-ocid="conversations.find_souls.button"
                className="px-6 py-2 font-cinzel text-xs font-bold tracking-widest text-ember-orange border border-ember-orange/40 bg-ember-orange/10 hover:bg-ember-orange/20 rounded-sm transition-all duration-200"
              >
                FIND MORE SOULS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
