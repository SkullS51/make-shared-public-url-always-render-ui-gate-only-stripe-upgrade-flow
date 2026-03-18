import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface MediaProtectionProps {
  children: React.ReactNode;
  principalId: string;
}

export default function MediaProtection({
  children,
  principalId,
}: MediaProtectionProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const containerRef = useRef<HTMLDivElement>(null);
  const bannedRef = useRef(false);

  const triggerBan = useCallback(async () => {
    if (bannedRef.current) return;
    bannedRef.current = true;

    // Call backend to permanently ban the authenticated user
    try {
      if (actor && identity && !identity.getPrincipal().isAnonymous()) {
        await actor.banUserForMediaTheft(
          "Media theft detected by Dragon protection system",
        );
      }
    } catch {
      // Silently fail — ban overlay still shows
    }

    // Show full-screen ban overlay
    const overlay = document.createElement("div");
    overlay.id = "dragon-ban-overlay";
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Cinzel', serif;
    `;
    overlay.innerHTML = `
      <img src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png" 
           style="width:160px;height:160px;object-fit:contain;margin-bottom:32px;opacity:0.9;" />
      <h1 style="color:#8b0000;font-size:1.5rem;font-weight:bold;letter-spacing:0.2em;text-align:center;margin-bottom:16px;text-shadow:0 0 20px rgba(139,0,0,0.8);">
        THE DRAGON CAUGHT YOU STEALING
      </h1>
      <p style="color:#dc2626;font-size:1rem;letter-spacing:0.1em;text-align:center;max-width:400px;line-height:1.6;">
        Account permanently removed.
      </p>
      <p style="color:#4a4a4a;font-size:0.75rem;margin-top:32px;font-family:monospace;letter-spacing:0.1em;">
        FOREVERRAW · ZERO TOLERANCE · ZERO MERCY
      </p>
    `;
    document.body.appendChild(overlay);

    // Reload after 4 seconds — BanGate will catch the ban on reload
    setTimeout(() => {
      window.location.reload();
    }, 4000);
  }, [actor, identity]);

  // Block right-click on container
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      triggerBan();
    },
    [triggerBan],
  );

  // Block drag
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      triggerBan();
    },
    [triggerBan],
  );

  // Global keyboard listener for Ctrl+S, Ctrl+C, PrintScreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = containerRef.current;
      if (!el) return;

      const isPrintScreen = e.key === "PrintScreen";
      const isCtrlS = (e.ctrlKey || e.metaKey) && e.key === "s";
      const isCtrlC = (e.ctrlKey || e.metaKey) && e.key === "c";

      if (isPrintScreen || isCtrlS || isCtrlC) {
        const hasMedia = el.querySelector("img, video");
        if (hasMedia) {
          e.preventDefault();
          triggerBan();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [triggerBan]);

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {children}

      {/* Invisible watermark overlay */}
      {principalId && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 10 }}
          aria-hidden="true"
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-30deg)",
              color: "rgba(255,255,255,0.07)",
              fontSize: "10px",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
              letterSpacing: "0.05em",
              pointerEvents: "none",
              userSelect: "none",
              textShadow: "none",
            }}
          >
            {principalId}
          </div>
        </div>
      )}
    </div>
  );
}
