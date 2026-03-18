import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useState } from "react";

interface FMESIssue {
  id: string;
  title: string;
  description: string;
  progress: number;
  milestones: string[];
  completedMilestones: string[];
  archived: boolean;
  createdAt: string;
  resolvedAt?: string;
}

const GENERIC_PHRASES = [
  "good work",
  "how does that make you feel",
  "that sounds hard",
  "i understand",
  "that must be difficult",
  "tell me more",
  "very good",
  "you're doing great",
  "keep it up",
];

function loadIssues(): FMESIssue[] {
  try {
    return JSON.parse(localStorage.getItem("fmes-issues") || "[]");
  } catch {
    return [];
  }
}

function saveIssues(issues: FMESIssue[]) {
  localStorage.setItem("fmes-issues", JSON.stringify(issues));
}

function getTodayKey() {
  return `fmes-nudge-${new Date().toISOString().slice(0, 10)}`;
}

function loadNudge(): string {
  return localStorage.getItem(getTodayKey()) || "";
}

function saveNudge(val: string) {
  localStorage.setItem(getTodayKey(), val);
}

function checkFMES(note: string): string[] {
  const lower = note.toLowerCase();
  return GENERIC_PHRASES.filter((phrase) => lower.includes(phrase));
}

export default function ResolutionTracker() {
  const [issues, setIssues] = useState<FMESIssue[]>(loadIssues);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [nudge, setNudge] = useState(loadNudge);
  const [nudgeSaved, setNudgeSaved] = useState(false);
  const [fmesNote, setFmesNote] = useState("");
  const [fmesFlags, setFmesFlags] = useState<string[]>([]);
  const [victoryIssueId, setVictoryIssueId] = useState<string | null>(null);

  const persist = useCallback((updated: FMESIssue[]) => {
    setIssues(updated);
    saveIssues(updated);
  }, []);

  const addIssue = () => {
    if (!newTitle.trim()) return;
    const issue: FMESIssue = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      description: newDesc.trim(),
      progress: 0,
      milestones: [],
      completedMilestones: [],
      archived: false,
      createdAt: new Date().toISOString(),
    };
    persist([...issues, issue]);
    setNewTitle("");
    setNewDesc("");
    setShowAdd(false);
  };

  const updateProgress = (id: string, value: number) => {
    const updated = issues.map((issue) => {
      if (issue.id !== id) return issue;
      if (value >= 100 && !issue.archived) {
        setVictoryIssueId(id);
      }
      return { ...issue, progress: value };
    });
    persist(updated);
  };

  const archiveIssue = (id: string) => {
    const updated = issues.map((issue) =>
      issue.id === id
        ? { ...issue, archived: true, resolvedAt: new Date().toISOString() }
        : issue,
    );
    persist(updated);
    setVictoryIssueId(null);
  };

  const saveNudgeEntry = () => {
    saveNudge(nudge);
    setNudgeSaved(true);
    setTimeout(() => setNudgeSaved(false), 2000);
  };

  const checkNote = () => {
    setFmesFlags(checkFMES(fmesNote));
  };

  const active = issues.filter((i) => !i.archived);
  const archived = issues.filter((i) => i.archived);

  return (
    <div className="min-h-screen bg-void text-stone-200 px-4 py-6 max-w-3xl mx-auto">
      {/* Victory Overlay */}
      {victoryIssueId && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void/95"
          style={{ boxShadow: "inset 0 0 100px oklch(0.45 0.2 25 / 0.5)" }}
          data-ocid="resolution.victory.modal"
        >
          <div
            className="text-8xl mb-6 animate-bounce"
            style={{ filter: "drop-shadow(0 0 20px oklch(0.65 0.18 45))" }}
          >
            🐉
          </div>
          <h2
            className="font-cinzel text-3xl font-black text-blood-red tracking-widest text-center mb-4"
            style={{ textShadow: "0 0 30px oklch(0.50 0.20 25)" }}
          >
            WAR OVER
          </h2>
          <p
            className="font-cinzel text-xl text-ember-orange tracking-widest text-center mb-8"
            style={{ textShadow: "0 0 20px oklch(0.65 0.18 45)" }}
          >
            RESOLUTION ACHIEVED
          </p>
          <p className="font-mono text-stone-400 text-sm mb-8 text-center max-w-sm">
            This battle is over. The dragon seals it forever.
          </p>
          <Button
            data-ocid="resolution.victory.confirm_button"
            onClick={() => archiveIssue(victoryIssueId)}
            className="font-cinzel px-10 py-4 text-lg border-2 border-ember-orange bg-ember-orange/20 text-ember-orange hover:bg-ember-orange/30 tracking-widest"
          >
            SEAL THE ARCHIVE
          </Button>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="font-cinzel text-3xl font-bold text-blood-red tracking-widest mb-2">
          RESOLUTION ENGINE
        </h1>
        <p className="font-mono text-stone-500 text-sm">
          FMES · 40 YEARS OF STRUGGLE → YOUR SHORTCUT
        </p>
      </div>

      {/* Daily Nudge */}
      <div
        className="border border-ember-orange/50 bg-void-800 p-5 mb-8"
        style={{ boxShadow: "0 0 20px oklch(0.65 0.18 45 / 0.1)" }}
      >
        <p className="font-cinzel text-ember-orange text-sm tracking-wider mb-3">
          🔥 DAILY FORWARD STEP
        </p>
        <p className="font-mono text-stone-300 text-sm mb-3">
          What's one step closer to the end of the tunnel today?
        </p>
        <Textarea
          data-ocid="resolution.nudge.textarea"
          value={nudge}
          onChange={(e) => setNudge(e.target.value)}
          placeholder="Today I will..."
          rows={2}
          className="bg-void border-stone-700 font-mono text-stone-200 text-sm resize-none mb-3 focus:border-ember-orange/60"
        />
        <Button
          data-ocid="resolution.nudge.save_button"
          onClick={saveNudgeEntry}
          disabled={!nudge.trim()}
          className="font-cinzel text-xs border border-ember-orange/60 bg-ember-orange/10 text-ember-orange hover:bg-ember-orange/20 tracking-wider disabled:opacity-40"
        >
          {nudgeSaved ? "SAVED ✓" : "LOG STEP"}
        </Button>
      </div>

      {/* Active Issues */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-cinzel text-blood-red tracking-widest text-lg">
            ACTIVE BATTLES ({active.length})
          </h2>
          <Button
            data-ocid="resolution.add.open_modal_button"
            onClick={() => setShowAdd(!showAdd)}
            className="font-cinzel text-xs border border-blood-red/60 bg-blood-red/10 text-blood-red hover:bg-blood-red/20 tracking-wider"
          >
            + ADD ISSUE
          </Button>
        </div>

        {showAdd && (
          <div
            className="border border-stone-700 bg-void-800 p-5 mb-4"
            data-ocid="resolution.add.panel"
          >
            <Input
              data-ocid="resolution.add.title.input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Issue title (e.g. 'Childhood abandonment wound')"
              className="bg-void border-stone-700 font-mono text-stone-200 text-sm mb-3 focus:border-blood-red/60"
            />
            <Textarea
              data-ocid="resolution.add.description.textarea"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description — what is this battle about?"
              rows={2}
              className="bg-void border-stone-700 font-mono text-stone-200 text-sm resize-none mb-3 focus:border-blood-red/60"
            />
            <div className="flex gap-3">
              <Button
                data-ocid="resolution.add.submit_button"
                onClick={addIssue}
                disabled={!newTitle.trim()}
                className="font-cinzel text-xs bg-blood-red/20 border border-blood-red text-blood-red hover:bg-blood-red/30 tracking-wider disabled:opacity-40"
              >
                FORGE ISSUE
              </Button>
              <button
                type="button"
                data-ocid="resolution.add.cancel_button"
                onClick={() => setShowAdd(false)}
                className="font-mono text-xs text-stone-600 hover:text-stone-400 transition-colors"
              >
                cancel
              </button>
            </div>
          </div>
        )}

        {active.length === 0 && (
          <div
            className="text-center py-12 border border-stone-800 bg-void-800"
            data-ocid="resolution.active.empty_state"
          >
            <p className="font-cinzel text-stone-600 tracking-wider">
              NO ACTIVE BATTLES
            </p>
            <p className="font-mono text-stone-700 text-xs mt-2">
              Add your first issue to begin tracking resolution
            </p>
          </div>
        )}

        <div className="space-y-4">
          {active.map((issue, idx) => (
            <div
              key={issue.id}
              data-ocid={`resolution.issue.card.${idx + 1}`}
              className="border border-stone-700 bg-void-800 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-cinzel text-stone-200 font-semibold tracking-wide">
                    {issue.title}
                  </h3>
                  {issue.description && (
                    <p className="font-mono text-stone-500 text-xs mt-1">
                      {issue.description}
                    </p>
                  )}
                </div>
                <span
                  className={`font-cinzel text-lg font-black ${
                    issue.progress >= 100
                      ? "text-sovereign-green"
                      : issue.progress >= 60
                        ? "text-ember-orange"
                        : "text-blood-red"
                  }`}
                >
                  {issue.progress}%
                </span>
              </div>

              <Progress value={issue.progress} className="h-2 mb-4 bg-void" />

              <div className="flex items-center gap-3">
                <span className="font-mono text-stone-600 text-xs shrink-0">
                  PROGRESS
                </span>
                <Slider
                  data-ocid={`resolution.issue.slider.${idx + 1}`}
                  value={[issue.progress]}
                  onValueChange={([v]) => updateProgress(issue.id, v)}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FMES Compliance Check */}
      <div className="border border-stone-700 bg-void-800 p-5 mb-8">
        <h2 className="font-cinzel text-stone-400 tracking-widest text-sm mb-3">
          ⚠ FMES COMPLIANCE CHECK
        </h2>
        <p className="font-mono text-stone-600 text-xs mb-3">
          Paste therapist notes. The dragon flags generic, non-client-specific
          language.
        </p>
        <Textarea
          data-ocid="resolution.fmes.textarea"
          value={fmesNote}
          onChange={(e) => setFmesNote(e.target.value)}
          placeholder="Paste session notes here..."
          rows={3}
          className="bg-void border-stone-700 font-mono text-stone-200 text-sm resize-none mb-3 focus:border-stone-600"
        />
        <Button
          data-ocid="resolution.fmes.check.button"
          onClick={checkNote}
          className="font-cinzel text-xs border border-stone-600 bg-stone-900 text-stone-300 hover:border-blood-red/50 tracking-wider"
        >
          RUN FMES CHECK
        </Button>

        {fmesFlags.length > 0 && (
          <div
            className="mt-4 border border-blood-red/50 bg-blood-red/5 p-4"
            data-ocid="resolution.fmes.error_state"
          >
            <p className="font-cinzel text-blood-red text-xs tracking-wider mb-2">
              🐉 DRAGON WARNING — GENERIC PHRASING DETECTED
            </p>
            {fmesFlags.map((flag) => (
              <p key={flag} className="font-mono text-stone-400 text-xs">
                • "{flag}"
              </p>
            ))}
            <p className="font-mono text-stone-600 text-xs mt-2">
              These phrases are non-specific. Demand client-centered resolution
              language.
            </p>
          </div>
        )}
        {fmesNote && fmesFlags.length === 0 && (
          <div
            className="mt-4 border border-sovereign-green/50 bg-sovereign-green/5 p-4"
            data-ocid="resolution.fmes.success_state"
          >
            <p className="font-cinzel text-sovereign-green text-xs tracking-wider">
              ✓ FMES COMPLIANT — No generic phrasing detected
            </p>
          </div>
        )}
      </div>

      {/* Archived Issues */}
      {archived.length > 0 && (
        <div className="mb-8">
          <h2 className="font-cinzel text-stone-600 tracking-widest text-sm mb-4">
            SEALED ARCHIVES — WARS WON ({archived.length})
          </h2>
          <div className="space-y-3">
            {archived.map((issue, idx) => (
              <div
                key={issue.id}
                data-ocid={`resolution.archive.item.${idx + 1}`}
                className="border border-amber-glow/30 bg-void p-4"
                style={{ boxShadow: "0 0 10px oklch(0.72 0.18 55 / 0.1)" }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel text-amber-glow text-sm font-semibold">
                    {issue.title}
                  </h3>
                  <span className="font-mono text-stone-600 text-xs">
                    Resolved{" "}
                    {new Date(issue.resolvedAt || "").toLocaleDateString()}
                  </span>
                </div>
                <p className="font-mono text-stone-600 text-xs mt-1">
                  100% — WAR OVER ✓
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
