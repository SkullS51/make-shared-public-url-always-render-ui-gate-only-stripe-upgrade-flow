import { useNavigate } from "@tanstack/react-router";
import { Brain, FileText, Flame, Music, ScanLine, Zap } from "lucide-react";
import React from "react";
import { FREE_TIER_DAILY_LIMIT, useApp } from "../contexts/AppContext";
import SonicSignatureModule from "./SonicSignatureModule";

const sanctuaryTools = [
  {
    label: "ANXIETY SCAN",
    description: "Threat detection & pattern analysis",
    path: "/scan",
    icon: ScanLine,
    color: "text-blood-red",
    border: "border-blood-red/40",
    bg: "bg-blood-red/10",
    hover: "hover:bg-blood-red/20",
  },
  {
    label: "VENT JOURNAL",
    description: "Zero-cloud safe draft vault",
    path: "/safe-draft",
    icon: FileText,
    color: "text-ember-orange",
    border: "border-ember-orange/40",
    bg: "bg-ember-orange/10",
    hover: "hover:bg-ember-orange/20",
  },
  {
    label: "BASIC CONSULTANT",
    description: "DRAGONFLIES resolution protocol",
    path: "/consultant",
    icon: Brain,
    color: "text-stone-300",
    border: "border-stone-600",
    bg: "bg-stone-900/60",
    hover: "hover:bg-stone-800/60",
  },
];

export default function ForgeSplashScreen() {
  const navigate = useNavigate();
  const { dailyScans, isPro } = useApp();
  const [showSonic, setShowSonic] = React.useState(false);
  const scansLeft = Math.max(0, FREE_TIER_DAILY_LIMIT - dailyScans);

  return (
    <div className="relative min-h-screen bg-void overflow-x-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/gargoyle-dragon-hero.dim_1920x1080.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-15"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/70 to-void" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(/assets/generated/dragon-scale-texture.dim_512x512.png)",
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-20 pb-16">
        {/* Dragon Emblem */}
        <div className="flex justify-center mb-6">
          <img
            src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
            alt="Gargoyle Dragon"
            className="w-28 h-28 object-contain opacity-90"
            draggable={false}
          />
        </div>

        {/* Main Title */}
        <div className="text-center mb-6">
          <h1
            className="font-cinzel text-4xl md:text-5xl font-bold tracking-widest mb-2"
            style={{
              color: "oklch(0.50 0.20 25)",
              textShadow: "0 0 30px rgba(139,0,0,0.6)",
            }}
          >
            ENTER THE FORGE
          </h1>
          <p className="text-stone-500 font-mono text-sm tracking-widest">
            HOME OF THE GARGOYLE DRAGON
          </p>
        </div>

        {/* ── Identity & Legacy ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 border border-blood-red/30 rounded-sm bg-blood-red/5">
            <Flame size={14} className="text-blood-red" />
            <span className="font-cinzel text-stone-300 text-xs tracking-widest">
              OWNER:{" "}
              <span className="text-blood-red font-bold">PRETTY PATRIOT</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border border-ember-orange/30 rounded-sm bg-ember-orange/5">
            <Zap size={14} className="text-ember-orange" />
            <span className="font-cinzel text-stone-300 text-xs tracking-widest">
              CREATOR:{" "}
              <span className="text-ember-orange font-bold">
                SKULLS JOHNSON
              </span>
            </span>
          </div>
        </div>

        {/* ── Sovereign Space Declaration ── */}
        <div
          className="text-center mb-8 px-4 py-5 border border-blood-red/20 rounded-sm bg-stone-900/40"
          style={{ boxShadow: "0 0 20px rgba(139,0,0,0.1)" }}
        >
          <p
            className="font-cinzel text-base md:text-lg font-bold tracking-wide leading-relaxed"
            style={{ color: "oklch(0.65 0.18 45)" }}
          >
            Together we have created a sovereign space.
          </p>
          <p
            className="font-cinzel text-base md:text-lg font-bold tracking-wide leading-relaxed mt-1"
            style={{ color: "oklch(0.65 0.18 45)" }}
          >
            Enjoy the realm. Destroy &amp; Rebuild.
          </p>
        </div>

        {/* ── CTA Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 justify-center">
          <button
            type="button"
            onClick={() => navigate({ to: "/chat" })}
            className="flex items-center justify-center gap-2 py-3 px-8 font-cinzel font-bold text-sm tracking-widest text-stone-100 rounded-sm transition-all duration-200"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.38 0.18 25) 0%, oklch(0.45 0.20 25) 100%)",
              boxShadow: "0 0 20px rgba(139,0,0,0.4)",
            }}
          >
            <Flame size={16} className="text-ember-orange" />
            START A GUT PUNCH
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/destroy-rebuild" })}
            className="flex items-center justify-center gap-2 py-3 px-8 font-cinzel font-bold text-sm tracking-widest text-ember-orange rounded-sm border border-ember-orange/50 bg-ember-orange/10 hover:bg-ember-orange/20 transition-all duration-200"
          >
            <Zap size={16} />
            DESTROY & REBUILD
          </button>
        </div>

        {/* ── Sanctuary Tools ── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-stone-800" />
            <span className="font-cinzel text-stone-500 text-xs tracking-widest px-3">
              SANCTUARY TOOLS
            </span>
            <div className="flex-1 h-px bg-stone-800" />
          </div>
          <p className="text-stone-600 font-mono text-xs text-center mb-4">
            Open to all · No login required
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sanctuaryTools.map((tool) => {
              const Icon = tool.icon;
              const isAnxietyScan = tool.path === "/scan";
              return (
                <button
                  type="button"
                  key={tool.path}
                  onClick={() => navigate({ to: tool.path })}
                  className={`flex flex-col items-center gap-2 p-4 border ${tool.border} ${tool.bg} ${tool.hover} rounded-sm transition-all duration-200 group`}
                >
                  <Icon
                    size={22}
                    className={`${tool.color} group-hover:scale-110 transition-transform duration-200`}
                  />
                  <span
                    className={`font-cinzel text-xs font-bold tracking-wider ${tool.color}`}
                  >
                    {tool.label}
                  </span>
                  <span className="text-stone-600 font-mono text-xs text-center leading-tight">
                    {tool.description}
                  </span>
                  {isAnxietyScan && (
                    <span
                      className={`font-mono text-xs font-bold ${
                        isPro
                          ? "text-stone-400"
                          : scansLeft === 0
                            ? "text-red-500"
                            : scansLeft <= 3
                              ? "text-amber-400"
                              : "text-stone-500"
                      }`}
                    >
                      {isPro ? "UNLIMITED" : `${scansLeft} scans left today`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sonic Signature Module Toggle ── */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowSonic((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-cinzel text-xs font-bold tracking-widest text-stone-500 hover:text-stone-300 border border-stone-800 hover:border-stone-600 rounded-sm bg-stone-900/40 hover:bg-stone-900/60 transition-all duration-200"
          >
            <Music size={14} />
            {showSonic ? "HIDE SONIC CONTROLS" : "SONIC CONTROLS"}
          </button>
          {showSonic && (
            <div className="mt-3">
              <SonicSignatureModule />
            </div>
          )}
        </div>

        {/* ── Footer Attribution ── */}
        <div className="text-center border-t border-stone-900 pt-6">
          <p className="text-stone-700 font-mono text-xs">
            © {new Date().getFullYear()} FOREVERRAW · Built with{" "}
            <span className="text-blood-red">♥</span> using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "foreverraw")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ember-orange hover:text-ember-orange/80 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
