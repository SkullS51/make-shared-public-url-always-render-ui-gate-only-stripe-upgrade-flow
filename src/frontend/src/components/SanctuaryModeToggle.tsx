import { Flame, Shield } from "lucide-react";
import React from "react";
import { type SanctuaryMode, useApp } from "../contexts/AppContext";

export default function SanctuaryModeToggle() {
  const { sanctuaryMode, setSanctuaryMode } = useApp();

  const isPerimeter = sanctuaryMode === "PERIMETER_DEFENSE";

  const handleToggle = () => {
    setSanctuaryMode(isPerimeter ? "INNER_FORGE" : "PERIMETER_DEFENSE");
  };

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      {/* Label */}
      <span
        className="font-mono text-xs tracking-widest font-bold"
        style={{ color: "oklch(0.72 0.18 55)" }}
      >
        SANCTUARY
      </span>

      {/* Physical Switch Housing */}
      <div
        className="relative flex flex-col items-center"
        style={{
          width: 52,
          background:
            "linear-gradient(180deg, oklch(0.12 0.006 270) 0%, oklch(0.08 0.005 270) 100%)",
          border: "2px solid oklch(0.22 0.01 270)",
          borderRadius: 4,
          padding: "4px 6px",
          boxShadow:
            "inset 0 2px 6px oklch(0 0 0 / 0.6), 0 0 8px oklch(0 0 0 / 0.4)",
        }}
      >
        {/* Top label */}
        <span
          className="font-mono text-center leading-tight mb-1"
          style={{
            fontSize: 7,
            letterSpacing: "0.05em",
            color: isPerimeter ? "oklch(0.72 0.18 55)" : "oklch(0.30 0.01 60)",
            fontWeight: isPerimeter ? 700 : 400,
            transition: "color 0.2s",
          }}
        >
          PERIMETER
          <br />
          DEFENSE
        </span>

        {/* Switch Track */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={`Switch to ${isPerimeter ? "INNER FORGE" : "PERIMETER DEFENSE"}`}
          className="relative focus:outline-none"
          style={{
            width: 28,
            height: 44,
            background:
              "linear-gradient(180deg, oklch(0.14 0.006 270) 0%, oklch(0.10 0.005 270) 100%)",
            border: "1px solid oklch(0.28 0.01 270)",
            borderRadius: 3,
            boxShadow: "inset 0 2px 4px oklch(0 0 0 / 0.5)",
            cursor: "pointer",
            transition: "box-shadow 0.2s",
          }}
        >
          {/* Track groove */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 4,
              bottom: 4,
              width: 4,
              transform: "translateX(-50%)",
              background: "oklch(0.08 0.004 270)",
              borderRadius: 2,
              boxShadow: "inset 0 1px 3px oklch(0 0 0 / 0.8)",
            }}
          />

          {/* Lever Handle */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: `translateX(-50%) translateY(${isPerimeter ? "0px" : "18px"})`,
              top: 4,
              width: 22,
              height: 18,
              background: isPerimeter
                ? "linear-gradient(180deg, oklch(0.75 0.18 55) 0%, oklch(0.60 0.18 55) 50%, oklch(0.50 0.16 55) 100%)"
                : "linear-gradient(180deg, oklch(0.55 0.22 300) 0%, oklch(0.42 0.22 300) 50%, oklch(0.35 0.20 300) 100%)",
              borderRadius: 2,
              boxShadow: isPerimeter
                ? "0 2px 6px oklch(0.72 0.18 55 / 0.6), inset 0 1px 2px oklch(1 0 0 / 0.3)"
                : "0 2px 6px oklch(0.42 0.22 300 / 0.6), inset 0 1px 2px oklch(1 0 0 / 0.2)",
              transition:
                "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.25s, box-shadow 0.25s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Lever grip lines */}
            {[0, 1, 2].map((n) => (
              <div
                key={n}
                style={{
                  position: "absolute",
                  left: 3,
                  right: 3,
                  height: 1,
                  top: 5 + n * 3,
                  background: "oklch(1 0 0 / 0.25)",
                  borderRadius: 1,
                }}
              />
            ))}
          </div>
        </button>

        {/* Bottom label */}
        <span
          className="font-mono text-center leading-tight mt-1"
          style={{
            fontSize: 7,
            letterSpacing: "0.05em",
            color: !isPerimeter
              ? "oklch(0.55 0.22 300)"
              : "oklch(0.30 0.01 60)",
            fontWeight: !isPerimeter ? 700 : 400,
            transition: "color 0.2s",
          }}
        >
          INNER
          <br />
          FORGE
        </span>
      </div>

      {/* Active mode indicator */}
      <div
        className="font-mono text-center leading-tight"
        style={{
          fontSize: 7,
          letterSpacing: "0.08em",
          color: isPerimeter ? "oklch(0.72 0.18 55)" : "oklch(0.55 0.22 300)",
          transition: "color 0.2s",
        }}
      >
        {isPerimeter ? "● ACTIVE" : "● ACTIVE"}
      </div>
    </div>
  );
}
