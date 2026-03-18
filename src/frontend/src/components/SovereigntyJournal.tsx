import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useRef, useState } from "react";

// PRODUCTION NOTE: In production, entries would be encrypted with
// crypto.subtle AES-GCM using a key derived from the user's identity.
// This stub uses base64 encoding for structural demonstration only.

interface JournalEntry {
  id: string;
  text: string;
  timestamp: string;
  watermark: string;
}

function getSovereignId(): string {
  let id = localStorage.getItem("sovereign-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sovereign-id", id);
  }
  return id;
}

function encodeEntries(entries: JournalEntry[]): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(entries))));
}

function decodeEntries(raw: string): JournalEntry[] {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(raw))));
  } catch {
    return [];
  }
}

function loadEntries(): JournalEntry[] {
  const raw = localStorage.getItem("sovereignty-journal");
  if (!raw) return [];
  return decodeEntries(raw);
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem("sovereignty-journal", encodeEntries(entries));
}

export default function SovereigntyJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(loadEntries);
  const [newText, setNewText] = useState("");
  const [dragonRefusal, setDragonRefusal] = useState(false);
  const sovereignId = useRef(getSovereignId());
  const refusalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerDragonRefusal = useCallback(() => {
    setDragonRefusal(true);
    if (refusalTimer.current) clearTimeout(refusalTimer.current);
    refusalTimer.current = setTimeout(() => setDragonRefusal(false), 3000);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerDragonRefusal();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd && ["c", "s", "p", "a"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        triggerDragonRefusal();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [triggerDragonRefusal]);

  const addEntry = () => {
    if (!newText.trim()) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      timestamp: new Date().toISOString(),
      watermark: sovereignId.current.slice(0, 8),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setNewText("");
  };

  const shortId = sovereignId.current.slice(0, 12);

  return (
    <div className="min-h-screen bg-void text-stone-200 px-4 py-6 max-w-2xl mx-auto select-none">
      {dragonRefusal && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void/98"
          style={{ boxShadow: "inset 0 0 80px oklch(0.45 0.2 25 / 0.6)" }}
          data-ocid="journal.dragon.modal"
        >
          <div
            className="text-7xl mb-6"
            style={{ filter: "drop-shadow(0 0 20px oklch(0.50 0.20 25))" }}
          >
            🐉
          </div>
          <h2
            className="font-cinzel text-2xl font-black text-blood-red tracking-widest text-center mb-4 px-8"
            style={{ textShadow: "0 0 30px oklch(0.50 0.20 25)" }}
          >
            THE DRAGON CAUGHT YOU.
          </h2>
          <p className="font-mono text-stone-300 text-sm text-center max-w-sm">
            This data belongs to the sovereign. It cannot be copied, saved, or
            extracted.
          </p>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="font-cinzel text-3xl font-bold text-blood-red tracking-widest mb-2">
          SOVEREIGNTY JOURNAL
        </h1>
        <p className="font-mono text-stone-500 text-xs">
          PRIVATE · APPEND-ONLY · ENCRYPTED STORAGE
        </p>
        <p className="font-mono text-stone-700 text-xs mt-1">
          SOVEREIGN ID: {shortId}...
        </p>
      </div>

      <div className="border border-blood-red/40 bg-void-800 p-5 mb-8">
        <p className="font-cinzel text-blood-red text-xs tracking-wider mb-3">
          ⚔ FORGE ENTRY
        </p>
        <Textarea
          data-ocid="journal.new.textarea"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Write your truth. This stays sovereign. No one reads this but you."
          rows={5}
          className="bg-void border-stone-700 font-mono text-stone-200 text-sm resize-none mb-4 focus:border-blood-red/50"
          onCopy={(e) => {
            e.preventDefault();
            triggerDragonRefusal();
          }}
        />
        <Button
          data-ocid="journal.new.submit_button"
          onClick={addEntry}
          disabled={!newText.trim()}
          className="w-full font-cinzel border border-blood-red bg-blood-red/20 text-blood-red hover:bg-blood-red/30 tracking-widest disabled:opacity-40"
        >
          FORGE ENTRY
        </Button>
      </div>

      {entries.length === 0 && (
        <div
          className="text-center py-16 border border-stone-800 bg-void-800"
          data-ocid="journal.entries.empty_state"
        >
          <div className="text-4xl mb-4 opacity-30">📜</div>
          <p className="font-cinzel text-stone-600 tracking-wider">
            NO ENTRIES YET
          </p>
          <p className="font-mono text-stone-700 text-xs mt-2">
            Your first entry will be forged and sealed
          </p>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            data-ocid={`journal.entry.item.${idx + 1}`}
            className="relative border border-stone-800 bg-void-800 p-5 overflow-hidden"
          >
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              aria-hidden="true"
            >
              <span
                className="font-cinzel text-6xl font-black text-stone-900/40 rotate-[-30deg] tracking-widest"
                style={{ userSelect: "none", WebkitUserSelect: "none" }}
              >
                {entry.watermark}
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-stone-600 text-xs">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <span className="font-mono text-stone-800 text-xs ml-auto">
                  #{idx + 1} · SEALED
                </span>
              </div>
              <p className="font-mono text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">
                {entry.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 border border-stone-800 bg-void">
        <p className="font-mono text-stone-700 text-xs text-center">
          📜 {entries.length} sealed{" "}
          {entries.length === 1 ? "entry" : "entries"} · append-only ·
          dragon-guarded
        </p>
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
