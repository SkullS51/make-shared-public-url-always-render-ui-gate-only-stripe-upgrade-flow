import { Activity, Terminal, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import GutPunchSentry from "./GutPunchSentry";

export default function ConsoleScreen() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const timestamp = () =>
      new Date().toISOString().split("T")[1].split(".")[0];
    const newLogs: string[] = [
      `[${timestamp()}] FOREVERRAW SYSTEM CONSOLE v1.0`,
      `[${timestamp()}] Initializing Gargoyle Dragon Protocol...`,
      `[${timestamp()}] ICP Network: ${actor ? "CONNECTED" : "CONNECTING..."}`,
      `[${timestamp()}] Identity: ${identity ? `${identity.getPrincipal().toString().slice(0, 20)}...` : "ANONYMOUS"}`,
      `[${timestamp()}] Encryption: AES-256 ACTIVE`,
      `[${timestamp()}] Media Protection: ARMED`,
      `[${timestamp()}] DRAGONFLIES Protocol: LOADED`,
      `[${timestamp()}] Zero-Cloud Mode: ENABLED`,
      `[${timestamp()}] Ban Detection: ACTIVE`,
      `[${timestamp()}] ─────────────────────────────────`,
      `[${timestamp()}] SYSTEM STATUS: ${actor ? "OPERATIONAL" : "INITIALIZING"}`,
    ];
    setLogs(newLogs);
    setConnected(!!actor);
  }, [actor, identity]);

  const statusItems = [
    {
      label: "ICP NETWORK",
      value: connected ? "ONLINE" : "OFFLINE",
      ok: connected,
    },
    {
      label: "IDENTITY",
      value: identity ? "AUTHENTICATED" : "ANONYMOUS",
      ok: !!identity,
    },
    { label: "ENCRYPTION", value: "AES-256", ok: true },
    { label: "MEDIA GUARD", value: "ARMED", ok: true },
    { label: "DRAGONFLIES", value: "LOADED", ok: true },
    { label: "ZERO-CLOUD", value: "ACTIVE", ok: true },
    { label: "BAN SYSTEM", value: "WATCHING", ok: true },
  ];

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
            <Terminal className="text-blood-red" size={28} />
            <h1 className="font-cinzel text-blood-red text-2xl font-bold tracking-widest">
              SYSTEM CONSOLE
            </h1>
          </div>
          <p className="text-stone-500 font-mono text-sm tracking-wider">
            DRAGON CORE · REAL-TIME STATUS
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className="bg-stone-900/80 border border-stone-800 rounded-sm p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-stone-600 font-mono text-xs tracking-wider">
                  {item.label}
                </p>
                <p
                  className={`font-mono text-sm font-bold mt-0.5 ${
                    item.ok ? "text-stone-300" : "text-blood-red"
                  }`}
                >
                  {item.value}
                </p>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${
                  item.ok ? "bg-stone-400" : "bg-blood-red"
                } animate-pulse`}
              />
            </div>
          ))}
        </div>

        {/* Terminal Log */}
        <div className="bg-black/80 border border-stone-800 rounded-sm p-4 font-mono text-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-800">
            <Activity size={12} className="text-blood-red" />
            <span className="text-stone-500 tracking-wider">SYSTEM LOG</span>
            <div className="ml-auto flex gap-1">
              <div className="w-2 h-2 rounded-full bg-blood-red/60" />
              <div className="w-2 h-2 rounded-full bg-ember-orange/60" />
              <div className="w-2 h-2 rounded-full bg-stone-600" />
            </div>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {logs.map((log) => (
              <div key={log} className="text-stone-500 leading-relaxed">
                <span className="text-stone-700">{log.split("]")[0]}]</span>
                <span
                  className={
                    log.includes("OPERATIONAL") || log.includes("CONNECTED")
                      ? "text-stone-300"
                      : ""
                  }
                >
                  {log.split("]").slice(1).join("]")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Connection indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 mb-8">
          {connected ? (
            <>
              <Wifi size={14} className="text-stone-400" />
              <span className="text-stone-500 font-mono text-xs">
                ICP MAINNET CONNECTED
              </span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-blood-red" />
              <span className="text-blood-red font-mono text-xs">
                CONNECTING TO ICP...
              </span>
            </>
          )}
        </div>

        {/* GutPunch Sentry Widget */}
        <GutPunchSentry />
      </div>
    </div>
  );
}
