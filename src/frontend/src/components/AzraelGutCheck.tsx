import { RotateCcw, Zap } from "lucide-react";
import { useEffect, useState } from "react";

type Phase = "IDLE" | "DESTROY" | "BUILD";

interface TrackRecord {
  id: string;
  title: string;
  type: string;
  frequency: string;
}

const TRACK_RECORDS: Record<"DESTROY" | "BUILD", TrackRecord[]> = {
  DESTROY: [
    {
      id: "D1",
      title: "VOID-METALLURGY // AURAL HEMORRHAGE",
      type: "Catharsis/Noise",
      frequency: "Distorted",
    },
    {
      id: "D2",
      title: "SYSTEMIC_RAGE // BASS_FRACTURE",
      type: "Aggression",
      frequency: "Low/Sub",
    },
  ],
  BUILD: [
    {
      id: "B1",
      title: "NEURAL_SCAFFOLD // ISO-BINAURAL",
      type: "Structure",
      frequency: "432Hz/Steady",
    },
    {
      id: "B2",
      title: "RECONSTRUCTION_LATTICE // AMBIENT_VOID",
      type: "Equilibrium",
      frequency: "High/Resonant",
    },
  ],
};

export default function AzraelGutCheck() {
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [activeTrack, setActiveTrack] = useState<TrackRecord | null>(null);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (phase === "DESTROY") {
      interval = setInterval(() => setGlitch((prev) => !prev), 100);
    } else if (phase === "BUILD") {
      interval = setInterval(() => setGlitch((prev) => !prev), 1000);
    } else {
      setGlitch(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase]);

  const initiateDestroy = () => {
    const tracks = TRACK_RECORDS.DESTROY;
    setPhase("DESTROY");
    setActiveTrack(tracks[Math.floor(Math.random() * tracks.length)]);
  };

  const initiateBuild = () => {
    const tracks = TRACK_RECORDS.BUILD;
    setPhase("BUILD");
    setActiveTrack(tracks[Math.floor(Math.random() * tracks.length)]);
  };

  const reset = () => {
    setPhase("IDLE");
    setActiveTrack(null);
    setGlitch(false);
  };

  const isDestroy = phase === "DESTROY";
  const isBuild = phase === "BUILD";
  const isActive = phase !== "IDLE";

  return (
    <div
      className="p-5 font-mono"
      style={{
        border: "1px solid oklch(0.22 0.01 270)",
        background: "oklch(0.09 0.006 270)",
      }}
      data-ocid="azrael.panel"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <Zap
          size={18}
          className={
            isDestroy
              ? "text-blood-red"
              : isBuild
                ? "text-ember-orange"
                : "text-stone-500"
          }
        />
        <h3 className="font-cinzel text-stone-300 text-sm font-bold tracking-wider">
          AZRAEL GUT CHECK
        </h3>
        {isActive && (
          <div
            className="ml-auto text-xs px-2 py-0.5 tracking-widest"
            style={{
              background: isDestroy
                ? "oklch(0.38 0.18 25 / 0.15)"
                : "oklch(0.62 0.18 45 / 0.15)",
              border: `1px solid ${
                isDestroy
                  ? "oklch(0.38 0.18 25 / 0.5)"
                  : "oklch(0.62 0.18 45 / 0.5)"
              }`,
              color: isDestroy ? "oklch(0.65 0.18 25)" : "oklch(0.75 0.16 55)",
            }}
          >
            {phase} ACTIVE
          </div>
        )}
      </div>

      {/* Active Track Card */}
      {activeTrack && (
        <div
          className="relative mb-5 p-4 transition-transform duration-75"
          style={{
            background: isDestroy
              ? "oklch(0.08 0.012 25)"
              : "oklch(0.08 0.010 45)",
            border: `1px solid ${
              isDestroy
                ? "oklch(0.38 0.18 25 / 0.6)"
                : "oklch(0.50 0.14 55 / 0.6)"
            }`,
            boxShadow: isDestroy
              ? "0 0 16px oklch(0.38 0.18 25 / 0.2)"
              : "0 0 16px oklch(0.62 0.18 45 / 0.15)",
            transform:
              glitch && isDestroy ? "skewX(-1deg) translateX(1px)" : "none",
          }}
          data-ocid="azrael.card"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <p
              className="text-xs font-bold tracking-widest leading-relaxed"
              style={{
                color: isDestroy
                  ? "oklch(0.70 0.18 25)"
                  : "oklch(0.78 0.14 55)",
              }}
            >
              {activeTrack.title}
            </p>
            <span
              className="text-xs flex-shrink-0 opacity-50"
              style={{
                color: isDestroy
                  ? "oklch(0.60 0.14 25)"
                  : "oklch(0.65 0.12 55)",
              }}
            >
              [{activeTrack.id}]
            </span>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-stone-600 text-[10px] tracking-wider uppercase mb-0.5">
                TYPE
              </p>
              <p className="text-stone-400 text-xs">{activeTrack.type}</p>
            </div>
            <div>
              <p className="text-stone-600 text-[10px] tracking-wider uppercase mb-0.5">
                FREQUENCY
              </p>
              <p className="text-stone-400 text-xs">{activeTrack.frequency}</p>
            </div>
          </div>
          {glitch && isDestroy && (
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, oklch(0.5 0.2 25) 2px, oklch(0.5 0.2 25) 3px)",
              }}
            />
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!isActive ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={initiateDestroy}
            className="py-3 px-4 font-cinzel text-xs font-bold tracking-widest uppercase transition-all duration-150 hover:scale-[1.02] active:scale-95"
            style={{
              background: "oklch(0.38 0.18 25 / 0.15)",
              border: "1px solid oklch(0.38 0.18 25 / 0.6)",
              color: "oklch(0.70 0.18 25)",
              boxShadow: "0 0 12px oklch(0.38 0.18 25 / 0.1)",
            }}
            data-ocid="azrael.primary_button"
          >
            ▼ INITIATE DESTROY
          </button>
          <button
            type="button"
            onClick={initiateBuild}
            className="py-3 px-4 font-cinzel text-xs font-bold tracking-widest uppercase transition-all duration-150 hover:scale-[1.02] active:scale-95"
            style={{
              background: "oklch(0.62 0.18 45 / 0.12)",
              border: "1px solid oklch(0.62 0.18 45 / 0.5)",
              color: "oklch(0.78 0.14 55)",
              boxShadow: "0 0 12px oklch(0.62 0.18 45 / 0.08)",
            }}
            data-ocid="azrael.secondary_button"
          >
            ▲ INITIATE BUILD
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={reset}
          className="w-full py-3 px-4 font-cinzel text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-150 hover:opacity-80 active:scale-95"
          style={{
            background: "oklch(0.12 0.008 270)",
            border: "1px solid oklch(0.25 0.01 270)",
            color: "oklch(0.50 0.01 270)",
          }}
          data-ocid="azrael.cancel_button"
        >
          <RotateCcw size={12} />
          RESET TO IDLE
        </button>
      )}

      {/* Audio note */}
      <p className="mt-3 text-stone-700 text-[10px] tracking-wider text-center">
        AUDIO HANDSHAKE — CONNECT SOURCE IN PRODUCTION
      </p>
    </div>
  );
}
