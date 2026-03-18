import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Lock, Shield } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsBanned } from "../hooks/useQueries";

interface MediaUploadGateProps {
  onAllowed: () => void;
  children: React.ReactNode;
}

export default function MediaUploadGate({
  onAllowed,
  children,
}: MediaUploadGateProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const [showModal, setShowModal] = useState(false);
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const principalId = identity?.getPrincipal();
  const { data: isBanned, isLoading: banLoading } = useIsBanned(
    principalId ?? null,
  );

  const handleTrigger = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent the event from triggering twice if the child button also fires
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }
    if (isBanned) {
      setShowModal(true);
      return;
    }
    onAllowed();
  };

  const handleLogin = async () => {
    try {
      await login();
      setShowModal(false);
      // After login, allow the upload
      setTimeout(() => onAllowed(), 300);
    } catch (_err) {
      // login error handled by hook
    }
  };

  return (
    <>
      {/* Render children with click interceptor */}
      <div
        role="presentation"
        tabIndex={-1}
        onClick={handleTrigger}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleTrigger(e);
        }}
        style={{ display: "contents" }}
      >
        {children}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="border border-stone-700 max-w-sm mx-auto"
          style={{
            background: "oklch(0.08 0.005 270)",
            backgroundImage:
              "url(/assets/generated/stone-texture.dim_512x512.png)",
            backgroundSize: "200px 200px",
            backgroundBlendMode: "overlay",
          }}
        >
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <img
                src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
                alt="Dragon"
                className="w-16 h-16 object-contain opacity-80"
                draggable={false}
              />
            </div>
            <DialogTitle className="font-cinzel text-blood-red text-center tracking-widest text-lg">
              {isBanned ? "ACCESS DENIED" : "THE DRAGON REQUIRES IDENTITY"}
            </DialogTitle>
            <DialogDescription className="text-stone-400 font-mono text-sm text-center leading-relaxed mt-2">
              {isBanned ? (
                <span className="text-blood-red">
                  The Dragon has permanently removed your account. You cannot
                  upload media.
                </span>
              ) : (
                <>
                  <span className="block text-stone-300 mb-3">
                    We don't sell your data. We just make sure the Dragon knows
                    who's who so real people stay safe.
                  </span>
                  <span className="block text-stone-500 text-xs">
                    Internet Identity login required to upload photos and
                    videos.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {!isBanned && (
            <div className="flex flex-col gap-3 mt-4">
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn || banLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 font-cinzel text-sm tracking-widest font-bold transition-all duration-200 rounded-sm border border-blood-red/60 bg-blood-red/20 hover:bg-blood-red/30 text-blood-red disabled:opacity-50"
                style={{ boxShadow: "0 0 15px rgba(139,0,0,0.3)" }}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    LOGIN WITH INTERNET IDENTITY
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 justify-center text-stone-600 text-xs font-mono">
                <Lock size={10} />
                <span>SECURED BY INTERNET COMPUTER · ZERO DATA SOLD</span>
              </div>
            </div>
          )}

          {isBanned && (
            <div className="mt-4 text-center">
              <p className="text-stone-600 font-mono text-xs tracking-wider">
                FOREVERRAW · ZERO TOLERANCE · ZERO MERCY
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
