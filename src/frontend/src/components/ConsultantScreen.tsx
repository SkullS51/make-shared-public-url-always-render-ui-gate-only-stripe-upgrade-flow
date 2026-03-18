import { Brain, ChevronRight, Flame } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const DRAGONFLIES_TIPS = [
  {
    title: "D – Detach",
    body: "Step back from the emotional charge. Observe the situation as the Dragon observes from above — with clarity, not reaction.",
  },
  {
    title: "R – Recognize",
    body: "Name the pattern. Financial pressure? Urgency manipulation? Coercion? Naming it strips its power.",
  },
  {
    title: "A – Assess",
    body: "What is the actual risk? Separate the real threat from the manufactured fear.",
  },
  {
    title: "G – Ground",
    body: "Return to your body. Breathe. The Dragon does not act from heightened reaction — it acts from power.",
  },
  {
    title: "O – Options",
    body: "List your choices. You always have more than one. The cage is often unlocked.",
  },
  {
    title: "N – Navigate",
    body: "Choose the path that serves your long-term sovereignty, not short-term relief.",
  },
  {
    title: "F – Fortify",
    body: "Strengthen your boundaries. Document everything. The Dragon leaves no evidence trail for others to exploit.",
  },
  {
    title: "L – Learn",
    body: "Extract the lesson. Every gut punch is data. Use it to evolve your armor.",
  },
  {
    title: "I – Integrate",
    body: "Absorb the experience into your identity. You are not the victim — you are the forge.",
  },
  {
    title: "E – Emerge",
    body: "Rise from the encounter stronger. The Dragon is not broken by fire — it is made of it.",
  },
  {
    title: "S – Sovereign",
    body: "Reclaim your autonomy. Your decisions, your timeline, your terms. Always.",
  },
];

export default function ConsultantScreen() {
  const { identity } = useInternetIdentity();
  const { sanctuaryMode } = useApp();
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const isInnerForge = sanctuaryMode === "INNER_FORGE";

  return (
    <div className="relative min-h-screen bg-void">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
          alt=""
          className="absolute bottom-8 right-8 w-48 h-48 object-contain opacity-5"
          draggable={false}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(/assets/generated/void-metal-texture.dim_512x512.png)",
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      <div className="relative z-10 pt-8 px-4 pb-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Brain
              style={{
                color: isInnerForge
                  ? "oklch(0.55 0.22 300)"
                  : "oklch(0.50 0.20 25)",
              }}
              size={28}
            />
            <h1
              className="font-cinzel text-2xl font-bold tracking-widest"
              style={{
                color: isInnerForge
                  ? "oklch(0.55 0.22 300)"
                  : "oklch(0.50 0.20 25)",
              }}
            >
              CONSULTANT
            </h1>
          </div>
          <p className="text-stone-500 font-mono text-sm tracking-wider">
            DRAGONFLIES PROTOCOL · RESOLUTION FRAMEWORK
          </p>
          {isInnerForge && (
            <div
              className="inline-flex items-center gap-2 mt-2 px-3 py-1"
              style={{
                background: "oklch(0.55 0.22 300 / 0.08)",
                border: "1px solid oklch(0.55 0.22 300 / 0.3)",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "oklch(0.55 0.22 300)" }}
              />
              <span
                className="font-mono text-xs tracking-widest"
                style={{ color: "oklch(0.55 0.22 300)" }}
              >
                INNER FORGE · ANXIETY TOOLS · SILENT MODE
              </span>
            </div>
          )}
        </div>

        {/* Intro */}
        <div
          className="p-5 mb-6"
          style={{
            background: "oklch(0.09 0.006 270)",
            border: `1px solid ${isInnerForge ? "oklch(0.55 0.22 300 / 0.3)" : "oklch(0.38 0.18 25 / 0.3)"}`,
          }}
        >
          <div className="flex items-start gap-3">
            <Flame
              size={20}
              className="text-ember-orange mt-0.5 flex-shrink-0"
            />
            <div>
              <h2 className="font-cinzel text-stone-200 font-bold tracking-wider mb-2">
                THE DRAGONFLIES PROTOCOL
              </h2>
              <p className="text-stone-400 font-mono text-sm leading-relaxed">
                Eleven steps to transform emotional gut punches into sovereign
                power. Each letter is a weapon. Master them all.
              </p>
              {isInnerForge && (
                <p
                  className="font-mono text-xs mt-2"
                  style={{ color: "oklch(0.55 0.22 300)" }}
                >
                  ◆ Silent Mode — no audio, no alerts, no notifications
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {DRAGONFLIES_TIPS.map((tip, i) => (
            <div
              key={tip.title}
              style={{
                background: "oklch(0.09 0.006 270)",
                border: "1px solid oklch(0.18 0.008 270)",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveStep(activeStep === i ? null : i)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left transition-colors"
                style={{ background: "transparent" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "oklch(0.12 0.006 270)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isInnerForge
                      ? "oklch(0.55 0.22 300 / 0.2)"
                      : "oklch(0.38 0.18 25 / 0.2)",
                    border: `1px solid ${isInnerForge ? "oklch(0.55 0.22 300 / 0.4)" : "oklch(0.38 0.18 25 / 0.4)"}`,
                  }}
                >
                  <span
                    className="font-cinzel font-bold text-sm"
                    style={{
                      color: isInnerForge
                        ? "oklch(0.55 0.22 300)"
                        : "oklch(0.50 0.20 25)",
                    }}
                  >
                    {tip.title[0]}
                  </span>
                </div>
                <span className="font-cinzel text-stone-200 text-sm tracking-wider flex-1">
                  {tip.title}
                </span>
                <ChevronRight
                  size={16}
                  className={`text-stone-600 transition-transform duration-200 ${
                    activeStep === i ? "rotate-90" : ""
                  }`}
                />
              </button>
              {activeStep === i && (
                <div
                  className="px-4 pb-4 pt-1"
                  style={{ borderTop: "1px solid oklch(0.16 0.008 270)" }}
                >
                  <p className="text-stone-400 font-mono text-sm leading-relaxed">
                    {tip.body}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Login nudge */}
        {!identity && (
          <p className="mt-6 text-center text-stone-600 font-mono text-xs">
            Login to save your progress and unlock advanced tools
          </p>
        )}
      </div>
    </div>
  );
}
