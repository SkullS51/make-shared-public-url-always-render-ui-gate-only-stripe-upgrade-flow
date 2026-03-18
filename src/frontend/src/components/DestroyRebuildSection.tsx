import { Flame, Wind } from "lucide-react";
import { useState } from "react";
import { useApp } from "../contexts/AppContext";
import AzraelGutCheck from "./AzraelGutCheck";
import SonicSignatureModule from "./SonicSignatureModule";
import SymbicortCheckModal from "./SymbicortCheckModal";

export default function DestroyRebuildSection() {
  const { sanctuaryMode } = useApp();
  const [breathConfirmed, setBreathConfirmed] = useState(false);

  const isInnerForge = sanctuaryMode === "INNER_FORGE";

  return (
    <div className="relative min-h-screen bg-void">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/gargoyle-dragon-hero.dim_1920x1080.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void via-void/90 to-void" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(/assets/generated/void-metal-texture.dim_512x512.png)",
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      {/* Symbicort Check — blocks access until confirmed */}
      <SymbicortCheckModal onConfirmed={() => setBreathConfirmed(true)} />

      <div className="relative z-10 pt-8 px-4 pb-12 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Flame className="text-blood-red" size={28} />
            <h1 className="font-cinzel text-blood-red text-2xl font-bold tracking-widest">
              DESTROY & REBUILD
            </h1>
            <Flame className="text-blood-red" size={28} />
          </div>
          <p className="text-stone-500 font-mono text-sm tracking-wider">
            SOVEREIGN AUDIO WORK · FOREVERRAW FORGE
          </p>

          {/* Inner Forge mode indicator */}
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
                INNER FORGE · SILENT MODE ACTIVE
              </span>
            </div>
          )}

          {breathConfirmed && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Wind size={14} className="text-ember-orange" />
              <span className="text-ember-orange font-mono text-xs">
                BREATH SECURED · READY TO FORGE
              </span>
            </div>
          )}
        </div>

        {/* Content — only fully interactive after breath confirmed */}
        <div
          className={`space-y-6 transition-opacity duration-500 ${
            breathConfirmed ? "opacity-100" : "opacity-30 pointer-events-none"
          }`}
        >
          {/* Sovereign Declaration */}
          <div
            className="p-5"
            style={{
              border: "1px solid oklch(0.38 0.18 25 / 0.4)",
              background: "oklch(0.09 0.006 270)",
              boxShadow: "0 0 20px oklch(0.38 0.18 25 / 0.1)",
            }}
          >
            <div className="flex items-start gap-3">
              <Flame
                size={18}
                className="text-ember-orange mt-0.5 flex-shrink-0"
              />
              <div>
                <h2 className="font-cinzel text-stone-200 font-bold tracking-wider mb-2 text-sm">
                  THE FORGE PROTOCOL
                </h2>
                <p className="text-stone-400 font-mono text-sm leading-relaxed">
                  This is your sovereign audio workspace. Destroy the patterns
                  that no longer serve you. Rebuild from the forge. No filters.
                  No nannies. Pure resolution.
                </p>
                {isInnerForge && (
                  <p
                    className="font-mono text-xs mt-2"
                    style={{ color: "oklch(0.55 0.22 300)" }}
                  >
                    ◆ ANXIETY TOOLS ACTIVE · SILENT MODE — no alerts, no
                    auto-audio
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sonic Signature Module — silent mode in Inner Forge */}
          <SonicSignatureModule silentMode={isInnerForge} />

          {/* Azrael Gut Check — replaces static phase cards */}
          <AzraelGutCheck />

          {/* Journaling prompt — no audio, no alerts */}
          <div
            className="p-5"
            style={{
              border: "1px solid oklch(0.16 0.008 270)",
              background: "oklch(0.08 0.005 270)",
            }}
          >
            <h3 className="font-cinzel text-stone-400 text-xs font-bold tracking-wider mb-3">
              POST-SESSION REFLECTION
            </h3>
            <textarea
              placeholder="What did you destroy today? What are you rebuilding?..."
              rows={4}
              className="w-full bg-transparent text-stone-300 placeholder-stone-700 font-mono text-sm resize-none outline-none border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
