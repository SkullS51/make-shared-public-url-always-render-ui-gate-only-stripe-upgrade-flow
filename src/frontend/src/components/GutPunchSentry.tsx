import { useEffect, useRef, useState } from "react";

const TELEMETRY_LINES = [
  "[SYS] PING: SHEPHERD_ROUTE_ACTIVE...",
  "[NET] ENCRYPTED_HANDSHAKE_COMPLETE...",
  "[AUDIT] PROCESS_LIST_CLEAN...",
  "[WATCH] MONITORING_RADIO_FREQUENCIES...",
  "[SCAN] PERIMETER_CHECK_NOMINAL...",
  "[AUTH] TOKEN_REFRESH_COMPLETE...",
  "[GUARD] DRAGON_SNIFFER_ACTIVE...",
  "[SYS] HEARTBEAT_PULSE_OK...",
  "[NET] SOVEREIGN_CHANNEL_SECURE...",
  "[AUDIT] NO_ANOMALIES_DETECTED...",
];

export default function GutPunchSentry() {
  const [lastScanMs, setLastScanMs] = useState(0);
  const [telemetry, setTelemetry] = useState<string[]>(
    TELEMETRY_LINES.slice(0, 4),
  );
  const [lineIndex, setLineIndex] = useState(4);
  const lastScanRef = useRef(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update last scan counter every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      setLastScanMs(Date.now() - lastScanRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Reset scan timer every 3 seconds (simulate a new scan)
  useEffect(() => {
    const interval = setInterval(() => {
      lastScanRef.current = Date.now();
      setLastScanMs(0);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Append new telemetry line every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const next = [
          ...prev,
          TELEMETRY_LINES[lineIndex % TELEMETRY_LINES.length],
        ];
        return next.slice(-20); // keep last 20 lines
      });
      setLineIndex((i) => i + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, [lineIndex]);

  // Auto-scroll telemetry — ref-only effect, no reactive deps needed
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll-on-update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [telemetry]);

  const formatMs = (ms: number) => {
    if (ms < 1000) return `${ms}ms AGO`;
    return `${(ms / 1000).toFixed(1)}s AGO`;
  };

  return (
    <div
      className="bg-black font-mono border border-green-900 shadow-2xl rounded-sm p-6"
      data-ocid="sentry.panel"
    >
      {/* Header */}
      <h2 className="text-green-500 text-base uppercase tracking-widest mb-5">
        &gt;&gt; GUTPUNCH_SENTRY_v1.0
      </h2>

      {/* Heartbeat */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
        <span className="text-green-500 text-sm tracking-wide">
          SHEPHERD HEARTBEAT:{" "}
          <span className="text-white font-bold">SYNCHRONIZED</span>
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="border border-green-900 p-3">
          <p className="text-green-700 text-xs tracking-widest mb-1">
            LAST SCAN
          </p>
          <p className="text-white text-base font-bold tabular-nums">
            {formatMs(lastScanMs)}
          </p>
        </div>
        <div className="border border-green-900 p-3">
          <p className="text-green-700 text-xs tracking-widest mb-1">
            THREATS NEUTRALIZED
          </p>
          <p className="text-white text-base font-bold">0</p>
        </div>
      </div>

      {/* Telemetry stream */}
      <div>
        <p className="text-green-700 text-xs tracking-widest mb-2">
          TELEMETRY_STREAM
        </p>
        <div
          ref={scrollRef}
          className="bg-gray-950 border border-green-950 p-3 h-28 overflow-y-auto text-[10px] text-green-600/60 leading-relaxed space-y-0.5"
          style={{ scrollbarWidth: "none" }}
        >
          {telemetry.map((line, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: telemetry lines are append-only display
              key={i}
              className={i === telemetry.length - 1 ? "text-green-500/80" : ""}
            >
              {line}
            </div>
          ))}
          <div className="inline-block w-1.5 h-3 bg-green-500/70 animate-pulse align-middle" />
        </div>
      </div>
    </div>
  );
}
