import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  Upload,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// Verification status is stored locally for now (backend verification pipeline is out of scope)
type VerificationStatus = "none" | "pending" | "approved" | "rejected";

function getStoredVerificationStatus(principalId: string): VerificationStatus {
  try {
    const stored = localStorage.getItem(`verification_status_${principalId}`);
    return (stored as VerificationStatus) || "none";
  } catch {
    return "none";
  }
}

function setStoredVerificationStatus(
  principalId: string,
  status: VerificationStatus,
) {
  try {
    localStorage.setItem(`verification_status_${principalId}`, status);
  } catch {
    // ignore
  }
}

export default function IdentityVerification() {
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() ?? "";
  const [status, setStatus] = useState<VerificationStatus>(() =>
    principalId ? getStoredVerificationStatus(principalId) : "none",
  );
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!identity) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Simulate upload delay (actual backend pipeline is out of scope)
    await new Promise((r) => setTimeout(r, 1500));
    setUploading(false);
    setUploadDone(true);
    const newStatus: VerificationStatus = "pending";
    setStatus(newStatus);
    setStoredVerificationStatus(principalId, newStatus);
    e.target.value = "";
  };

  const statusConfig: Record<
    VerificationStatus,
    { icon: React.ReactNode; label: string; color: string; description: string }
  > = {
    none: {
      icon: <Shield size={16} />,
      label: "NOT VERIFIED",
      color: "text-stone-500",
      description: "Submit a selfie or ID to earn the Trusted Dragon badge.",
    },
    pending: {
      icon: <Clock size={16} />,
      label: "PENDING REVIEW",
      color: "text-ember-orange",
      description: "Your verification is under review by the Dragon Council.",
    },
    approved: {
      icon: <CheckCircle size={16} />,
      label: "TRUSTED DRAGON",
      color: "text-green-500",
      description: "You are a verified Trusted Dragon. Your badge is active.",
    },
    rejected: {
      icon: <AlertTriangle size={16} />,
      label: "REJECTED",
      color: "text-blood-red",
      description: "Verification was rejected. You may resubmit.",
    },
  };

  const current = statusConfig[status];

  return (
    <div className="border border-stone-800 rounded-sm overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-stone-900/60 hover:bg-stone-900/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`${current.color}`}>{current.icon}</span>
          <span className="font-cinzel text-xs tracking-widest text-stone-300">
            DEEPER VERIFICATION
          </span>
          <span className={`font-mono text-xs ${current.color}`}>
            · {current.label}
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={14} className="text-stone-600" />
        ) : (
          <ChevronDown size={14} className="text-stone-600" />
        )}
      </button>

      {expanded && (
        <div className="px-4 py-4 bg-stone-950/60 space-y-4">
          {/* Status description */}
          <p className="text-stone-400 font-mono text-xs leading-relaxed">
            {current.description}
          </p>

          {/* Benefits */}
          {status === "none" || status === "rejected" ? (
            <div className="space-y-2">
              <p className="text-stone-500 font-mono text-xs tracking-wider">
                WHAT YOU UNLOCK:
              </p>
              <ul className="space-y-1">
                {[
                  "🐉 Trusted Dragon badge in chat",
                  "⚡ Priority support from the Dragon Council",
                  "🔒 Enhanced account protection",
                  "🛡️ Verified identity shield",
                ].map((benefit) => (
                  <li
                    key={benefit}
                    className="text-stone-400 font-mono text-xs flex items-start gap-2"
                  >
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Privacy note */}
              <div className="mt-3 p-3 border border-stone-800 rounded-sm bg-stone-900/40">
                <p className="text-stone-500 font-mono text-xs leading-relaxed">
                  🔐 We don't sell your data. We just make sure the Dragon knows
                  who's who so real people stay safe.
                </p>
              </div>

              {/* Upload button */}
              {!uploadDone && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-cinzel text-xs tracking-widest font-bold transition-all duration-200 rounded-sm border border-ember-orange/50 bg-ember-orange/10 hover:bg-ember-orange/20 text-ember-orange disabled:opacity-50 mt-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-3 h-3 border border-ember-orange border-t-transparent rounded-full animate-spin" />
                      UPLOADING...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      SUBMIT SELFIE OR ID
                    </>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : null}

          {status === "pending" && (
            <div className="flex items-center gap-2 text-ember-orange font-mono text-xs">
              <Clock size={12} />
              <span>Estimated review time: 24–48 hours</span>
            </div>
          )}

          {status === "approved" && (
            <div className="flex items-center gap-2 text-green-500 font-mono text-xs">
              <CheckCircle size={12} />
              <span>Trusted Dragon badge is active in all chats</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
