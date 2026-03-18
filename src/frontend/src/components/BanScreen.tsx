import React from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetBanStatus } from "../hooks/useQueries";

export default function BanScreen() {
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal();
  const { data: banRecord } = useGetBanStatus(principalId ?? null);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black"
      style={{
        backgroundImage:
          "url(/assets/generated/gargoyle-dragon-bg.dim_1080x1920.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/85" />

      {/* Dragon scale texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(/assets/generated/dragon-scale-texture.dim_512x512.png)",
          backgroundSize: "256px 256px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-lg">
        <img
          src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
          alt="Gargoyle Dragon"
          className="w-40 h-40 object-contain mb-8 opacity-90"
          draggable={false}
        />

        <h1
          className="font-cinzel text-blood-red text-2xl md:text-3xl font-bold tracking-widest mb-6 leading-tight"
          style={{
            textShadow:
              "0 0 30px rgba(139,0,0,0.9), 0 0 60px rgba(139,0,0,0.5)",
          }}
        >
          THE DRAGON CAUGHT YOU STEALING
        </h1>

        <div className="w-24 h-px bg-blood-red/60 mb-6" />

        <p
          className="text-stone-300 font-mono text-base tracking-wider leading-relaxed"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
        >
          Account permanently removed.
        </p>

        {banRecord && (
          <div className="mt-6 p-4 border border-stone-800 rounded-sm bg-stone-950/60 text-left w-full max-w-sm">
            <p className="text-ember-orange font-mono text-xs tracking-wider mb-2">
              BAN DETAILS:
            </p>
            <p className="text-stone-500 font-mono text-xs leading-relaxed">
              Reason: <span className="text-stone-400">{banRecord.reason}</span>
            </p>
            <p className="text-stone-500 font-mono text-xs mt-1">
              Date:{" "}
              <span className="text-stone-400">
                {formatDate(banRecord.timestamp)}
              </span>
            </p>
            <p className="text-stone-500 font-mono text-xs mt-1">
              Status:{" "}
              <span className="text-blood-red">
                {banRecord.permanent ? "PERMANENT" : "TEMPORARY"}
              </span>
            </p>
          </div>
        )}

        <div className="mt-6 p-3 border border-stone-800/60 rounded-sm bg-stone-950/40 max-w-sm">
          <p className="text-stone-600 font-mono text-xs leading-relaxed">
            ⚠️ This ban is permanently tied to your Internet Identity. Creating a
            new account with the same identity will not bypass it.
          </p>
        </div>

        <p className="text-stone-600 font-mono text-xs mt-8 tracking-widest">
          FOREVERRAW · ZERO TOLERANCE · ZERO MERCY
        </p>
      </div>
    </div>
  );
}
