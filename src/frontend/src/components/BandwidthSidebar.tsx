import { Check, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export default function BandwidthSidebar() {
  const { anxietyToolState, addAnxietyToolLog } = useApp();
  const [showPanel, setShowPanel] = useState(false);

  const todayKey = getTodayKey();
  const todayLog = anxietyToolState.medicationLogs[todayKey] ?? {
    seroquel: false,
    symbicort: false,
  };

  // Compute load/clarity
  const seroquelTaken = todayLog.seroquel;
  const symbicortTaken = todayLog.symbicort;
  const takenCount = (seroquelTaken ? 1 : 0) + (symbicortTaken ? 1 : 0);
  // 0 taken = 100% load, 2 taken = 0% load
  const systemLoad = takenCount === 0 ? 100 : takenCount === 1 ? 50 : 0;
  const clarityPct = 100 - systemLoad;

  const handleToggle = (med: "seroquel" | "symbicort") => {
    addAnxietyToolLog(todayKey, {
      ...todayLog,
      [med]: !todayLog[med],
    });
  };

  return (
    <>
      {/* Sidebar Bar */}
      <div
        role="presentation"
        className="fixed right-0 top-1/2 z-40 flex flex-col items-center cursor-pointer"
        style={{
          transform: "translateY(-50%)",
          width: 28,
          height: 220,
          background:
            "linear-gradient(180deg, oklch(0.10 0.006 270) 0%, oklch(0.08 0.005 270) 100%)",
          border: "1px solid oklch(0.22 0.01 270)",
          borderRight: "none",
          borderRadius: "4px 0 0 4px",
          boxShadow: "-4px 0 16px oklch(0 0 0 / 0.5)",
        }}
        onClick={() => setShowPanel(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setShowPanel(true);
        }}
        title="Click to log medication"
      >
        {/* Top Label */}
        <div
          className="font-mono font-bold text-center"
          style={{
            fontSize: 6,
            letterSpacing: "0.08em",
            color: "oklch(0.55 0.22 300)",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            padding: "6px 0",
            lineHeight: 1.2,
          }}
        >
          ANESTRAL CLARITY
        </div>

        {/* Power Bar Track */}
        <div
          className="flex-1 relative mx-auto overflow-hidden"
          style={{
            width: 12,
            background: "oklch(0.08 0.004 270)",
            border: "1px solid oklch(0.18 0.008 270)",
            borderRadius: 2,
            margin: "4px auto",
          }}
        >
          {/* Clarity Fill (top portion — violet) */}
          <div
            className="absolute top-0 left-0 right-0 transition-all duration-700"
            style={{
              height: `${clarityPct}%`,
              background:
                clarityPct > 0
                  ? "linear-gradient(180deg, oklch(0.65 0.22 300) 0%, oklch(0.45 0.22 300) 100%)"
                  : "transparent",
              boxShadow:
                clarityPct > 0
                  ? "0 0 8px oklch(0.55 0.22 300 / 0.8), 0 0 16px oklch(0.45 0.22 300 / 0.4)"
                  : "none",
              animation:
                clarityPct > 50
                  ? "violet-pulse 2s ease-in-out infinite"
                  : "none",
            }}
          />

          {/* Load Fill (bottom portion — amber) */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-700"
            style={{
              height: `${systemLoad}%`,
              background:
                systemLoad > 0
                  ? "linear-gradient(0deg, oklch(0.72 0.18 55) 0%, oklch(0.60 0.16 55) 100%)"
                  : "transparent",
              boxShadow:
                systemLoad > 0 ? "0 0 6px oklch(0.72 0.18 55 / 0.5)" : "none",
            }}
          />

          {/* Tick marks */}
          {[25, 50, 75].map((pct) => (
            <div
              key={pct}
              className="absolute left-0 right-0"
              style={{
                top: `${pct}%`,
                height: 1,
                background: "oklch(0.22 0.01 270)",
              }}
            />
          ))}
        </div>

        {/* Bottom Label */}
        <div
          className="font-mono font-bold text-center"
          style={{
            fontSize: 6,
            letterSpacing: "0.08em",
            color: "oklch(0.72 0.18 55)",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            padding: "6px 0",
            lineHeight: 1.2,
          }}
        >
          SYSTEM LOAD
        </div>
      </div>

      {/* Medication Input Panel */}
      {showPanel && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-end"
          style={{ background: "oklch(0 0 0 / 0.7)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPanel(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowPanel(false);
          }}
        >
          <div
            className="relative flex flex-col"
            style={{
              width: 260,
              background:
                "linear-gradient(180deg, oklch(0.10 0.008 270) 0%, oklch(0.08 0.005 270) 100%)",
              border: "1px solid oklch(0.72 0.18 55 / 0.5)",
              borderRight: "none",
              boxShadow: "-8px 0 32px oklch(0 0 0 / 0.8)",
              minHeight: 320,
              padding: 20,
            }}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowPanel(false)}
              className="absolute top-3 right-3 transition-colors"
              style={{ color: "oklch(0.45 0.01 60)" }}
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="mb-5">
              <div
                className="font-mono font-bold tracking-widest mb-1"
                style={{ fontSize: 11, color: "oklch(0.55 0.22 300)" }}
              >
                ANESTRAL CLARITY
              </div>
              <div
                className="font-mono tracking-wider"
                style={{ fontSize: 9, color: "oklch(0.45 0.01 60)" }}
              >
                BANDWIDTH MONITOR · {todayKey}
              </div>
            </div>

            {/* Clarity Bar Visual */}
            <div
              className="flex items-center gap-3 mb-5 p-3"
              style={{
                background: "oklch(0.08 0.004 270)",
                border: "1px solid oklch(0.18 0.008 270)",
              }}
            >
              <div
                className="relative overflow-hidden"
                style={{
                  width: 16,
                  height: 80,
                  background: "oklch(0.06 0.004 270)",
                  border: "1px solid oklch(0.22 0.01 270)",
                  borderRadius: 2,
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 transition-all duration-700"
                  style={{
                    height: `${clarityPct}%`,
                    background:
                      "linear-gradient(180deg, oklch(0.65 0.22 300) 0%, oklch(0.45 0.22 300) 100%)",
                    boxShadow:
                      clarityPct > 0
                        ? "0 0 8px oklch(0.55 0.22 300 / 0.8)"
                        : "none",
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-700"
                  style={{
                    height: `${systemLoad}%`,
                    background:
                      "linear-gradient(0deg, oklch(0.72 0.18 55) 0%, oklch(0.60 0.16 55) 100%)",
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span
                    className="font-mono"
                    style={{ fontSize: 9, color: "oklch(0.55 0.22 300)" }}
                  >
                    CLARITY
                  </span>
                  <span
                    className="font-mono font-bold"
                    style={{ fontSize: 9, color: "oklch(0.55 0.22 300)" }}
                  >
                    {clarityPct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className="font-mono"
                    style={{ fontSize: 9, color: "oklch(0.72 0.18 55)" }}
                  >
                    LOAD
                  </span>
                  <span
                    className="font-mono font-bold"
                    style={{ fontSize: 9, color: "oklch(0.72 0.18 55)" }}
                  >
                    {systemLoad}%
                  </span>
                </div>
              </div>
            </div>

            {/* Medication Toggles */}
            <div className="space-y-3 mb-5">
              <div
                className="font-mono font-bold tracking-widest mb-2"
                style={{ fontSize: 9, color: "oklch(0.45 0.01 60)" }}
              >
                TODAY'S MEDICATION LOG
              </div>

              {/* Seroquel */}
              <button
                type="button"
                onClick={() => handleToggle("seroquel")}
                className="w-full flex items-center justify-between p-3 transition-all duration-200"
                style={{
                  background: seroquelTaken
                    ? "oklch(0.55 0.22 300 / 0.12)"
                    : "oklch(0.08 0.004 270)",
                  border: `1px solid ${seroquelTaken ? "oklch(0.55 0.22 300 / 0.5)" : "oklch(0.22 0.01 270)"}`,
                  boxShadow: seroquelTaken
                    ? "0 0 8px oklch(0.55 0.22 300 / 0.2)"
                    : "none",
                }}
              >
                <div className="text-left">
                  <div
                    className="font-mono font-bold tracking-wider"
                    style={{ fontSize: 11, color: "oklch(0.75 0.01 60)" }}
                  >
                    SEROQUEL
                  </div>
                  <div
                    className="font-mono"
                    style={{ fontSize: 9, color: "oklch(0.45 0.01 60)" }}
                  >
                    Quetiapine · Mood stabilizer
                  </div>
                </div>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 24,
                    height: 24,
                    background: seroquelTaken
                      ? "oklch(0.55 0.22 300)"
                      : "oklch(0.12 0.006 270)",
                    border: `1px solid ${seroquelTaken ? "oklch(0.55 0.22 300)" : "oklch(0.28 0.01 270)"}`,
                    borderRadius: 2,
                    transition: "all 0.2s",
                  }}
                >
                  {seroquelTaken && (
                    <Check size={14} style={{ color: "oklch(0.95 0.01 60)" }} />
                  )}
                </div>
              </button>

              {/* Symbicort */}
              <button
                type="button"
                onClick={() => handleToggle("symbicort")}
                className="w-full flex items-center justify-between p-3 transition-all duration-200"
                style={{
                  background: symbicortTaken
                    ? "oklch(0.55 0.22 300 / 0.12)"
                    : "oklch(0.08 0.004 270)",
                  border: `1px solid ${symbicortTaken ? "oklch(0.55 0.22 300 / 0.5)" : "oklch(0.22 0.01 270)"}`,
                  boxShadow: symbicortTaken
                    ? "0 0 8px oklch(0.55 0.22 300 / 0.2)"
                    : "none",
                }}
              >
                <div className="text-left">
                  <div
                    className="font-mono font-bold tracking-wider"
                    style={{ fontSize: 11, color: "oklch(0.75 0.01 60)" }}
                  >
                    SYMBICORT
                  </div>
                  <div
                    className="font-mono"
                    style={{ fontSize: 9, color: "oklch(0.45 0.01 60)" }}
                  >
                    Budesonide/Formoterol · Respiratory
                  </div>
                </div>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 24,
                    height: 24,
                    background: symbicortTaken
                      ? "oklch(0.55 0.22 300)"
                      : "oklch(0.12 0.006 270)",
                    border: `1px solid ${symbicortTaken ? "oklch(0.55 0.22 300)" : "oklch(0.28 0.01 270)"}`,
                    borderRadius: 2,
                    transition: "all 0.2s",
                  }}
                >
                  {symbicortTaken && (
                    <Check size={14} style={{ color: "oklch(0.95 0.01 60)" }} />
                  )}
                </div>
              </button>
            </div>

            {/* Status message */}
            <div
              className="font-mono text-center"
              style={{
                fontSize: 9,
                color:
                  clarityPct === 100
                    ? "oklch(0.55 0.22 300)"
                    : clarityPct === 50
                      ? "oklch(0.72 0.18 55)"
                      : "oklch(0.45 0.01 60)",
                letterSpacing: "0.08em",
              }}
            >
              {clarityPct === 100
                ? "◆ FULL CLARITY ACHIEVED"
                : clarityPct === 50
                  ? "◈ PARTIAL CLARITY — LOG REMAINING"
                  : "◇ LOG MEDICATIONS TO BOOST CLARITY"}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
