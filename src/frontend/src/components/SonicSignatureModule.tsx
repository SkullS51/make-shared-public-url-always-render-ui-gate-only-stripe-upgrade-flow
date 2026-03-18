import { Switch } from "@/components/ui/switch";
import { Music, Volume2, VolumeX, Zap } from "lucide-react";
import React, { useState, useEffect } from "react";
import { sonicModule } from "../lib/sonicModule";

interface SonicSignatureModuleProps {
  /** When true, disables all auto-play and shows silent mode indicator */
  silentMode?: boolean;
}

export default function SonicSignatureModule({
  silentMode = false,
}: SonicSignatureModuleProps) {
  const [bypassMute, setBypassMute] = useState(
    sonicModule.isBypassMuteEnabled(),
  );
  const [playing, setPlaying] = useState(false);
  const [playingChug, setPlayingChug] = useState(false);
  const [contextState, setContextState] = useState(
    sonicModule.getContextState(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setContextState(sonicModule.getContextState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBypassToggle = (checked: boolean) => {
    setBypassMute(checked);
    sonicModule.toggleBypassMute(checked);
    setContextState(sonicModule.getContextState());
  };

  const handleForgeStrike = async () => {
    if (playing) return;
    setPlaying(true);
    try {
      await sonicModule.playForgeStrike();
    } catch {
      // Audio context may need user gesture — already handled
    }
    setTimeout(() => setPlaying(false), 600);
    setContextState(sonicModule.getContextState());
  };

  const handleBreakdownChug = async () => {
    if (playingChug) return;
    setPlayingChug(true);
    try {
      await sonicModule.playBreakdownChug();
    } catch {
      // Audio context may need user gesture — already handled
    }
    setTimeout(() => setPlayingChug(false), 1200);
    setContextState(sonicModule.getContextState());
  };

  return (
    <div
      style={{
        border: "1px solid oklch(0.38 0.18 25 / 0.4)",
        background: "oklch(0.09 0.006 270)",
        boxShadow: "0 0 20px oklch(0.38 0.18 25 / 0.15)",
        padding: 20,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{
              background: "oklch(0.38 0.18 25 / 0.2)",
              border: "1px solid oklch(0.38 0.18 25 / 0.4)",
            }}
          >
            <Music size={16} className="text-blood-red" />
          </div>
          <div>
            <h3 className="font-cinzel text-stone-200 text-sm font-bold tracking-wider">
              SONIC SIGNATURE MODULE
            </h3>
            <p className="text-stone-600 font-mono text-xs">
              80s Metal / Hatebreed intensity · No safety filters
            </p>
          </div>
        </div>

        {/* Silent mode badge */}
        {silentMode && (
          <div
            className="flex items-center gap-1.5 px-2 py-1"
            style={{
              background: "oklch(0.55 0.22 300 / 0.1)",
              border: "1px solid oklch(0.55 0.22 300 / 0.4)",
            }}
          >
            <VolumeX size={10} style={{ color: "oklch(0.55 0.22 300)" }} />
            <span
              className="font-mono"
              style={{
                fontSize: 8,
                color: "oklch(0.55 0.22 300)",
                letterSpacing: "0.1em",
              }}
            >
              SILENT MODE
            </span>
          </div>
        )}
      </div>

      {/* Silent mode notice */}
      {silentMode && (
        <div
          className="mb-4 p-3"
          style={{
            background: "oklch(0.55 0.22 300 / 0.06)",
            border: "1px solid oklch(0.55 0.22 300 / 0.25)",
          }}
        >
          <p
            className="font-mono text-xs"
            style={{ color: "oklch(0.55 0.22 300)" }}
          >
            ◆ INNER FORGE MODE — Audio triggers require explicit user action
            only. No auto-play. No alerts. Sovereign control.
          </p>
        </div>
      )}

      {/* Bypass Mute Toggle */}
      <div
        className="flex items-center justify-between p-3 mb-4"
        style={{
          background: "oklch(0.08 0.005 270)",
          border: "1px solid oklch(0.18 0.008 270)",
        }}
      >
        <div className="flex items-center gap-2">
          {bypassMute ? (
            <Volume2 size={16} className="text-ember-orange" />
          ) : (
            <VolumeX size={16} className="text-stone-500" />
          )}
          <div>
            <p className="font-mono text-sm text-stone-300">BYPASS MUTE</p>
            <p className="font-mono text-xs text-stone-600">
              {bypassMute
                ? "Active — Audio context forced live"
                : "Inactive — Standard audio policy"}
            </p>
          </div>
        </div>
        <Switch
          checked={bypassMute}
          onCheckedChange={handleBypassToggle}
          className="data-[state=checked]:bg-blood-red"
        />
      </div>

      {/* Audio Context Status */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div
          className={`w-2 h-2 rounded-full ${
            contextState === "running"
              ? "bg-green-500 animate-pulse"
              : contextState === "suspended"
                ? "bg-ember-orange"
                : "bg-stone-600"
          }`}
        />
        <span className="font-mono text-xs text-stone-500">
          AUDIO CTX: {contextState.toUpperCase()}
        </span>
      </div>

      {/* Trigger Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleForgeStrike}
          disabled={playing}
          className="flex items-center justify-center gap-2 py-2.5 px-3 font-cinzel text-xs font-bold tracking-wider text-blood-red disabled:opacity-50 transition-all duration-200"
          style={{
            border: "1px solid oklch(0.38 0.18 25 / 0.5)",
            background: "oklch(0.38 0.18 25 / 0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "oklch(0.38 0.18 25 / 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "oklch(0.38 0.18 25 / 0.1)";
          }}
        >
          {playing ? (
            <div className="w-3 h-3 border border-blood-red border-t-transparent rounded-full animate-spin" />
          ) : (
            <Zap size={14} />
          )}
          FORGE STRIKE
        </button>

        <button
          type="button"
          onClick={handleBreakdownChug}
          disabled={playingChug}
          className="flex items-center justify-center gap-2 py-2.5 px-3 font-cinzel text-xs font-bold tracking-wider text-ember-orange disabled:opacity-50 transition-all duration-200"
          style={{
            border: "1px solid oklch(0.62 0.18 45 / 0.5)",
            background: "oklch(0.62 0.18 45 / 0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "oklch(0.62 0.18 45 / 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "oklch(0.62 0.18 45 / 0.1)";
          }}
        >
          {playingChug ? (
            <div className="w-3 h-3 border border-ember-orange border-t-transparent rounded-full animate-spin" />
          ) : (
            <Music size={14} />
          )}
          BREAKDOWN CHUG
        </button>
      </div>

      <p className="text-stone-700 font-mono text-xs mt-3 text-center">
        Genre-agnostic triggers · Web Audio API · Zero external APIs
      </p>
    </div>
  );
}
