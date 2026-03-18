import { Search, X, Zap } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import type { AnalyzeTextResult } from "../lib/analyzer";
import type { AnalysisResult } from "../lib/types";

// A search record can be either a stored AnalysisResult or an extended scan result
type SearchRecord = AnalysisResult & Partial<AnalyzeTextResult>;

export default function LedgerSearchBar() {
  const { history, threatScanState } = useApp();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Combine history sources for search — deduplicate by id
  const allRecords: SearchRecord[] = [
    ...history,
    ...threatScanState.analysisHistory,
  ].filter(
    (item, index, self) => self.findIndex((i) => i.id === item.id) === index,
  );

  const filtered =
    query.trim().length > 0
      ? allRecords
          .filter((item) => {
            const lq = query.toLowerCase();
            return (
              item.text?.toLowerCase().includes(lq) ||
              (item as SearchRecord).summary?.toLowerCase().includes(lq) ||
              (item as SearchRecord).riskLevel?.toLowerCase().includes(lq)
            );
          })
          .slice(0, 8)
      : [];

  // Scanning animation on keystroke
  useEffect(() => {
    if (query.length > 0) {
      setScanning(true);
      const t = setTimeout(() => setScanning(false), 400);
      return () => clearTimeout(t);
    }
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isHighRisk = (item: SearchRecord) => {
    const level = item.riskLevel;
    return level === "high";
  };

  return (
    <div className="relative w-full">
      {/* Search Container */}
      <div
        className="relative flex items-center gap-0 transition-all duration-300"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.08 0.008 270) 0%, oklch(0.10 0.006 270) 100%)",
          border: focused
            ? "1px solid oklch(0.72 0.18 55)"
            : "1px solid oklch(0.22 0.01 270)",
          boxShadow: focused
            ? "0 0 20px oklch(0.72 0.18 55 / 0.35), inset 0 0 10px oklch(0.72 0.18 55 / 0.05)"
            : "0 0 0px transparent",
        }}
      >
        {/* Label Tag */}
        <div
          className="flex items-center gap-1.5 px-3 py-2.5 border-r shrink-0"
          style={{
            borderColor: focused
              ? "oklch(0.72 0.18 55 / 0.5)"
              : "oklch(0.22 0.01 270)",
            background: focused ? "oklch(0.72 0.18 55 / 0.08)" : "transparent",
          }}
        >
          {scanning ? (
            <Zap
              size={14}
              className="shrink-0"
              style={{
                color: "oklch(0.72 0.18 55)",
                animation: "amber-pulse 0.3s ease-in-out",
              }}
            />
          ) : (
            <Search
              size={14}
              className="shrink-0"
              style={{
                color: focused ? "oklch(0.72 0.18 55)" : "oklch(0.45 0.01 60)",
              }}
            />
          )}
          <span
            className="font-mono text-xs font-bold tracking-widest whitespace-nowrap"
            style={{
              color: focused ? "oklch(0.72 0.18 55)" : "oklch(0.45 0.01 60)",
            }}
          >
            LEDGER SEARCH
          </span>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="QUERY ARCHIVES..."
          className="flex-1 bg-transparent font-mono text-sm tracking-wider outline-none px-3 py-2.5 placeholder-stone-700"
          style={{ color: "oklch(0.82 0.01 60)" }}
          spellCheck={false}
          autoComplete="off"
        />

        {/* Scanning indicator */}
        {scanning && (
          <div className="flex items-center gap-1 px-3">
            <div
              className="w-1 h-1 rounded-full animate-ping"
              style={{ background: "oklch(0.72 0.18 55)" }}
            />
            <div
              className="w-1 h-1 rounded-full animate-ping"
              style={{
                background: "oklch(0.72 0.18 55)",
                animationDelay: "0.1s",
              }}
            />
            <div
              className="w-1 h-1 rounded-full animate-ping"
              style={{
                background: "oklch(0.72 0.18 55)",
                animationDelay: "0.2s",
              }}
            />
          </div>
        )}

        {/* Clear */}
        {query.length > 0 && !scanning && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="px-3 py-2.5 transition-colors"
            style={{ color: "oklch(0.45 0.01 60)" }}
          >
            <X size={14} />
          </button>
        )}

        {/* Amber scan line animation on focus */}
        {focused && (
          <div
            className="absolute bottom-0 left-0 h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.72 0.18 55), transparent)",
              animation: "scan-line 1.5s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* Results Dropdown */}
      {focused && filtered.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-px overflow-hidden"
          style={{
            background: "oklch(0.07 0.006 270)",
            border: "1px solid oklch(0.72 0.18 55 / 0.4)",
            borderTop: "none",
            boxShadow: "0 8px 32px oklch(0 0 0 / 0.8)",
          }}
        >
          {/* Terminal header */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 border-b"
            style={{
              borderColor: "oklch(0.22 0.01 270)",
              background: "oklch(0.09 0.006 270)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "oklch(0.72 0.18 55)" }}
            />
            <span
              className="font-mono text-xs tracking-widest"
              style={{ color: "oklch(0.45 0.01 60)" }}
            >
              {filtered.length} RECORD{filtered.length !== 1 ? "S" : ""}{" "}
              RETRIEVED
            </span>
          </div>

          {filtered.map((item, i) => {
            const riskLevel = item.riskLevel;
            const summary = item.summary;
            const riskScore = item.riskScore;
            const highRisk = isHighRisk(item);

            return (
              <div
                role="presentation"
                key={item.id || i}
                className="flex items-start gap-3 px-3 py-2.5 border-b cursor-pointer transition-colors"
                style={{
                  borderColor: "oklch(0.14 0.005 270)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "oklch(0.72 0.18 55 / 0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setQuery("");
                    setFocused(false);
                  }
                }}
                onClick={() => {
                  setQuery("");
                  setFocused(false);
                }}
              >
                <span
                  className="font-mono text-xs font-bold tracking-wider mt-0.5 shrink-0"
                  style={{
                    color: highRisk
                      ? "oklch(0.72 0.18 55)"
                      : "oklch(0.45 0.01 60)",
                  }}
                >
                  [{riskLevel?.toUpperCase() ?? "SCAN"}]
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-stone-300 truncate">
                    {item.text?.slice(0, 80) ?? "—"}
                  </p>
                  {summary && (
                    <p className="font-mono text-xs text-stone-600 truncate mt-0.5">
                      {summary.slice(0, 60)}
                    </p>
                  )}
                </div>
                <span className="font-mono text-xs text-stone-700 shrink-0">
                  {riskScore != null ? `${riskScore}/10` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* No results */}
      {focused && query.trim().length > 0 && filtered.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-px px-4 py-3"
          style={{
            background: "oklch(0.07 0.006 270)",
            border: "1px solid oklch(0.72 0.18 55 / 0.4)",
            borderTop: "none",
          }}
        >
          <span
            className="font-mono text-xs tracking-wider"
            style={{ color: "oklch(0.35 0.008 60)" }}
          >
            NO RECORDS MATCH — LEDGER CLEAR
          </span>
        </div>
      )}
    </div>
  );
}
