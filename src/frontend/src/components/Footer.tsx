import { Flame } from "lucide-react";
import React from "react";

export default function Footer() {
  const appId = encodeURIComponent(
    window.location.hostname || "foreverraw-gutpunch",
  );
  return (
    <footer className="py-4 px-6 border-t border-stone-900 bg-void text-center">
      <p className="text-stone-700 text-xs font-mono flex items-center justify-center gap-1">
        Built with <Flame size={12} className="text-blood-red inline" /> using{" "}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-600 hover:text-stone-400 transition-colors"
        >
          caffeine.ai
        </a>{" "}
        · © {new Date().getFullYear()} FOREVERRAW
      </p>
    </footer>
  );
}
