import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  Copy,
  Flame,
  Lock,
  LogOut,
  Save,
  Shield,
  User,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";
import { decryptText, encryptText } from "../lib/encryption";
import IdentityVerification from "./IdentityVerification";

export default function ProfileView() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [extraSomething, setExtraSomething] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  const principalId = identity?.getPrincipal().toString() ?? "";
  const isAuthenticated = !!identity;

  // Load profile and decrypt extra something field
  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setEmail(profile.email || "");

    if (profile.encryptedExtraSomething && principalId) {
      setDecrypting(true);
      decryptText(profile.encryptedExtraSomething, principalId)
        .then((decrypted) => {
          setExtraSomething(decrypted);
        })
        .finally(() => setDecrypting(false));
    } else {
      setExtraSomething("");
    }
  }, [profile, principalId]);

  const handleSave = async () => {
    if (!name.trim()) return;

    let encryptedExtraSomething: Uint8Array | undefined = undefined;
    if (extraSomething.trim() && principalId) {
      encryptedExtraSomething = await encryptText(
        extraSomething.trim(),
        principalId,
      );
    }

    await saveProfile.mutateAsync({
      name: name.trim(),
      email: email.trim() || undefined,
      stripeCustomerId: profile?.stripeCustomerId,
      encryptedExtraSomething,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(principalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="text-stone-500 hover:text-blood-red transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="font-cinzel text-blood-red text-xl font-bold tracking-widest">
              WARRIOR PROFILE
            </h1>
            <p className="text-stone-600 font-mono text-xs tracking-wider">
              FOREVERRAW IDENTITY VAULT
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Shield size={48} className="text-stone-700 mb-4" />
            <p className="text-stone-500 font-mono text-sm">
              Login to access your warrior profile
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Avatar / Dragon emblem */}
            <div className="flex flex-col items-center py-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-blood-red/40 bg-stone-900/60 flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
                    alt="Dragon"
                    className="w-16 h-16 object-contain opacity-70"
                    draggable={false}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blood-red/80 flex items-center justify-center">
                  <Flame size={12} className="text-stone-100" />
                </div>
              </div>
              {profile?.name && (
                <p className="mt-3 font-cinzel text-stone-200 text-lg font-bold tracking-wider">
                  {profile.name}
                </p>
              )}
            </div>

            {/* Profile form */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-stone-500 font-mono text-xs tracking-wider mb-1.5"
                >
                  WARRIOR NAME
                </label>
                <div className="flex items-center gap-2 bg-stone-900/60 border border-stone-700 rounded-sm px-3 py-2.5 focus-within:border-blood-red/60 transition-colors">
                  <User size={14} className="text-stone-600 flex-shrink-0" />
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your warrior name"
                    data-ocid="profile.input"
                    className="flex-1 bg-transparent text-stone-200 placeholder-stone-600 font-mono text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="block text-stone-500 font-mono text-xs tracking-wider mb-1.5"
                >
                  EMAIL (OPTIONAL)
                </label>
                <div className="flex items-center gap-2 bg-stone-900/60 border border-stone-700 rounded-sm px-3 py-2.5 focus-within:border-blood-red/60 transition-colors">
                  <Shield size={14} className="text-stone-600 flex-shrink-0" />
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    data-ocid="profile.email.input"
                    className="flex-1 bg-transparent text-stone-200 placeholder-stone-600 font-mono text-sm outline-none"
                  />
                </div>
              </div>

              {/* ── Lineage Anchor: Extra Something (Encrypted) ── */}
              <div>
                <p className="flex items-center gap-2 text-stone-500 font-mono text-xs tracking-wider mb-1.5">
                  <Lock size={12} className="text-ember-orange" />
                  EXTRA SOMETHING — ANCESTRAL LINEAGE &amp; LEGACY DATA
                  <span className="text-ember-orange text-xs">(ENCRYPTED)</span>
                </p>
                <div className="bg-stone-900/60 border border-ember-orange/30 rounded-sm px-3 py-2.5 focus-within:border-ember-orange/60 transition-colors">
                  {decrypting ? (
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-3 h-3 border border-ember-orange border-t-transparent rounded-full animate-spin" />
                      <span className="text-stone-600 font-mono text-xs">
                        Decrypting lineage data...
                      </span>
                    </div>
                  ) : (
                    <textarea
                      value={extraSomething}
                      onChange={(e) => setExtraSomething(e.target.value)}
                      placeholder="Ancestral lineage · Medicine woman lineage · King lineage · Sacred knowledge..."
                      rows={4}
                      className="w-full bg-transparent text-stone-200 placeholder-stone-700 font-mono text-sm resize-none outline-none"
                    />
                  )}
                </div>
                <p className="text-stone-700 font-mono text-xs mt-1 flex items-center gap-1">
                  <Lock size={10} className="text-stone-700" />
                  AES-256 encrypted · Only you can read this · Stored on ICP
                </p>
              </div>

              {/* Identity Verification Section */}
              <IdentityVerification />

              {/* Principal ID */}
              <div>
                <p className="block text-stone-500 font-mono text-xs tracking-wider mb-1.5">
                  INTERNET IDENTITY
                </p>
                <div className="flex items-center gap-2 bg-stone-900/40 border border-stone-800 rounded-sm px-3 py-2.5">
                  <span className="flex-1 text-stone-600 font-mono text-xs truncate">
                    {principalId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrincipal}
                    className="text-stone-600 hover:text-ember-orange transition-colors flex-shrink-0"
                    title="Copy principal ID"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <p className="text-stone-700 font-mono text-xs mt-1">
                  Your permanent Dragon identity. Tied to all bans and
                  verifications.
                </p>
              </div>
            </div>

            {/* Save button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saveProfile.isPending || !name.trim()}
              data-ocid="profile.save_button"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 font-cinzel text-sm tracking-widest font-bold transition-all duration-200 rounded-sm border border-blood-red/60 bg-blood-red/20 hover:bg-blood-red/30 text-blood-red disabled:opacity-50"
              style={{ boxShadow: "0 0 15px rgba(139,0,0,0.2)" }}
            >
              {saveProfile.isPending ? (
                <div className="w-4 h-4 border border-blood-red border-t-transparent rounded-full animate-spin" />
              ) : saved ? (
                <>
                  <Check size={16} />
                  SAVED
                </>
              ) : (
                <>
                  <Save size={16} />
                  SAVE PROFILE
                </>
              )}
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 font-cinzel text-sm tracking-widest font-bold transition-all duration-200 rounded-sm border border-stone-700 bg-stone-900/40 hover:bg-stone-900/80 text-stone-400 hover:text-stone-200"
            >
              <LogOut size={16} />
              LOGOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
