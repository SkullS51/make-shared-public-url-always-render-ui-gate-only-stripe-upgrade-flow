import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useState } from "react";

const STEPS = [
  {
    number: 5,
    sense: "SEE",
    prompt: "Name 5 things you can see right now.",
    placeholder: "I see the wall, a lamp, my hands...",
    color: "text-blood-red",
    border: "border-blood-red",
  },
  {
    number: 4,
    sense: "TOUCH",
    prompt: "Name 4 things you can physically touch or feel right now.",
    placeholder: "I feel the chair, my phone, the floor...",
    color: "text-ember-orange",
    border: "border-ember-orange",
  },
  {
    number: 3,
    sense: "HEAR",
    prompt: "Name 3 sounds you can hear right now.",
    placeholder: "I hear traffic, my breath, a clock...",
    color: "text-amber-glow",
    border: "border-amber-glow",
  },
  {
    number: 2,
    sense: "SMELL",
    prompt:
      "Name 2 things you can smell right now. (If none, name 2 you like.)",
    placeholder: "I smell coffee, fresh air...",
    color: "text-deep-violet",
    border: "border-deep-violet",
  },
  {
    number: 1,
    sense: "TASTE",
    prompt: "Name 1 thing you can taste right now. Take a breath. You made it.",
    placeholder: "I taste...",
    color: "text-sovereign-green",
    border: "border-sovereign-green",
  },
];

const REALITY_PROMPTS = [
  "What specific evidence supports this fear?",
  "Is this a fact, or is this a feeling?",
  "What would you tell a close friend in this exact situation?",
  "Has this exact scenario happened before? What was the outcome?",
  "What is the realistic worst case? Can you survive it?",
  "Who else knows about this — are you alone in it?",
];

const ANCHORS = [
  {
    label: "Name 5 safe things you see",
    action: "Look around slowly. Count 5 objects. They are real.",
  },
  {
    label: "Touch something cold",
    action: "Find metal, glass, or water. Press your palm flat against it.",
  },
  {
    label: "Say your name and today's date",
    action: "Out loud: your full name, where you are, today's date.",
  },
  {
    label: "List 3 things you're grateful for",
    action: "They don't need to be big. Small counts.",
  },
  {
    label: "Slow breath — 4 counts in, 7 hold, 8 out",
    action: "Breathe in through nose 4 counts. Hold 7. Out through mouth 8.",
  },
  {
    label: "Feel the floor under your feet",
    action: "Plant both feet flat. Feel the ground. You are supported.",
  },
];

type BreathPhase = "READY" | "INHALE" | "HOLD" | "EXHALE";

export default function GroundNowSection() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(""));
  const [done, setDone] = useState(false);

  const [breathPhase, setBreathPhase] = useState<BreathPhase>("READY");
  const [breathActive, setBreathActive] = useState(false);
  const [breathCount, setBreathCount] = useState(0);

  const [showReality, setShowReality] = useState(false);
  const [showAnchors, setShowAnchors] = useState(false);

  useEffect(() => {
    if (!breathActive) return;
    const cycle: BreathPhase[] = ["INHALE", "HOLD", "EXHALE"];
    let index = 0;
    setBreathPhase("INHALE");
    const run = () => {
      index = (index + 1) % cycle.length;
      setBreathPhase(cycle[index]);
      setBreathCount((c) => c + 1);
    };
    const id = setInterval(run, 4000);
    return () => clearInterval(id);
  }, [breathActive]);

  const handleAnswer = (val: string) => {
    const next = [...answers];
    next[step] = val;
    setAnswers(next);
  };

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setDone(true);
    }
  }, [step]);

  const reset = () => {
    setActive(false);
    setStep(0);
    setAnswers(Array(5).fill(""));
    setDone(false);
    setBreathActive(false);
    setBreathPhase("READY");
  };

  const breathScale =
    breathPhase === "INHALE" || breathPhase === "HOLD"
      ? "scale-125"
      : "scale-100";
  const breathGlow =
    breathPhase === "INHALE"
      ? "shadow-[0_0_40px_oklch(0.50_0.20_25/0.8)]"
      : breathPhase === "HOLD"
        ? "shadow-[0_0_50px_oklch(0.65_0.18_45/0.9)]"
        : "shadow-[0_0_20px_oklch(0.50_0.20_25/0.3)]";

  const breathLabel =
    breathPhase === "READY"
      ? "TAP TO BREATHE"
      : breathPhase === "INHALE"
        ? "INHALE..."
        : breathPhase === "HOLD"
          ? "HOLD..."
          : "EXHALE...";

  return (
    <div className="min-h-screen bg-void text-stone-200 px-4 py-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-cinzel text-3xl font-bold text-blood-red tracking-widest mb-2">
          FIRST AID STOP
        </h1>
        <p className="font-mono text-stone-500 text-sm">
          OFFLINE · FREE · NO LOGIN REQUIRED
        </p>
      </div>

      {/* Breathing Circle */}
      <div className="flex flex-col items-center mb-8">
        <button
          type="button"
          data-ocid="ground.breathing.toggle"
          onClick={() => {
            setBreathActive((b) => !b);
            setBreathPhase(breathActive ? "READY" : "INHALE");
          }}
          className={`relative w-36 h-36 rounded-full border-4 border-blood-red flex items-center justify-center cursor-pointer transition-all duration-[4000ms] ease-in-out ${breathScale} ${breathGlow}`}
          style={{ background: "oklch(0.08 0.008 270)" }}
          aria-label="Breathing circle"
        >
          <div
            className={`absolute inset-0 rounded-full border-2 border-blood-red/30 transition-all duration-[4000ms] ${
              breathActive && breathPhase === "INHALE"
                ? "scale-110 opacity-60"
                : "scale-100 opacity-20"
            }`}
          />
          <span className="font-cinzel text-sm text-blood-red text-center leading-tight px-3">
            {breathLabel}
          </span>
        </button>
        {breathActive && (
          <p className="font-mono text-xs text-stone-600 mt-3">
            {breathCount > 0 ? `Breath ${breathCount}` : ""} · 4 · 4 · 4 rhythm
          </p>
        )}
        {!breathActive && (
          <p className="font-mono text-xs text-stone-600 mt-2">
            Tap circle to start breathing
          </p>
        )}
      </div>

      {/* GROUND NOW Button */}
      {!active && !done && (
        <div className="text-center mb-8">
          <button
            type="button"
            data-ocid="ground.start.primary_button"
            onClick={() => setActive(true)}
            className="relative inline-flex items-center justify-center px-12 py-6 font-cinzel text-2xl font-bold text-stone-100 tracking-widest cursor-pointer"
            style={{
              background: "oklch(0.45 0.2 25)",
              boxShadow:
                "0 0 30px oklch(0.50 0.20 25 / 0.6), 0 0 60px oklch(0.45 0.2 25 / 0.3)",
              animation: "crimson-pulse 2s ease-in-out infinite",
              border: "2px solid oklch(0.60 0.20 25)",
            }}
          >
            🔥 GROUND NOW
          </button>
          <p className="font-mono text-stone-600 text-sm mt-4">
            5-4-3-2-1 Sensory Grounding · Takes 3 minutes
          </p>
        </div>
      )}

      {/* 5-4-3-2-1 Stepper */}
      {active && !done && (
        <div className="mb-8">
          <div className="flex gap-2 justify-center mb-6">
            {STEPS.map((s, i) => (
              <button
                type="button"
                key={s.number}
                data-ocid={`ground.step.tab.${i + 1}`}
                onClick={() => setStep(i)}
                className={`w-10 h-10 font-cinzel font-bold text-sm border-2 transition-all duration-200 ${
                  i === step
                    ? "bg-blood-red/20 border-blood-red text-blood-red shadow-blood"
                    : i < step
                      ? "bg-stone-800 border-stone-600 text-stone-400"
                      : "bg-void border-stone-800 text-stone-700"
                }`}
              >
                {s.number}
              </button>
            ))}
          </div>

          <div
            className={`border ${STEPS[step].border} bg-void-800 p-6`}
            style={{ boxShadow: "inset 0 0 40px oklch(0 0 0 / 0.3)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`font-cinzel text-4xl font-black ${STEPS[step].color}`}
              >
                {STEPS[step].number}
              </span>
              <div>
                <div
                  className={`font-cinzel text-lg font-bold tracking-widest ${STEPS[step].color}`}
                >
                  {STEPS[step].sense}
                </div>
                <p className="font-mono text-stone-300 text-sm mt-1">
                  {STEPS[step].prompt}
                </p>
              </div>
            </div>

            <Textarea
              data-ocid={`ground.step.input.${step + 1}`}
              value={answers[step]}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={STEPS[step].placeholder}
              rows={3}
              className="bg-void border-stone-700 font-mono text-stone-200 text-sm resize-none focus:border-blood-red/60"
            />

            <div className="flex justify-between items-center mt-4">
              {step > 0 ? (
                <button
                  type="button"
                  data-ocid="ground.step.back_button"
                  onClick={() => setStep((s) => s - 1)}
                  className="font-mono text-sm text-stone-500 hover:text-stone-300 transition-colors"
                >
                  ← BACK
                </button>
              ) : (
                <div />
              )}
              <Button
                data-ocid="ground.step.next.primary_button"
                onClick={handleNext}
                className="font-cinzel bg-blood-red/20 border border-blood-red text-blood-red hover:bg-blood-red/30 tracking-wider"
              >
                {step === STEPS.length - 1 ? "COMPLETE ✓" : "NEXT →"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Completion State */}
      {done && (
        <div
          className="text-center p-8 border border-sovereign-green mb-8"
          style={{ boxShadow: "0 0 30px oklch(0.55 0.2 145 / 0.3)" }}
        >
          <div className="text-4xl mb-4">🐉</div>
          <h2 className="font-cinzel text-xl text-sovereign-green tracking-widest mb-2">
            GROUNDED. YOU HELD.
          </h2>
          <p className="font-mono text-stone-400 text-sm mb-6">
            The dragon stood with you. You are present. You are safe.
          </p>
          <Button
            data-ocid="ground.reset.button"
            onClick={reset}
            className="font-cinzel border border-stone-600 bg-stone-900 text-stone-300 hover:border-blood-red/50 tracking-wider"
          >
            RESET
          </Button>
        </div>
      )}

      {/* Reality Testing Panel */}
      <div className="mb-4">
        <button
          type="button"
          data-ocid="ground.reality.toggle"
          onClick={() => setShowReality((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 border border-stone-700 bg-void-800 font-cinzel text-sm text-stone-300 hover:border-blood-red/50 hover:text-blood-red transition-all"
        >
          <span>⚔ REALITY TESTING PROMPTS</span>
          <span className="text-stone-600">{showReality ? "▲" : "▼"}</span>
        </button>
        {showReality && (
          <div className="border border-t-0 border-stone-700 bg-void p-4 space-y-3">
            {REALITY_PROMPTS.map((prompt, i) => (
              <div
                key={prompt}
                data-ocid={`ground.reality.item.${i + 1}`}
                className="flex items-start gap-3 p-3 bg-void-800 border border-stone-800"
              >
                <span className="text-blood-red font-cinzel font-bold text-sm shrink-0 mt-0.5">
                  {i + 1}.
                </span>
                <p className="font-mono text-stone-300 text-sm">{prompt}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safe Distraction Anchors */}
      <div className="mb-4">
        <button
          type="button"
          data-ocid="ground.anchors.toggle"
          onClick={() => setShowAnchors((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 border border-stone-700 bg-void-800 font-cinzel text-sm text-stone-300 hover:border-ember-orange/50 hover:text-ember-orange transition-all"
        >
          <span>🔗 SAFE DISTRACTION ANCHORS</span>
          <span className="text-stone-600">{showAnchors ? "▲" : "▼"}</span>
        </button>
        {showAnchors && (
          <div className="border border-t-0 border-stone-700 bg-void p-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ANCHORS.map((anchor, i) => (
              <div
                key={anchor.label}
                data-ocid={`ground.anchor.card.${i + 1}`}
                className="p-4 bg-void-800 border border-stone-800 hover:border-ember-orange/40 transition-all"
              >
                <p className="font-cinzel text-ember-orange text-xs font-bold tracking-wider mb-2">
                  {anchor.label}
                </p>
                <p className="font-mono text-stone-400 text-xs leading-relaxed">
                  {anchor.action}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="text-center mt-12 pt-6 border-t border-stone-900">
        <p className="font-mono text-stone-700 text-xs">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-600 hover:text-ember-orange transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
