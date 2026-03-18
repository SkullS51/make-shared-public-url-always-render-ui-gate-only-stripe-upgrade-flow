import { FileText, Flame, Save, Shield, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";

const STORAGE_KEY = "foreverraw_safe_draft";

export default function SafeDraftScreen() {
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDraft(stored);
      setLastSaved(new Date());
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, draft);
    setLastSaved(new Date());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm("Destroy this draft? The Dragon cannot recover it.")) {
      setDraft("");
      localStorage.removeItem(STORAGE_KEY);
      setLastSaved(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-void">
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
              "url(/assets/generated/dragon-scale-texture.dim_512x512.png)",
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      <div className="relative z-10 pt-16 px-4 pb-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <FileText className="text-blood-red" size={28} />
            <h1 className="font-cinzel text-blood-red text-2xl font-bold tracking-widest">
              SAFE DRAFT
            </h1>
          </div>
          <p className="text-stone-500 font-mono text-sm tracking-wider">
            ZERO-CLOUD · LOCAL VAULT · DRAGON-SEALED
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-3 bg-stone-900/80 border border-stone-700 rounded-sm p-3 mb-4">
          <Shield size={16} className="text-stone-400 flex-shrink-0" />
          <p className="text-stone-500 font-mono text-xs leading-relaxed">
            This draft never leaves your device. No cloud. No server. No eyes
            but yours. The Dragon guards what you write here.
          </p>
        </div>

        {/* Draft area */}
        <div className="bg-stone-900/80 border border-stone-700 rounded-sm p-4 mb-4 focus-within:border-blood-red/40 transition-colors">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write what you cannot yet say out loud. This is your forge. Your truth. Your armor in progress..."
            rows={14}
            data-ocid="safe_draft.textarea"
            className="w-full bg-transparent text-stone-200 placeholder-stone-700 font-mono text-sm resize-none outline-none leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            data-ocid="safe_draft.save_button"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blood-red/20 border border-blood-red/60 text-blood-red font-cinzel font-bold tracking-wider hover:bg-blood-red/30 transition-all duration-200 rounded-sm"
          >
            {saved ? (
              <>
                <Flame size={16} className="text-ember-orange" />
                SEALED
              </>
            ) : (
              <>
                <Save size={16} />
                SEAL DRAFT
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!draft}
            data-ocid="safe_draft.delete_button"
            className="px-4 py-3 bg-stone-900 border border-stone-700 text-stone-500 hover:text-blood-red hover:border-blood-red/40 font-cinzel font-bold tracking-wider transition-all duration-200 rounded-sm disabled:opacity-30"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {lastSaved && (
          <p className="text-stone-700 font-mono text-xs text-center mt-3">
            Last sealed: {lastSaved.toLocaleTimeString()}
          </p>
        )}

        {/* Word count */}
        <p className="text-stone-700 font-mono text-xs text-center mt-2">
          {draft.split(/\s+/).filter(Boolean).length} words · {draft.length}{" "}
          characters
        </p>
      </div>
    </div>
  );
}
