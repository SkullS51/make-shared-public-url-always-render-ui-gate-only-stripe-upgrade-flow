import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

type LinkStatus = "none" | "pending" | "connected";

interface TherapistConnection {
  name: string;
  email: string;
  code: string;
  status: LinkStatus;
}

const MOCK_CLIENTS = [
  {
    id: "1",
    name: "Warrior A",
    progress: 62,
    fmesFlags: ["that sounds hard", "good work"],
  },
  {
    id: "2",
    name: "Sovereign B",
    progress: 88,
    fmesFlags: [],
  },
];

function loadConnection(): TherapistConnection | null {
  try {
    return JSON.parse(localStorage.getItem("therapist-connection") || "null");
  } catch {
    return null;
  }
}

function saveConnection(conn: TherapistConnection | null) {
  if (conn) {
    localStorage.setItem("therapist-connection", JSON.stringify(conn));
  } else {
    localStorage.removeItem("therapist-connection");
  }
}

export default function TherapistLink() {
  const [connection, setConnection] = useState<TherapistConnection | null>(
    loadConnection,
  );
  const [tab, setTab] = useState<"client" | "dashboard">("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !code.trim()) return;
    const conn: TherapistConnection = {
      name: name.trim(),
      email: email.trim(),
      code: code.trim(),
      status: "pending",
    };
    setConnection(conn);
    saveConnection(conn);
    setSubmitted(true);
  };

  const handleDisconnect = () => {
    setConnection(null);
    saveConnection(null);
    setSubmitted(false);
    setName("");
    setEmail("");
    setCode("");
  };

  return (
    <div className="min-h-screen bg-void text-stone-200 px-4 py-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-cinzel text-3xl font-bold text-blood-red tracking-widest mb-2">
          THERAPIST LINK
        </h1>
        <p className="font-mono text-stone-500 text-sm">
          SOVEREIGN CONNECTION · ENCRYPTED CHANNEL
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border border-stone-700 mb-8">
        <button
          type="button"
          data-ocid="therapist.client.tab"
          onClick={() => setTab("client")}
          className={`flex-1 py-3 font-cinzel text-sm tracking-wider transition-all ${
            tab === "client"
              ? "bg-blood-red/20 text-blood-red border-r border-stone-700"
              : "bg-void text-stone-500 hover:text-stone-300 border-r border-stone-700"
          }`}
        >
          MY CONNECTION
        </button>
        <button
          type="button"
          data-ocid="therapist.dashboard.tab"
          onClick={() => setTab("dashboard")}
          className={`flex-1 py-3 font-cinzel text-sm tracking-wider transition-all ${
            tab === "dashboard"
              ? "bg-blood-red/20 text-blood-red"
              : "bg-void text-stone-500 hover:text-stone-300"
          }`}
        >
          THERAPIST DASHBOARD
        </button>
      </div>

      {tab === "client" && (
        <div>
          <div
            className={`p-4 border mb-6 ${
              !connection
                ? "border-stone-700 bg-void-800"
                : connection.status === "pending"
                  ? "border-ember-orange/50 bg-ember-orange/5"
                  : "border-sovereign-green/50 bg-sovereign-green/5"
            }`}
          >
            <p className="font-cinzel text-sm tracking-wider">
              {!connection && (
                <span className="text-stone-500">
                  ⚪ NO THERAPIST CONNECTED
                </span>
              )}
              {connection?.status === "pending" && (
                <span className="text-ember-orange">
                  ⏳ PENDING: {connection.name}
                </span>
              )}
              {connection?.status === "connected" && (
                <span className="text-sovereign-green">
                  ✓ CONNECTED: {connection.name}
                </span>
              )}
            </p>
            {connection && (
              <p className="font-mono text-stone-600 text-xs mt-1">
                {connection.email}
              </p>
            )}
          </div>

          {!connection && !submitted && (
            <div className="border border-stone-700 bg-void-800 p-6">
              <h2 className="font-cinzel text-stone-300 tracking-wider text-sm mb-5">
                CONNECT TO THERAPIST
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-stone-500 text-xs mb-2">
                    THERAPIST NAME
                  </p>
                  <Input
                    id="therapist-name"
                    data-ocid="therapist.name.input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    className="bg-void border-stone-700 font-mono text-stone-200 text-sm focus:border-blood-red/60"
                  />
                </div>
                <div>
                  <p className="font-mono text-stone-500 text-xs mb-2">EMAIL</p>
                  <Input
                    id="therapist-email"
                    data-ocid="therapist.email.input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="therapist@clinic.com"
                    className="bg-void border-stone-700 font-mono text-stone-200 text-sm focus:border-blood-red/60"
                  />
                </div>
                <div>
                  <p className="font-mono text-stone-500 text-xs mb-2">
                    INVITE CODE
                  </p>
                  <Input
                    id="therapist-code"
                    data-ocid="therapist.code.input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="GP-XXXX-XXXX"
                    className="bg-void border-stone-700 font-mono text-stone-200 text-sm focus:border-blood-red/60"
                  />
                </div>
                <Button
                  data-ocid="therapist.connect.submit_button"
                  onClick={handleSubmit}
                  disabled={!name.trim() || !email.trim() || !code.trim()}
                  className="w-full font-cinzel border border-blood-red bg-blood-red/20 text-blood-red hover:bg-blood-red/30 tracking-wider disabled:opacity-40"
                >
                  SEND CONNECTION REQUEST
                </Button>
              </div>
            </div>
          )}

          {submitted && connection && (
            <div
              className="border border-ember-orange/50 bg-void-800 p-6 text-center"
              data-ocid="therapist.request.success_state"
            >
              <div className="text-4xl mb-4">📨</div>
              <h3 className="font-cinzel text-ember-orange tracking-wider mb-2">
                REQUEST SENT
              </h3>
              <p className="font-mono text-stone-400 text-sm mb-1">
                Awaiting therapist approval for {connection.name}
              </p>
              <p className="font-mono text-stone-600 text-xs mb-6">
                Your connection will activate once they accept.
              </p>
              <Button
                data-ocid="therapist.disconnect.delete_button"
                onClick={handleDisconnect}
                className="font-cinzel text-xs border border-stone-600 bg-stone-900 text-stone-400 hover:border-blood-red/50 hover:text-blood-red tracking-wider"
              >
                CANCEL REQUEST
              </Button>
            </div>
          )}
        </div>
      )}

      {tab === "dashboard" && (
        <div>
          <div className="border border-stone-700 bg-void-800 p-4 mb-6">
            <p className="font-mono text-stone-500 text-xs">
              STUB · Therapist dashboard visible to connected therapist only.
              This shows your resolution progress and FMES flags.
            </p>
          </div>

          <h2 className="font-cinzel text-stone-400 tracking-widest text-sm mb-4">
            CLIENT RESOLUTION PROGRESS
          </h2>

          <div className="space-y-4">
            {MOCK_CLIENTS.map((client, idx) => (
              <div
                key={client.id}
                data-ocid={`therapist.client.card.${idx + 1}`}
                className="border border-stone-700 bg-void-800 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-cinzel text-stone-200 font-semibold">
                    {client.name}
                  </h3>
                  <span
                    className={`font-cinzel text-lg font-black ${
                      client.progress >= 80
                        ? "text-sovereign-green"
                        : client.progress >= 50
                          ? "text-ember-orange"
                          : "text-blood-red"
                    }`}
                  >
                    {client.progress}%
                  </span>
                </div>
                <Progress
                  value={client.progress}
                  className="h-2 mb-3 bg-void"
                />

                {client.fmesFlags.length > 0 && (
                  <div className="mt-3 border border-blood-red/30 bg-blood-red/5 p-3">
                    <p className="font-cinzel text-blood-red text-xs tracking-wider mb-1">
                      🐉 FMES FLAGS
                    </p>
                    {client.fmesFlags.map((flag) => (
                      <p
                        key={flag}
                        className="font-mono text-stone-500 text-xs"
                      >
                        • "{flag}"
                      </p>
                    ))}
                  </div>
                )}
                {client.fmesFlags.length === 0 && (
                  <p className="font-mono text-sovereign-green text-xs">
                    ✓ FMES Compliant
                  </p>
                )}
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
