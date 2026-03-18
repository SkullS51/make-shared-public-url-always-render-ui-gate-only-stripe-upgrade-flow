import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronRight,
  ScanLine,
  Shield,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { FREE_TIER_DAILY_LIMIT, useApp } from "../contexts/AppContext";
import { analyzeText } from "../lib/analyzer";

export default function ScanScreen() {
  const navigate = useNavigate();
  const {
    sanctuaryMode,
    addThreatScanResult,
    setThreatActive,
    dailyScans,
    incrementDailyScans,
    isPro,
  } = useApp();
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeText> | null>(
    null,
  );
  const [scanning, setScanning] = useState(false);
  const [hudFlicker, setHudFlicker] = useState(false);

  const scansLeft = Math.max(0, FREE_TIER_DAILY_LIMIT - dailyScans);
  const scanLimitReached = !isPro && dailyScans >= FREE_TIER_DAILY_LIMIT;

  const isPerimeterDefense = sanctuaryMode === "PERIMETER_DEFENSE";

  const handleScan = async () => {
    if (!inputText.trim()) return;
    setScanning(true);
    await new Promise((r) => setTimeout(r, 800));
    const analysis = analyzeText(inputText, "balanced");
    setResult(analysis);
    setScanning(false);

    // Store in threat scan namespace — spread analysis to include all fields,
    // then add the AnalysisResult-required fields on top
    addThreatScanResult({
      ...analysis,
      id: `scan-${Date.now()}`,
      text: inputText,
      timestamp: Date.now(),
      mode: "balanced",
    } as any);

    // riskLevel is 'low' | 'medium' | 'high' — 'high' is the maximum
    if (analysis.riskLevel === "high") {
      setThreatActive(true);
      setHudFlicker(true);
      setTimeout(() => {
        setHudFlicker(false);
        setThreatActive(false);
      }, 3000);
    }

    incrementDailyScans();
  };

  const getRiskColor = (level: string) => {
    if (level === "high") return "text-amber-glow";
    if (level === "medium") return "text-ember-orange";
    return "text-stone-400";
  };

  const isHighRisk = (level: string) => level === "high";

  return (
    <div className="relative min-h-screen bg-void">
      {/* Amber border flicker on threat — subtle, no modal */}
      {hudFlicker && (
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            border: "2px solid oklch(0.72 0.18 55)",
            animation: "hud-flicker 0.5s ease-in-out 4",
          }}
        />
      )}

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
            <ScanLine style={{ color: "oklch(0.72 0.18 55)" }} size={28} />
            <h1
              className="font-cinzel text-2xl font-bold tracking-widest"
              style={{ color: "oklch(0.72 0.18 55)" }}
            >
              {isPerimeterDefense ? "PERIMETER DEFENSE" : "THREAT SCANNER"}
            </h1>
          </div>
          <p className="text-stone-500 font-mono text-sm tracking-wider">
            {isPerimeterDefense
              ? "FBI TRIPWIRE · ACTIVE THREAT DETECTION"
              : "THREAT PATTERN ANALYSIS"}
          </p>
          {/* Mode indicator */}
          <div
            className="inline-flex items-center gap-2 mt-2 px-3 py-1"
            style={{
              background: isPerimeterDefense
                ? "oklch(0.72 0.18 55 / 0.08)"
                : "oklch(0.55 0.22 300 / 0.08)",
              border: `1px solid ${isPerimeterDefense ? "oklch(0.72 0.18 55 / 0.3)" : "oklch(0.55 0.22 300 / 0.3)"}`,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                background: isPerimeterDefense
                  ? "oklch(0.72 0.18 55)"
                  : "oklch(0.55 0.22 300)",
              }}
            />
            <span
              className="font-mono text-xs tracking-widest"
              style={{
                color: isPerimeterDefense
                  ? "oklch(0.72 0.18 55)"
                  : "oklch(0.55 0.22 300)",
              }}
            >
              {isPerimeterDefense
                ? "PERIMETER DEFENSE ACTIVE"
                : "INNER FORGE MODE"}
            </span>
          </div>

          {/* Scan count badge */}
          <div className="mt-3">
            {isPro ? (
              <span className="font-mono text-xs tracking-widest text-stone-400">
                UNLIMITED SCANS
              </span>
            ) : (
              <span
                className={`font-mono text-xs tracking-widest font-bold ${
                  scansLeft === 0
                    ? "text-red-500"
                    : scansLeft <= 3
                      ? "text-amber-400"
                      : "text-stone-400"
                }`}
              >
                SCANS LEFT: {scansLeft}/{FREE_TIER_DAILY_LIMIT}
              </span>
            )}
          </div>
        </div>

        {/* Scan limit CTA */}
        {scanLimitReached && (
          <div
            className="mb-4 p-4 text-center"
            style={{
              background: "oklch(0.38 0.18 25 / 0.1)",
              border: "1px solid oklch(0.38 0.18 25 / 0.5)",
            }}
            data-ocid="scan.error_state"
          >
            <p className="font-cinzel text-blood-red text-sm font-bold tracking-wider mb-3">
              SCAN LIMIT REACHED
            </p>
            <p className="text-stone-500 font-mono text-xs mb-4">
              Upgrade to Pro for unlimited scans
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/upgrade" })}
              className="flex items-center justify-center gap-2 mx-auto px-6 py-2 font-cinzel font-bold text-sm tracking-widest transition-all duration-200"
              style={{
                background: "oklch(0.38 0.18 25 / 0.2)",
                border: "1px solid oklch(0.50 0.20 25)",
                color: "oklch(0.50 0.20 25)",
              }}
              data-ocid="scan.primary_button"
            >
              <Zap size={14} />
              UPGRADE TO PRO
            </button>
          </div>
        )}

        {/* Input */}
        <div
          className="p-4 mb-4"
          style={{
            background: "oklch(0.09 0.006 270)",
            border: "1px solid oklch(0.22 0.01 270)",
          }}
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste the message you want to scan for threats..."
            rows={6}
            disabled={scanLimitReached}
            className="w-full bg-transparent text-stone-200 placeholder-stone-600 font-mono text-sm resize-none outline-none disabled:opacity-40"
            data-ocid="scan.textarea"
          />
        </div>

        <button
          type="button"
          onClick={handleScan}
          disabled={scanning || !inputText.trim() || scanLimitReached}
          className="w-full py-3 font-cinzel font-bold tracking-widest flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40"
          style={{
            background: scanning
              ? "oklch(0.72 0.18 55 / 0.15)"
              : "oklch(0.72 0.18 55 / 0.12)",
            border: "1px solid oklch(0.72 0.18 55 / 0.6)",
            color: "oklch(0.72 0.18 55)",
          }}
          data-ocid="scan.submit_button"
        >
          {scanning ? (
            <>
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{
                  borderColor: "oklch(0.72 0.18 55 / 0.6)",
                  borderTopColor: "transparent",
                }}
              />
              SCANNING...
            </>
          ) : (
            <>
              <ScanLine size={18} />
              SCAN FOR THREATS
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* Risk Level */}
            <div
              className="p-4"
              style={{
                background: "oklch(0.09 0.006 270)",
                border: "1px solid oklch(0.22 0.01 270)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-cinzel text-stone-400 text-sm tracking-wider">
                  RISK LEVEL
                </span>
                <span
                  className={`font-cinzel font-bold text-lg tracking-wider ${getRiskColor(result.riskLevel)}`}
                >
                  {result.riskLevel.toUpperCase()}
                </span>
              </div>
              <div
                className="h-2 overflow-hidden"
                style={{ background: "oklch(0.14 0.006 270)" }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(result.riskScore * 10, 100)}%`,
                    background: isHighRisk(result.riskLevel)
                      ? "oklch(0.72 0.18 55)"
                      : "oklch(0.50 0.20 25)",
                    boxShadow: isHighRisk(result.riskLevel)
                      ? "0 0 8px oklch(0.72 0.18 55 / 0.6)"
                      : "none",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-stone-600 text-xs font-mono">0</span>
                <span className="text-stone-600 text-xs font-mono">
                  SCORE: {result.riskScore}/10
                </span>
              </div>
            </div>

            {/* Summary */}
            {result.summary && (
              <div
                className="p-4"
                style={{
                  background: "oklch(0.09 0.006 270)",
                  border: "1px solid oklch(0.22 0.01 270)",
                }}
              >
                <h3 className="font-cinzel text-stone-400 text-sm tracking-wider mb-2">
                  ANALYSIS
                </h3>
                <p className="text-stone-300 font-mono text-sm leading-relaxed">
                  {result.summary}
                </p>
              </div>
            )}

            {/* Patterns */}
            {result.patterns && result.patterns.length > 0 && (
              <div
                className="p-4"
                style={{
                  background: "oklch(0.09 0.006 270)",
                  border: "1px solid oklch(0.22 0.01 270)",
                }}
              >
                <h3
                  className="font-cinzel text-sm tracking-wider mb-3 flex items-center gap-2"
                  style={{ color: "oklch(0.72 0.18 55)" }}
                >
                  <AlertTriangle
                    size={14}
                    style={{ color: "oklch(0.72 0.18 55)" }}
                  />
                  DETECTED THREATS
                </h3>
                <div className="space-y-2">
                  {result.patterns.map((pattern: string, i: number) => (
                    <div
                      key={`${pattern.slice(0, 20)}-${i}`}
                      className="flex items-start gap-2 text-sm font-mono"
                    >
                      <ChevronRight
                        size={14}
                        style={{
                          color: "oklch(0.72 0.18 55)",
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      />
                      <span className="text-stone-300">{pattern}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.riskLevel === "low" && (
              <div
                className="p-4 flex items-center gap-3"
                style={{
                  background: "oklch(0.09 0.006 270)",
                  border: "1px solid oklch(0.22 0.01 270)",
                }}
              >
                <Shield size={20} className="text-stone-400" />
                <p className="text-stone-400 font-mono text-sm">
                  No significant threats detected. Stay vigilant.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
