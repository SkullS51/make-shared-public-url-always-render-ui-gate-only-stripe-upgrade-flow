import { Activity, Camera, CameraOff, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../contexts/AppContext";

export type BpmCategory = "crimson" | "amber" | "sovereign" | "idle";

interface HeartRateMonitorProps {
  onClose?: () => void;
  onBpmUpdate?: (bpm: number, category: BpmCategory) => void;
}

function categorizeBpm(bpm: number): BpmCategory {
  if (bpm > 100) return "crimson";
  if (bpm >= 85) return "amber";
  return "sovereign";
}

function getBpmCommand(category: BpmCategory): string {
  switch (category) {
    case "crimson":
      return "Intense spike detected. Lock in. Reset Breath.";
    case "amber":
      return "Physical spike detected. You are safe. Take control—Reset Breath.";
    case "sovereign":
      return "Standing Firm. Sovereignty maintained.";
    default:
      return "Place thumb over rear camera lens.";
  }
}

function getBpmColor(category: BpmCategory): string {
  switch (category) {
    case "crimson":
      return "oklch(0.50 0.25 25)"; // Blood crimson
    case "amber":
      return "oklch(0.72 0.18 55)"; // Amber glow
    case "sovereign":
      return "oklch(0.55 0.20 145)"; // Sovereign green
    default:
      return "oklch(0.40 0.01 270)";
  }
}

function getBpmLabel(category: BpmCategory): string {
  switch (category) {
    case "crimson":
      return "CRIMSON PULSE";
    case "amber":
      return "AMBER GLOW";
    case "sovereign":
      return "SOVEREIGN GREEN";
    default:
      return "AWAITING SIGNAL";
  }
}

export default function HeartRateMonitor({
  onClose,
  onBpmUpdate,
}: HeartRateMonitorProps) {
  const { setBpmState } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const samplesRef = useRef<number[]>([]);
  const lastPeakRef = useRef<number>(0);
  const peakIntervalsRef = useRef<number[]>([]);

  const [isActive, setIsActive] = useState(false);
  const [bpm, setBpm] = useState<number | null>(null);
  const [category, setCategory] = useState<BpmCategory>("idle");
  const [error, setError] = useState<string | null>(null);
  const [signalStrength, setSignalStrength] = useState(0);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setIsActive(false);
  }, []);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 16;
    canvas.height = 16;
    ctx.drawImage(video, 0, 0, 16, 16);
    const imageData = ctx.getImageData(0, 0, 16, 16);
    const data = imageData.data;

    // Calculate average red channel value (PPG signal)
    let redSum = 0;
    for (let i = 0; i < data.length; i += 4) {
      redSum += data[i];
    }
    const avgRed = redSum / (data.length / 4);

    samplesRef.current.push(avgRed);
    if (samplesRef.current.length > 120) {
      samplesRef.current.shift();
    }

    // Signal strength: variance in red channel
    if (samplesRef.current.length >= 10) {
      const mean =
        samplesRef.current.reduce((a, b) => a + b, 0) /
        samplesRef.current.length;
      const variance =
        samplesRef.current.reduce((a, b) => a + (b - mean) ** 2, 0) /
        samplesRef.current.length;
      const strength = Math.min(100, Math.sqrt(variance) * 5);
      setSignalStrength(Math.round(strength));

      // Peak detection for BPM
      const recent = samplesRef.current.slice(-30);
      const recentMean = recent.reduce((a, b) => a + b, 0) / recent.length;
      const now = Date.now();

      if (avgRed > recentMean * 1.02 && now - lastPeakRef.current > 400) {
        const interval = now - lastPeakRef.current;
        if (interval < 2000 && interval > 300) {
          peakIntervalsRef.current.push(interval);
          if (peakIntervalsRef.current.length > 8) {
            peakIntervalsRef.current.shift();
          }
        }
        lastPeakRef.current = now;
      }

      // Calculate BPM from peak intervals
      if (peakIntervalsRef.current.length >= 3) {
        const avgInterval =
          peakIntervalsRef.current.reduce((a, b) => a + b, 0) /
          peakIntervalsRef.current.length;
        const calculatedBpm = Math.round(60000 / avgInterval);
        if (calculatedBpm >= 40 && calculatedBpm <= 200) {
          setBpm(calculatedBpm);
          const cat = categorizeBpm(calculatedBpm);
          setCategory(cat);
          onBpmUpdate?.(calculatedBpm, cat);
          setBpmState(calculatedBpm, cat);
        }
      }
    }

    rafRef.current = requestAnimationFrame(processFrame);
  }, [onBpmUpdate, setBpmState]);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 30 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Try to enable torch/flash for better signal
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ torch: true } as MediaTrackConstraintSet],
          });
        } catch {
          // Torch not available, continue without it
        }
      }

      samplesRef.current = [];
      peakIntervalsRef.current = [];
      lastPeakRef.current = Date.now();
      setIsActive(true);
      rafRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      setError(
        "Camera access required. Hold device steady with thumb over rear lens.",
      );
      console.error("Camera error:", err);
    }
  }, [processFrame]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const categoryColor = getBpmColor(category);
  const command = getBpmCommand(category);
  const label = getBpmLabel(category);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/95"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-sm mx-4 p-6 rounded-sm"
        style={{
          background: "oklch(0.07 0.006 270)",
          border: `2px solid ${categoryColor}`,
          boxShadow: `0 0 40px ${categoryColor}40`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity size={18} style={{ color: categoryColor }} />
            <span
              className="font-cinzel text-sm font-bold tracking-widest"
              style={{ color: categoryColor }}
            >
              VITALS MONITOR
            </span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="text-stone-500 hover:text-stone-300 transition-colors"
              data-ocid="hrm.close_button"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Video feed (hidden, used for processing) */}
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />
        <canvas ref={canvasRef} className="hidden" />

        {/* Status display */}
        {!isActive && !error && (
          <div className="text-center mb-6">
            <div
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center border-2"
              style={{
                borderColor: "oklch(0.25 0.01 270)",
                background: "oklch(0.10 0.005 270)",
              }}
            >
              <Camera size={36} className="text-stone-600" />
            </div>
            <p className="text-stone-400 font-mono text-sm leading-relaxed">
              Place thumb over rear camera lens.
            </p>
            <p className="text-stone-600 font-mono text-xs mt-2">
              Hold steady for accurate reading.
            </p>
          </div>
        )}

        {error && (
          <div
            className="mb-4 p-3 rounded-sm text-center"
            style={{
              background: "oklch(0.38 0.18 25 / 0.1)",
              border: "1px solid oklch(0.38 0.18 25 / 0.4)",
            }}
          >
            <CameraOff size={20} className="text-blood-red mx-auto mb-2" />
            <p className="text-stone-400 font-mono text-xs">{error}</p>
          </div>
        )}

        {isActive && (
          <>
            {/* BPM display */}
            <div className="text-center mb-6">
              <div
                className="text-6xl font-cinzel font-bold mb-1 transition-colors duration-500"
                style={{
                  color: categoryColor,
                  textShadow: `0 0 20px ${categoryColor}80`,
                }}
              >
                {bpm ?? "--"}
              </div>
              <div className="text-stone-500 font-mono text-xs tracking-widest">
                BPM
              </div>

              {/* State label */}
              <div
                className="inline-block mt-3 px-4 py-1 font-cinzel text-xs font-bold tracking-widest rounded-sm"
                style={{
                  color: categoryColor,
                  background: `${categoryColor}18`,
                  border: `1px solid ${categoryColor}50`,
                }}
              >
                {label}
              </div>
            </div>

            {/* Signal strength bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-stone-600 font-mono text-xs">SIGNAL</span>
                <span className="text-stone-500 font-mono text-xs">
                  {signalStrength}%
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "oklch(0.14 0.006 270)" }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${signalStrength}%`,
                    background: categoryColor,
                    boxShadow: `0 0 6px ${categoryColor}60`,
                  }}
                />
              </div>
            </div>

            {/* Command */}
            <div
              className="p-4 rounded-sm text-center"
              style={{
                background: `${categoryColor}10`,
                border: `1px solid ${categoryColor}30`,
              }}
            >
              <p
                className="font-cinzel text-sm font-bold leading-relaxed"
                style={{ color: categoryColor }}
              >
                {command}
              </p>
            </div>
          </>
        )}

        {/* Control button */}
        <button
          type="button"
          onClick={isActive ? stopCamera : startCamera}
          className="w-full mt-5 py-3 font-cinzel font-bold text-sm tracking-widest transition-all duration-200"
          style={{
            background: isActive
              ? "oklch(0.38 0.18 25 / 0.15)"
              : `${categoryColor}18`,
            border: `1px solid ${isActive ? "oklch(0.38 0.18 25 / 0.5)" : categoryColor}`,
            color: isActive ? "oklch(0.50 0.20 25)" : categoryColor,
          }}
          data-ocid="hrm.primary_button"
        >
          {isActive ? "STOP MONITOR" : "ACTIVATE VITALS"}
        </button>
      </div>
    </div>
  );
}
