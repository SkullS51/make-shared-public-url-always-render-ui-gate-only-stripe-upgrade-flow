import { useNavigate } from "@tanstack/react-router";
import {
  Brain,
  Check,
  Flame,
  Loader2,
  MessageSquare,
  ScanLine,
  Shield,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const FREE_FEATURES = [
  "Unlimited Chat (Gut Punches)",
  "Basic Threat Scanner",
  "Safe Draft Vault",
  "System Console",
  "Dragon Protection",
];

const PRO_FEATURES = [
  "Everything in Free",
  "AI Consultant (Dragon Wisdom)",
  "Advanced Threat Analysis",
  "Full Resolution Metrics",
  "Priority Dragon Support",
  "Therapist Session Access",
  "Export & Audit Reports",
];

export default function ProAccessUpgrade() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  const handleUpgrade = async () => {
    if (!actor || !identity) return;
    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const url = await actor.createCheckoutSession(
        [
          {
            productName: "Pro Dragon Monthly",
            currency: "USD",
            quantity: BigInt(1),
            priceInCents: BigInt(999),
            productDescription: "Unlimited scans + Pro tools",
          },
        ],
        `${origin}/payment-success`,
        `${origin}/payment-failure`,
      );
      window.location.href = url;
    } catch (e: any) {
      setError(
        e?.message ||
          "Stripe not configured. Contact admin to activate payments.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-void">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/gargoyle-dragon-hero.dim_1920x1080.png"
          alt=""
          className="w-full h-full object-cover opacity-10"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void/90 via-void/70 to-void/95" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(/assets/generated/dragon-scale-texture.dim_512x512.png)",
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      <div className="relative z-10 pt-16 px-4 pb-12 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <img
            src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
            alt="Dragon"
            className="w-24 h-24 object-contain mx-auto mb-4 opacity-90"
            draggable={false}
          />
          <h1
            className="font-cinzel text-blood-red text-3xl font-bold tracking-widest mb-3"
            style={{ textShadow: "0 0 20px rgba(139,0,0,0.6)" }}
          >
            UPGRADE TO PRO
          </h1>
          <p className="text-stone-400 font-mono text-sm tracking-wider">
            UNLEASH THE FULL POWER OF THE GARGOYLE DRAGON
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Free */}
          <div className="bg-stone-900/80 border border-stone-700 rounded-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-stone-400" />
              <h2 className="font-cinzel text-stone-300 font-bold tracking-wider">
                FREE TIER
              </h2>
            </div>
            <div className="mb-4">
              <span className="font-cinzel text-stone-200 text-3xl font-bold">
                $0
              </span>
              <span className="text-stone-600 font-mono text-sm ml-2">
                /forever
              </span>
            </div>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-stone-400 font-mono text-sm"
                >
                  <Check size={14} className="text-stone-600 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div
            className="border border-blood-red/60 rounded-sm p-6 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,0,0,0.15) 0%, rgba(20,10,10,0.95) 100%)",
              boxShadow: "0 0 30px rgba(139,0,0,0.2)",
            }}
          >
            {/* Dragon scale texture */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "url(/assets/generated/dragon-scale-texture.dim_512x512.png)",
                backgroundSize: "128px 128px",
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Flame size={20} className="text-ember-orange" />
                <h2 className="font-cinzel text-blood-red font-bold tracking-wider">
                  PRO DRAGON
                </h2>
                <span className="ml-auto bg-blood-red/20 border border-blood-red/40 text-blood-red font-mono text-xs px-2 py-0.5 rounded-sm">
                  POPULAR
                </span>
              </div>
              <div className="mb-4">
                <span className="font-cinzel text-stone-200 text-3xl font-bold">
                  $9.99
                </span>
                <span className="text-stone-600 font-mono text-sm ml-2">
                  /month
                </span>
              </div>
              <ul className="space-y-2 mb-6">
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-stone-300 font-mono text-sm"
                  >
                    <Check size={14} className="text-blood-red flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {!identity ? (
                <p className="text-center text-stone-500 font-mono text-xs mb-3">
                  Login via the side menu to upgrade.
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={loading || !identity}
                className="w-full py-3 bg-blood-red border border-blood-red text-stone-100 font-cinzel font-bold tracking-widest hover:bg-blood-red/80 transition-all duration-200 rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ boxShadow: "0 0 20px rgba(139,0,0,0.4)" }}
                data-ocid="upgrade.primary_button"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Zap size={16} />
                )}
                {loading ? "FORGING..." : "FORGE YOUR POWER"}
              </button>
              {error && (
                <p className="mt-2 text-xs font-mono text-red-400 text-center">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="text-stone-600 hover:text-stone-400 font-mono text-sm transition-colors"
          >
            ← RETURN TO THE FORGE
          </button>
        </div>
      </div>
    </div>
  );
}
