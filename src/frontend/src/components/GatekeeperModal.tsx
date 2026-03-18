import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Flame, Volume2 } from "lucide-react";
import React, { useState, useEffect } from "react";

const GATEKEEPER_KEY = "gatekeeperDismissed";

export default function GatekeeperModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(GATEKEEPER_KEY);
    if (!dismissed) {
      setOpen(true);
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        localStorage.setItem(GATEKEEPER_KEY, "true");
        setOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnter = () => {
    localStorage.setItem(GATEKEEPER_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleEnter}>
      <DialogContent
        className="max-w-md border-blood-red/60 bg-void"
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #111111 100%)",
          boxShadow: "0 0 40px rgba(139,0,0,0.4)",
        }}
        // Allow closing by clicking outside
        onInteractOutside={handleEnter}
        onEscapeKeyDown={handleEnter}
      >
        {/* Dragon scale texture */}
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
            <div className="w-16 h-16 rounded-full border-2 border-blood-red/60 bg-blood-red/10 flex items-center justify-center">
              <Volume2 size={28} className="text-blood-red" />
            </div>
          </div>
          <DialogTitle className="font-cinzel text-blood-red text-xl tracking-widest text-center">
            THE GATEKEEPER SPEAKS
          </DialogTitle>
          <DialogDescription className="sr-only">
            Welcome message from the Forge Gatekeeper
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 py-4">
          <div className="border border-blood-red/30 rounded-sm p-5 bg-stone-900/60">
            <p className="text-stone-200 font-mono text-sm leading-relaxed text-center">
              If 80s Metal or Hatebreed is too loud for you, the exit is behind
              you.
            </p>
            <p className="text-stone-400 font-mono text-sm leading-relaxed text-center mt-3">
              No nanny-filters here.
            </p>
            <p className="text-ember-orange font-cinzel text-base font-bold tracking-wider text-center mt-3">
              Resolution over Symptoms.
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-stone-600 font-mono text-xs">
              This is a sovereign space. Enter with intention.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleEnter}
            data-ocid="gatekeeper.confirm_button"
            className="w-full py-3 px-6 font-cinzel font-bold text-sm tracking-widest text-stone-100 rounded-sm transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.38 0.18 25) 0%, oklch(0.45 0.20 25) 100%)",
              boxShadow: "0 0 20px rgba(139,0,0,0.4)",
            }}
          >
            <Flame size={16} className="text-ember-orange" />
            ENTER THE FORGE
          </button>
          <p className="text-center text-stone-700 font-mono text-xs">
            Dismissal is permanent for this session
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
