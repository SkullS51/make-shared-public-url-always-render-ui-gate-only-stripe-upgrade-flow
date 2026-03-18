import React, { useState } from "react";
import { sonicModule } from "../lib/sonicModule";

export default function MasterStrikeButton() {
  const [pressing, setPressing] = useState(false);
  const [fired, setFired] = useState(false);

  const handleStrike = async () => {
    if (pressing) return;
    setPressing(true);
    setFired(false);

    try {
      await sonicModule.playForgeStrike();
      setFired(true);
    } catch {
      // Audio context handled internally
    }

    setTimeout(() => {
      setPressing(false);
      setTimeout(() => setFired(false), 800);
    }, 200);
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Label above */}
      <span
        className="font-mono font-bold tracking-widest"
        style={{
          fontSize: 8,
          color: "oklch(0.72 0.18 55)",
          letterSpacing: "0.15em",
        }}
      >
        MASTER STRIKE
      </span>

      {/* Button */}
      <button
        type="button"
        onClick={handleStrike}
        disabled={pressing}
        aria-label="Master Strike — Audio Handshake"
        style={{
          width: 72,
          height: 72,
          borderRadius: 4,
          background: pressing
            ? "linear-gradient(145deg, oklch(0.12 0.006 270) 0%, oklch(0.18 0.008 270) 100%)"
            : "linear-gradient(145deg, oklch(0.28 0.008 270) 0%, oklch(0.18 0.006 270) 50%, oklch(0.12 0.005 270) 100%)",
          border: `2px solid ${fired ? "oklch(0.72 0.18 55)" : "oklch(0.35 0.01 270)"}`,
          boxShadow: pressing
            ? "inset 0 4px 8px oklch(0 0 0 / 0.8), 0 0 4px oklch(0.72 0.18 55 / 0.2)"
            : fired
              ? "0 0 20px oklch(0.72 0.18 55 / 0.8), 0 0 40px oklch(0.72 0.18 55 / 0.4), inset 0 1px 2px oklch(1 0 0 / 0.1)"
              : "0 0 12px oklch(0.72 0.18 55 / 0.3), 0 4px 12px oklch(0 0 0 / 0.6), inset 0 1px 2px oklch(1 0 0 / 0.1)",
          transform: pressing
            ? "scale(0.94) translateY(2px)"
            : "scale(1) translateY(0)",
          transition: "all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)",
          cursor: pressing ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Metallic rim */}
        <div
          style={{
            position: "absolute",
            inset: 3,
            borderRadius: 2,
            border: "1px solid oklch(0.30 0.008 270)",
            pointerEvents: "none",
          }}
        />

        {/* Dragon Crest Image */}
        <img
          src="/assets/generated/dragon-crest.dim_256x256.png"
          alt="Dragon Style Crest"
          draggable={false}
          style={{
            width: 48,
            height: 48,
            objectFit: "contain",
            opacity: pressing ? 0.6 : fired ? 1 : 0.85,
            filter: fired
              ? "drop-shadow(0 0 6px oklch(0.72 0.18 55)) brightness(1.3)"
              : "drop-shadow(0 0 2px oklch(0.72 0.18 55 / 0.5))",
            transition: "opacity 0.15s, filter 0.15s",
            userSelect: "none",
          }}
        />

        {/* Amber rim glow overlay on hover/fire */}
        {fired && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 2,
              background:
                "radial-gradient(circle, oklch(0.72 0.18 55 / 0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        )}
      </button>

      {/* Status indicator */}
      <span
        className="font-mono text-center"
        style={{
          fontSize: 7,
          letterSpacing: "0.1em",
          color: fired
            ? "oklch(0.72 0.18 55)"
            : pressing
              ? "oklch(0.55 0.22 300)"
              : "oklch(0.30 0.01 60)",
          transition: "color 0.2s",
        }}
      >
        {fired ? "STRIKE FIRED" : pressing ? "ENGAGING..." : "AUDIO HANDSHAKE"}
      </span>
    </div>
  );
}
