import { Check, Eye, Mic, Volume2, Wind, X, Zap } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import HeartRateMonitor from "./HeartRateMonitor";

interface StageState {
  completed: boolean;
  inputs: string[];
}

interface WheelStage {
  id: number;
  label: string;
  sense: string;
  instruction: string;
  icon: React.ElementType;
  color: string;
  strokeColor: string;
}

const STAGES: WheelStage[] = [
  {
    id: 5,
    label: "5 SEE",
    sense: "Sight",
    instruction: "Name 5 things you can see right now.",
    icon: Eye,
    color: "oklch(0.50 0.20 25)",
    strokeColor: "oklch(0.50 0.20 25)",
  },
  {
    id: 4,
    label: "4 TOUCH",
    sense: "Touch",
    instruction: "Activate vitals scan. Hold thumb to rear camera.",
    icon: Zap,
    color: "oklch(0.72 0.18 55)",
    strokeColor: "oklch(0.72 0.18 55)",
  },
  {
    id: 3,
    label: "3 SOUND",
    sense: "Sound",
    instruction: "Ambient stabilizing frequency activated.",
    icon: Volume2,
    color: "oklch(0.55 0.22 300)",
    strokeColor: "oklch(0.55 0.22 300)",
  },
  {
    id: 2,
    label: "2 SMELL",
    sense: "Smell",
    instruction: "Name 2 things you can smell or breathe deeply.",
    icon: Wind,
    color: "oklch(0.55 0.20 145)",
    strokeColor: "oklch(0.55 0.20 145)",
  },
  {
    id: 1,
    label: "1 TASTE",
    sense: "Taste",
    instruction: "Haptic pulse activated. 60BPM grounding rhythm.",
    icon: Mic,
    color: "oklch(0.50 0.15 220)",
    strokeColor: "oklch(0.50 0.15 220)",
  },
];

function polarToXY(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function buildArcPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startDeg: number,
  endDeg: number,
): string {
  const [x1, y1] = polarToXY(cx, cy, outerR, startDeg);
  const [x2, y2] = polarToXY(cx, cy, outerR, endDeg);
  const [x3, y3] = polarToXY(cx, cy, innerR, endDeg);
  const [x4, y4] = polarToXY(cx, cy, innerR, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

interface SensoryGroundingWheelProps {
  onClose: () => void;
}

export default function SensoryGroundingWheel({
  onClose,
}: SensoryGroundingWheelProps) {
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [stageStates, setStageStates] = useState<Record<number, StageState>>(
    () =>
      Object.fromEntries(
        STAGES.map((s) => [s.id, { completed: false, inputs: [] }]),
      ),
  );
  const [inputValue, setInputValue] = useState("");
  const [showHRM, setShowHRM] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [hapticActive, setHapticActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const hapticTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const SIZE = 280;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const outerR = 120;
  const innerR = 50;
  const segmentAngle = 360 / STAGES.length;
  const gap = 3; // degrees gap between segments

  const stopAudio = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        gainRef.current?.gain.setTargetAtTime(
          0,
          audioCtxRef.current!.currentTime,
          0.3,
        );
        setTimeout(() => {
          oscillatorRef.current?.stop();
          oscillatorRef.current?.disconnect();
          oscillatorRef.current = null;
        }, 500);
      } catch {
        /* ignore */
      }
    }
    setAudioPlaying(false);
  }, []);

  const startAmbientFrequency = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;

      if (oscillatorRef.current) {
        stopAudio();
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(432, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainRef.current = gain;
      setAudioPlaying(true);
    } catch (err) {
      console.error("Audio error:", err);
    }
  }, [stopAudio]);

  const startHapticPulse = useCallback(() => {
    if (!navigator.vibrate) return;
    setHapticActive(true);
    let count = 0;
    const maxPulses = 10;
    hapticTimerRef.current = setInterval(() => {
      navigator.vibrate(80);
      count++;
      if (count >= maxPulses) {
        if (hapticTimerRef.current) clearInterval(hapticTimerRef.current);
        setHapticActive(false);
      }
    }, 1000); // 60 BPM = 1 pulse per second
  }, []);

  const stopHaptic = useCallback(() => {
    if (hapticTimerRef.current) {
      clearInterval(hapticTimerRef.current);
      hapticTimerRef.current = null;
    }
    navigator.vibrate?.(0);
    setHapticActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
      stopHaptic();
    };
  }, [stopAudio, stopHaptic]);

  const handleSegmentClick = (stageId: number) => {
    if (activeStage === stageId) {
      setActiveStage(null);
      return;
    }
    setActiveStage(stageId);
    setInputValue("");

    if (stageId === 4) {
      setShowHRM(true);
    }
    if (stageId === 3) {
      startAmbientFrequency();
    }
    if (stageId === 1 || stageId === 2) {
      startHapticPulse();
    }
  };

  const handleAddInput = (stageId: number) => {
    if (!inputValue.trim()) return;
    setStageStates((prev) => {
      const current = prev[stageId];
      const newInputs = [...current.inputs, inputValue.trim()].slice(
        0,
        stageId,
      );
      return {
        ...prev,
        [stageId]: {
          inputs: newInputs,
          completed: newInputs.length >= stageId,
        },
      };
    });
    setInputValue("");
  };

  const allCompleted = STAGES.every((s) => stageStates[s.id].completed);
  const completedCount = STAGES.filter(
    (s) => stageStates[s.id].completed,
  ).length;

  const activeStageData = STAGES.find((s) => s.id === activeStage);

  return (
    <>
      {showHRM && (
        <HeartRateMonitor
          onClose={() => {
            setShowHRM(false);
            setStageStates((prev) => ({
              ...prev,
              4: { ...prev[4], completed: true },
            }));
          }}
        />
      )}

      <div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center"
        style={{
          background: "oklch(0.04 0.004 270 / 0.96)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 transition-colors"
          data-ocid="grounding.close_button"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="text-center mb-6 px-4">
          <h2 className="font-cinzel text-lg font-bold tracking-widest text-stone-200 mb-1">
            SENSORY GROUNDING
          </h2>
          <p className="text-stone-500 font-mono text-xs tracking-wider">
            5-4-3-2-1 SOVEREIGN PROTOCOL · {completedCount}/5 COMPLETE
          </p>
        </div>

        {/* SVG Wheel */}
        <div className="relative flex items-center justify-center">
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ overflow: "visible" }}
            role="img"
            aria-label="Sensory grounding wheel with 5 interactive segments"
          >
            {STAGES.map((stage, index) => {
              const startDeg = index * segmentAngle + gap / 2;
              const endDeg = (index + 1) * segmentAngle - gap / 2;
              const midDeg = (startDeg + endDeg) / 2;
              const isActive = activeStage === stage.id;
              const isCompleted = stageStates[stage.id].completed;
              const labelR = (innerR + outerR) / 2;
              const [lx, ly] = polarToXY(cx, cy, labelR, midDeg);
              const arcPath = buildArcPath(
                cx,
                cy,
                innerR,
                isActive ? outerR + 14 : outerR,
                startDeg,
                endDeg,
              );

              return (
                <g key={stage.id}>
                  <path
                    d={arcPath}
                    fill={
                      isActive
                        ? `${stage.color}35`
                        : isCompleted
                          ? `${stage.color}18`
                          : "oklch(0.10 0.005 270)"
                    }
                    stroke={
                      isActive || isCompleted
                        ? stage.strokeColor
                        : "oklch(0.20 0.008 270)"
                    }
                    strokeWidth={isActive ? 1.5 : 1}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      filter: isActive
                        ? `drop-shadow(0 0 8px ${stage.color})`
                        : "none",
                    }}
                    onClick={() => handleSegmentClick(stage.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleSegmentClick(stage.id);
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Stage ${stage.id}: ${stage.sense}`}
                    aria-pressed={isActive}
                  />
                  {/* Label */}
                  <text
                    x={lx}
                    y={ly - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 9,
                      fontWeight: 700,
                      fill:
                        isActive || isCompleted
                          ? stage.color
                          : "oklch(0.40 0.01 270)",
                      letterSpacing: "0.08em",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {stage.label}
                  </text>
                  {isCompleted && (
                    <text
                      x={lx}
                      y={ly + 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: 10,
                        fill: stage.color,
                        pointerEvents: "none",
                      }}
                    >
                      ✓
                    </text>
                  )}
                </g>
              );
            })}

            {/* Center hub */}
            <circle
              cx={cx}
              cy={cy}
              r={innerR - 4}
              fill="oklch(0.07 0.005 270)"
              stroke={
                allCompleted ? "oklch(0.55 0.20 145)" : "oklch(0.18 0.007 270)"
              }
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 8,
                fontWeight: 700,
                fill: allCompleted
                  ? "oklch(0.55 0.20 145)"
                  : "oklch(0.30 0.01 270)",
                letterSpacing: "0.1em",
              }}
            >
              {allCompleted ? "GROUNDED" : "TAP"}
            </text>
            <text
              x={cx}
              y={cy + 6}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 7,
                fill: allCompleted
                  ? "oklch(0.55 0.20 145)"
                  : "oklch(0.25 0.01 270)",
                letterSpacing: "0.05em",
              }}
            >
              {allCompleted ? "SOVEREIGN" : "SEGMENT"}
            </text>
          </svg>
        </div>

        {/* Active stage panel */}
        {activeStageData && (
          <div
            className="mt-4 mx-4 p-4 w-full max-w-xs rounded-sm"
            style={{
              background: `${activeStageData.color}10`,
              border: `1px solid ${activeStageData.color}40`,
              boxShadow: `0 0 20px ${activeStageData.color}20`,
            }}
          >
            <p
              className="font-cinzel text-sm font-bold tracking-wider mb-3 text-center"
              style={{ color: activeStageData.color }}
            >
              {activeStageData.instruction}
            </p>

            {/* Stage 5: text input for 5 objects */}
            {activeStageData.id === 5 && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddInput(5);
                    }}
                    placeholder="Name an object..."
                    className="flex-1 bg-stone-900/80 border border-stone-700 text-stone-200 placeholder-stone-600 font-mono text-sm px-3 py-2 rounded-sm outline-none focus:border-blood-red/60"
                    data-ocid="grounding.stage5.input"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddInput(5)}
                    className="px-3 py-2 font-cinzel text-xs font-bold tracking-wider rounded-sm transition-all"
                    style={{
                      background: `${activeStageData.color}20`,
                      border: `1px solid ${activeStageData.color}60`,
                      color: activeStageData.color,
                    }}
                    data-ocid="grounding.stage5.button"
                  >
                    ADD
                  </button>
                </div>
                <div className="space-y-1">
                  {stageStates[5].inputs.map((item) => (
                    <div
                      key={`stage5-${item}`}
                      className="flex items-center gap-2 text-xs font-mono"
                    >
                      <Check
                        size={10}
                        style={{ color: activeStageData.color }}
                      />
                      <span className="text-stone-400">{item}</span>
                    </div>
                  ))}
                  {stageStates[5].inputs.length < 5 && (
                    <p className="text-stone-600 font-mono text-xs">
                      {5 - stageStates[5].inputs.length} more to go
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Stage 2: smell input */}
            {activeStageData.id === 2 && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddInput(2);
                    }}
                    placeholder="What do you smell?"
                    className="flex-1 bg-stone-900/80 border border-stone-700 text-stone-200 placeholder-stone-600 font-mono text-sm px-3 py-2 rounded-sm outline-none focus:border-stone-500"
                    data-ocid="grounding.stage2.input"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddInput(2)}
                    className="px-3 py-2 font-cinzel text-xs font-bold tracking-wider rounded-sm transition-all"
                    style={{
                      background: `${activeStageData.color}20`,
                      border: `1px solid ${activeStageData.color}60`,
                      color: activeStageData.color,
                    }}
                    data-ocid="grounding.stage2.button"
                  >
                    ADD
                  </button>
                </div>
                {stageStates[2].inputs.map((item) => (
                  <div
                    key={`stage2-${item}`}
                    className="flex items-center gap-2 text-xs font-mono"
                  >
                    <Check size={10} style={{ color: activeStageData.color }} />
                    <span className="text-stone-400">{item}</span>
                  </div>
                ))}
                {hapticActive && (
                  <p className="text-stone-500 font-mono text-xs text-center animate-pulse">
                    HAPTIC PULSE ACTIVE · 60BPM
                  </p>
                )}
              </div>
            )}

            {/* Stage 4: camera scan */}
            {activeStageData.id === 4 && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowHRM(true)}
                  className="px-6 py-2 font-cinzel text-sm font-bold tracking-wider rounded-sm transition-all"
                  style={{
                    background: `${activeStageData.color}20`,
                    border: `1px solid ${activeStageData.color}60`,
                    color: activeStageData.color,
                  }}
                  data-ocid="grounding.stage4.button"
                >
                  OPEN VITALS SCAN
                </button>
                {stageStates[4].completed && (
                  <p
                    className="mt-2 font-cinzel text-xs font-bold"
                    style={{ color: activeStageData.color }}
                  >
                    ✓ SCAN COMPLETE
                  </p>
                )}
              </div>
            )}

            {/* Stage 3: ambient audio */}
            {activeStageData.id === 3 && (
              <div className="text-center space-y-3">
                <p className="text-stone-400 font-mono text-xs">
                  432Hz stabilizing frequency
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (audioPlaying) {
                      stopAudio();
                    } else {
                      startAmbientFrequency();
                    }
                    setStageStates((prev) => ({
                      ...prev,
                      3: { ...prev[3], completed: true },
                    }));
                  }}
                  className="px-6 py-2 font-cinzel text-sm font-bold tracking-wider rounded-sm transition-all"
                  style={{
                    background: audioPlaying
                      ? "oklch(0.38 0.18 25 / 0.15)"
                      : `${activeStageData.color}20`,
                    border: `1px solid ${audioPlaying ? "oklch(0.38 0.18 25 / 0.5)" : `${activeStageData.color}60`}`,
                    color: audioPlaying
                      ? "oklch(0.50 0.20 25)"
                      : activeStageData.color,
                  }}
                  data-ocid="grounding.stage3.button"
                >
                  {audioPlaying ? "STOP FREQUENCY" : "ACTIVATE FREQUENCY"}
                </button>
              </div>
            )}

            {/* Stage 1: taste + haptic */}
            {activeStageData.id === 1 && (
              <div className="text-center space-y-3">
                {hapticActive ? (
                  <p className="text-stone-400 font-mono text-xs animate-pulse">
                    HAPTIC PULSE ACTIVE · 60BPM GROUNDING RHYTHM
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      startHapticPulse();
                      setStageStates((prev) => ({
                        ...prev,
                        1: { ...prev[1], completed: true },
                      }));
                    }}
                    className="px-6 py-2 font-cinzel text-sm font-bold tracking-wider rounded-sm transition-all"
                    style={{
                      background: `${activeStageData.color}20`,
                      border: `1px solid ${activeStageData.color}60`,
                      color: activeStageData.color,
                    }}
                    data-ocid="grounding.stage1.button"
                  >
                    ACTIVATE PULSE
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* All complete message */}
        {allCompleted && (
          <div
            className="mt-4 mx-4 px-6 py-3 text-center rounded-sm"
            style={{
              background: "oklch(0.55 0.20 145 / 0.1)",
              border: "1px solid oklch(0.55 0.20 145 / 0.4)",
            }}
          >
            <p className="font-cinzel text-sm font-bold tracking-wider text-sovereign-green">
              PROTOCOL COMPLETE. YOU ARE GROUNDED.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
