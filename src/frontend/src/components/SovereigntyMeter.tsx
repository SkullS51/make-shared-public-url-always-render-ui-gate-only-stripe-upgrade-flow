import React, { useEffect, useState } from "react";
import { useApp } from "../contexts/AppContext";
import type { BpmCategory } from "./HeartRateMonitor";

function getMeterColor(category: BpmCategory | "idle"): string {
  switch (category) {
    case "crimson":
      return "oklch(0.50 0.25 25)";
    case "amber":
      return "oklch(0.72 0.18 55)";
    case "sovereign":
      return "oklch(0.55 0.20 145)";
    default:
      return "oklch(0.35 0.05 270)";
  }
}

function getSovereigntyScore(
  bpm: number | null,
  category: BpmCategory | "idle",
): number {
  if (!bpm) return 50;
  switch (category) {
    case "sovereign":
      return Math.min(95, 70 + Math.max(0, 85 - bpm));
    case "amber":
      return 50;
    case "crimson":
      return Math.max(15, 50 - (bpm - 100));
    default:
      return 50;
  }
}

export default function SovereigntyMeter() {
  const { bpmData } = useApp();
  const [displayScore, setDisplayScore] = useState(50);
  const [pulse, setPulse] = useState(false);

  const targetScore = getSovereigntyScore(
    bpmData?.bpm ?? null,
    bpmData?.category ?? "idle",
  );
  const color = getMeterColor(bpmData?.category ?? "idle");

  // Smooth score animation
  useEffect(() => {
    const diff = targetScore - displayScore;
    if (Math.abs(diff) < 0.5) return;
    const timer = setTimeout(() => {
      setDisplayScore((prev) => prev + diff * 0.1);
    }, 50);
    return () => clearTimeout(timer);
  }, [targetScore, displayScore]);

  // Pulse on BPM update
  useEffect(() => {
    if (bpmData?.bpm) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [bpmData?.bpm]);

  const scoreInt = Math.round(displayScore);

  return (
    <div
      className="fixed left-0 top-0 bottom-0 z-10 flex flex-col items-center justify-center pointer-events-none"
      style={{ width: 28 }}
      aria-hidden="true"
    >
      {/* Meter track */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: 6,
          height: "60vh",
          background: "oklch(0.10 0.004 270)",
          border: "1px solid oklch(0.18 0.006 270)",
        }}
      >
        {/* Fill bar — rises from bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-700"
          style={{
            height: `${displayScore}%`,
            background: `linear-gradient(to top, ${color}, ${color}80)`,
            boxShadow: `0 0 8px ${color}60`,
            opacity: pulse ? 1 : 0.7,
          }}
        />

        {/* Tick marks */}
        {[25, 50, 75].map((tick) => (
          <div
            key={tick}
            className="absolute left-0 right-0"
            style={{
              bottom: `${tick}%`,
              height: 1,
              background: "oklch(0.20 0.006 270)",
            }}
          />
        ))}
      </div>

      {/* Score label */}
      <div
        className="mt-2 font-mono text-center"
        style={{
          fontSize: 8,
          color: color,
          writingMode: "vertical-lr",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
          opacity: 0.7,
          letterSpacing: "0.05em",
        }}
      >
        {scoreInt}
      </div>

      {/* Sovereignty label */}
      <div
        className="mt-1 font-cinzel text-center"
        style={{
          fontSize: 6,
          color: "oklch(0.30 0.01 270)",
          writingMode: "vertical-lr",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
          letterSpacing: "0.1em",
        }}
      >
        SOVEREIGNTY
      </div>
    </div>
  );
}
