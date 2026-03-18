import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Heart, Wind } from "lucide-react";
import React, { useState, useEffect } from "react";

function getTodayKey(): string {
  const d = new Date();
  return `symbicortCheck_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface SymbicortCheckModalProps {
  onConfirmed: () => void;
}

export default function SymbicortCheckModal({
  onConfirmed,
}: SymbicortCheckModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const key = getTodayKey();
    const done = localStorage.getItem(key);
    if (!done) {
      setOpen(true);
    } else {
      onConfirmed();
    }
  }, [onConfirmed]);

  const handleConfirm = () => {
    const key = getTodayKey();
    localStorage.setItem(key, "true");
    setOpen(false);
    onConfirmed();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-sm border-ember-orange/50 bg-void"
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #111111 100%)",
          boxShadow: "0 0 30px rgba(200,80,0,0.3)",
        }}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div
          className="absolute inset-0 opacity-5 pointer-events-none rounded-lg"
          style={{
            backgroundImage:
              "url(/assets/generated/dragon-scale-texture.dim_512x512.png)",
            backgroundSize: "256px 256px",
          }}
        />

        <DialogHeader className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-ember-orange/60 bg-ember-orange/10 flex items-center justify-center">
              <Wind size={28} className="text-ember-orange" />
            </div>
          </div>
          <DialogTitle className="font-cinzel text-ember-orange text-lg tracking-widest text-center">
            PHYSICAL VITALS CHECK
          </DialogTitle>
          <DialogDescription className="sr-only">
            Daily Symbicort breathing check before Destroy & Rebuild session
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 py-4">
          <div className="border border-ember-orange/30 rounded-sm p-5 bg-stone-900/60">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart size={16} className="text-blood-red" />
              <span className="font-cinzel text-stone-300 text-sm tracking-wider">
                SYMBICORT CHECK
              </span>
            </div>
            <p className="text-stone-200 font-mono text-sm leading-relaxed text-center">
              Have you completed your Symbicort Check today?
            </p>
            <p className="text-stone-500 font-mono text-xs leading-relaxed text-center mt-3">
              Secure your physical breath before beginning the Destroy & Rebuild
              audio work.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <button
            type="button"
            onClick={handleConfirm}
            data-ocid="symbicort.confirm_button"
            className="w-full py-3 px-6 font-cinzel font-bold text-sm tracking-widest text-stone-100 rounded-sm transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.18 45) 0%, oklch(0.62 0.18 45) 100%)",
              boxShadow: "0 0 20px rgba(200,80,0,0.3)",
            }}
          >
            <CheckCircle size={16} />
            YES, I'M GOOD TO GO
          </button>
          <p className="text-center text-stone-700 font-mono text-xs mt-2">
            Confirmed once per day · Resets at midnight
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
