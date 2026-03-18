import { useNavigate } from "@tanstack/react-router";
import { Mic, MicOff } from "lucide-react";
import React, { useState, useCallback } from "react";

const COMMANDS: { keywords: string[]; path: string; label: string }[] = [
  { keywords: ["chat", "punch", "home"], path: "/chat", label: "Chat" },
  { keywords: ["scan", "threat", "analyze"], path: "/scan", label: "Scan" },
  {
    keywords: ["consultant", "dragon wisdom", "wisdom"],
    path: "/consultant",
    label: "Consultant",
  },
  {
    keywords: ["safe draft", "draft", "journal", "vault"],
    path: "/safe-draft",
    label: "Safe Draft",
  },
  {
    keywords: ["console", "system", "status"],
    path: "/console",
    label: "Console",
  },
  { keywords: ["profile", "warrior"], path: "/profile", label: "Profile" },
  {
    keywords: ["upgrade", "pro", "subscribe"],
    path: "/upgrade",
    label: "Upgrade",
  },
  {
    keywords: ["admin", "settings", "control"],
    path: "/admin",
    label: "Admin",
  },
  {
    keywords: ["destroy", "rebuild", "audio"],
    path: "/destroy-rebuild",
    label: "Destroy & Rebuild",
  },
];

export default function VoiceNav() {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [supported] = useState(
    () => "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
  );

  const handleMic = useCallback(() => {
    if (!supported) {
      setFeedback("Voice nav not supported in this browser");
      setTimeout(() => setFeedback(""), 3000);
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    setFeedback("Listening...");

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const matched = COMMANDS.find((cmd) =>
        cmd.keywords.some((k) => transcript.includes(k)),
      );
      if (matched) {
        setFeedback(`Going to ${matched.label}...`);
        setTimeout(() => {
          navigate({ to: matched.path });
          setFeedback("");
        }, 500);
      } else {
        setFeedback(`"${transcript}" — command not recognized`);
        setTimeout(() => setFeedback(""), 3000);
      }
    };

    recognition.onerror = () => {
      setFeedback("Could not hear command");
      setTimeout(() => setFeedback(""), 3000);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  }, [supported, navigate]);

  if (!supported) return null;

  return (
    <>
      {/* Feedback toast */}
      {feedback && (
        <div
          className="fixed bottom-24 right-4 z-50 px-4 py-2 font-mono text-xs rounded-sm"
          style={{
            background: "oklch(0.09 0.006 270)",
            border: "1px solid oklch(0.38 0.18 25 / 0.5)",
            color: "oklch(0.72 0.18 55)",
            boxShadow: "0 0 12px rgba(139,0,0,0.3)",
          }}
        >
          {feedback}
        </div>
      )}

      {/* Floating mic button */}
      <button
        type="button"
        data-ocid="voice_nav.button"
        onClick={handleMic}
        disabled={listening}
        className="fixed bottom-6 right-4 z-50 w-12 h-12 flex items-center justify-center transition-all duration-200"
        style={{
          background: listening
            ? "oklch(0.38 0.18 25 / 0.8)"
            : "oklch(0.12 0.006 270)",
          border: `1px solid ${listening ? "oklch(0.50 0.20 25)" : "oklch(0.22 0.01 270)"}`,
          boxShadow: listening
            ? "0 0 20px rgba(139,0,0,0.5)"
            : "0 2px 8px rgba(0,0,0,0.5)",
          borderRadius: 4,
        }}
        title="Voice navigation"
        aria-label="Voice navigation"
      >
        {listening ? (
          <Mic
            size={20}
            style={{ color: "oklch(0.50 0.20 25)" }}
            className="animate-pulse"
          />
        ) : (
          <MicOff size={20} className="text-stone-500" />
        )}
      </button>
    </>
  );
}
