import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const BLOCK_KEYWORDS = [
  "dating",
  "nsfw",
  "hook up",
  "dm me",
  "relationship",
  "flirt",
  "hookup",
];

interface VillagePost {
  id: string;
  author: string;
  initials: string;
  text: string;
  timestamp: string;
  likes: number;
  replies: number;
  type: "text" | "image" | "video";
  trending?: boolean;
}

const SEED_POSTS: VillagePost[] = [
  {
    id: "1",
    author: "Sovereign_K",
    initials: "SK",
    text: "Day 47. Still in the tunnel. But I can see how it's different from day 1. The dragon doesn't drag you out — it teaches you to walk. 🐉",
    timestamp: "2 hours ago",
    likes: 34,
    replies: 7,
    type: "text",
    trending: true,
  },
  {
    id: "2",
    author: "RawTruth_Milo",
    initials: "RM",
    text: "Did the 5-4-3-2-1 grounding at 3am when the thoughts hit hard. It worked. Felt stupid doing it. Did it anyway. That's the war right there.",
    timestamp: "4 hours ago",
    likes: 61,
    replies: 12,
    type: "text",
    trending: true,
  },
  {
    id: "3",
    author: "ForgedByFire_D",
    initials: "FD",
    text: "Week 3 of therapist sessions. First time I said out loud what happened. World didn't end. Actually felt lighter. Resolution over management — that phrase hit different today.",
    timestamp: "6 hours ago",
    likes: 19,
    replies: 4,
    type: "text",
  },
  {
    id: "4",
    author: "SteelMind_Rae",
    initials: "SR",
    text: "Panic attack in the grocery store. Stood still. Breathed through it. Left with my bread. Small win but I'm counting it. 🔥",
    timestamp: "8 hours ago",
    likes: 88,
    replies: 21,
    type: "text",
  },
  {
    id: "5",
    author: "VoidWalker_T",
    initials: "VT",
    text: "Sharing my journal entry from the night I almost gave up vs. today. The contrast is everything. Keep going.",
    timestamp: "1 day ago",
    likes: 142,
    replies: 38,
    type: "text",
  },
];

export default function VillageFeed() {
  const [posts, setPosts] = useState<VillagePost[]>(SEED_POSTS);
  const [newPost, setNewPost] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reportConfirmed, setReportConfirmed] = useState<string | null>(null);

  const trending = posts.filter((p) => p.trending);

  const handlePost = () => {
    const lower = newPost.toLowerCase();
    if (BLOCK_KEYWORDS.some((kw) => lower.includes(kw))) {
      setBlocked(true);
      return;
    }
    if (!newPost.trim()) return;
    const post: VillagePost = {
      id: crypto.randomUUID(),
      author: "You",
      initials: "YO",
      text: newPost.trim(),
      timestamp: "just now",
      likes: 0,
      replies: 0,
      type: "text",
    };
    setPosts([post, ...posts]);
    setNewPost("");
    setBlocked(false);
  };

  const handleLike = (id: string) => {
    setPosts((ps) =>
      ps.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
    );
  };

  const handleReport = (id: string) => {
    setReportTarget(id);
  };

  const confirmBan = () => {
    if (reportTarget) {
      setPosts((ps) => ps.filter((p) => p.id !== reportTarget));
      setReportConfirmed(reportTarget);
      setReportTarget(null);
      setTimeout(() => setReportConfirmed(null), 3000);
    }
  };

  const TYPE_BADGE: Record<string, string> = {
    text: "TEXT",
    image: "IMAGE",
    video: "VIDEO",
  };

  const TYPE_COLOR: Record<string, string> = {
    text: "text-stone-500 border-stone-700",
    image: "text-ember-orange border-ember-orange/40",
    video: "text-deep-violet border-deep-violet/40",
  };

  return (
    <div className="min-h-screen bg-void text-stone-200 px-4 py-6 max-w-2xl mx-auto">
      {/* Dragon Ban Toast */}
      {reportConfirmed && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 border border-blood-red bg-void font-cinzel text-blood-red text-sm tracking-wider"
          style={{ boxShadow: "0 0 20px oklch(0.45 0.2 25 / 0.5)" }}
          data-ocid="village.ban.toast"
        >
          🐉 DRAGON BAN ISSUED
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-cinzel text-3xl font-bold text-blood-red tracking-widest mb-2">
          THE VILLAGE
        </h1>
        <p className="font-mono text-stone-500 text-sm">
          RAW STRUGGLES · REAL WINS · DRAGON RULES
        </p>
      </div>

      {/* Hot Right Now */}
      {trending.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-cinzel text-ember-orange text-sm tracking-widest">
              🔥 HOT RIGHT NOW
            </span>
            <div className="flex-1 h-px bg-ember-orange/20" />
          </div>
          <div className="space-y-3">
            {trending.map((post, idx) => (
              <div
                key={post.id}
                data-ocid={`village.trending.item.${idx + 1}`}
                className="border border-ember-orange/40 bg-void-800 p-4"
                style={{ boxShadow: "0 0 15px oklch(0.65 0.18 45 / 0.1)" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-ember-orange/20 border border-ember-orange/50 flex items-center justify-center">
                    <span className="font-cinzel text-xs text-ember-orange font-bold">
                      {post.initials}
                    </span>
                  </div>
                  <span className="font-cinzel text-ember-orange text-xs tracking-wider">
                    {post.author}
                  </span>
                  <span className="font-mono text-stone-600 text-xs ml-auto">
                    {post.timestamp}
                  </span>
                </div>
                <p className="font-mono text-stone-300 text-sm leading-relaxed">
                  {post.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Post */}
      <div className="border border-stone-700 bg-void-800 p-5 mb-8">
        <p className="font-cinzel text-stone-400 text-xs tracking-wider mb-3">
          FORGE A PUNCH
        </p>
        <Textarea
          data-ocid="village.create.textarea"
          value={newPost}
          onChange={(e) => {
            setNewPost(e.target.value);
            setBlocked(false);
          }}
          placeholder="Share your struggle, your win, your grounding moment..."
          rows={3}
          className="bg-void border-stone-700 font-mono text-stone-200 text-sm resize-none mb-3 focus:border-blood-red/60"
        />
        {/* Emoji shortcuts */}
        <div className="flex items-center gap-2 mb-3">
          {["🔥", "💀", "❤️", "⚡", "🐉"].map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => setNewPost((p) => p + em)}
              className="text-lg hover:scale-125 transition-transform"
              title={em}
            >
              {em}
            </button>
          ))}
          <span className="font-mono text-stone-700 text-xs ml-2">
            quick emojis
          </span>
        </div>

        {blocked && (
          <div
            className="border border-blood-red bg-blood-red/5 p-3 mb-3"
            data-ocid="village.blocked.error_state"
          >
            <p className="font-cinzel text-blood-red text-xs tracking-wider">
              🐉 THE DRAGON BLOCKS THIS. Raw struggle only. No dating/social
              content allowed.
            </p>
          </div>
        )}

        <Button
          data-ocid="village.create.submit_button"
          onClick={handlePost}
          disabled={!newPost.trim()}
          className="font-cinzel text-sm border border-blood-red bg-blood-red/20 text-blood-red hover:bg-blood-red/30 tracking-wider disabled:opacity-40"
        >
          THROW THE PUNCH
        </Button>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post, idx) => (
          <div
            key={post.id}
            data-ocid={`village.post.item.${idx + 1}`}
            className="border border-stone-800 bg-void-800 p-5 hover:border-stone-700 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blood-red/10 border border-blood-red/30 flex items-center justify-center shrink-0">
                <span className="font-cinzel text-xs text-blood-red font-bold">
                  {post.initials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-cinzel text-stone-200 text-sm font-semibold">
                    {post.author}
                  </span>
                  <span
                    className={`font-mono text-xs border px-1.5 py-0.5 ${TYPE_COLOR[post.type]}`}
                  >
                    {TYPE_BADGE[post.type]}
                  </span>
                  <span className="font-mono text-stone-600 text-xs ml-auto">
                    {post.timestamp}
                  </span>
                </div>
                <p className="font-mono text-stone-300 text-sm leading-relaxed">
                  {post.text}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-stone-900">
              <button
                type="button"
                data-ocid={`village.post.like.button.${idx + 1}`}
                onClick={() => handleLike(post.id)}
                className="font-mono text-xs text-stone-500 hover:text-ember-orange transition-colors flex items-center gap-1"
              >
                🔥 {post.likes}
              </button>
              <span className="font-mono text-xs text-stone-600 flex items-center gap-1">
                💬 {post.replies}
              </span>
              <button
                type="button"
                data-ocid={`village.post.report.button.${idx + 1}`}
                onClick={() => handleReport(post.id)}
                className="ml-auto font-mono text-xs text-stone-700 hover:text-blood-red transition-colors"
              >
                report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Dragon Ban Dialog */}
      <Dialog
        open={!!reportTarget}
        onOpenChange={(o) => !o && setReportTarget(null)}
      >
        <DialogContent
          className="bg-void border-blood-red/50"
          data-ocid="village.report.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-cinzel text-blood-red tracking-wider">
              🐉 CALL THE DRAGON?
            </DialogTitle>
          </DialogHeader>
          <p className="font-mono text-stone-300 text-sm">
            Reporting this post sends it to the dragon. If valid, the poster
            receives a permanent ban. The Village has zero tolerance for
            violations.
          </p>
          <DialogFooter className="gap-3">
            <button
              type="button"
              data-ocid="village.report.cancel_button"
              onClick={() => setReportTarget(null)}
              className="font-mono text-sm text-stone-500 hover:text-stone-300 transition-colors"
            >
              cancel
            </button>
            <Button
              data-ocid="village.report.confirm_button"
              onClick={confirmBan}
              className="font-cinzel border border-blood-red bg-blood-red/20 text-blood-red hover:bg-blood-red/30 tracking-wider"
            >
              CALL THE DRAGON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="text-center mt-12 pt-6 border-t border-stone-900">
        <p className="font-mono text-stone-700 text-xs">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-600 hover:text-ember-orange transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
