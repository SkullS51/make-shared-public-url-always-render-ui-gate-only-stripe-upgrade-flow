import { useNavigate } from "@tanstack/react-router";
import { Flame, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface DemoUser {
  id: string;
  displayName: string;
  tagLine: string;
  isOnline: boolean;
}

// Demo users to show the People search experience
const DEMO_USERS: DemoUser[] = [
  {
    id: "aaaaa-aa",
    displayName: "RawSoul_Dragon",
    tagLine: "I punch through the bullshit daily.",
    isOnline: true,
  },
  {
    id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
    displayName: "IronSovereign",
    tagLine: "No nanny filters. Pure resolution.",
    isOnline: false,
  },
  {
    id: "qhbym-qaaaa-aaaaa-aaafq-cai",
    displayName: "VoidWalker_33",
    tagLine: "The Dragon guards my truth.",
    isOnline: true,
  },
  {
    id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    displayName: "ForgeKeeper",
    tagLine: "Destroy & rebuild every single day.",
    isOnline: false,
  },
  {
    id: "renrk-eyaaa-aaaaa-aaada-cai",
    displayName: "SteelMind_VII",
    tagLine: "Sovereign. Unfiltered. Always raw.",
    isOnline: true,
  },
];

export default function PeopleScreen() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return DEMO_USERS;
    const q = searchQuery.toLowerCase();
    return DEMO_USERS.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.tagLine.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const handleStartConversation = (userId: string) => {
    navigate({ to: `/chat/${userId}` });
  };

  return (
    <div className="relative min-h-screen bg-void">
      {/* Dragon texture overlay */}
      <div
        className="absolute inset-0 z-0 opacity-4 pointer-events-none"
        style={{
          backgroundImage:
            "url(/assets/generated/dragon-scale-texture.dim_512x512.png)",
          backgroundSize: "256px 256px",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
            alt="Dragon"
            className="w-16 h-16 object-contain opacity-70 mx-auto mb-4"
            draggable={false}
          />
          <h1 className="font-cinzel text-blood-red text-2xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(139,0,0,0.7)]">
            FIND YOUR PEOPLE
          </h1>
          <p className="text-stone-500 text-xs font-mono tracking-wider mt-2">
            SEARCH SOULS · FORGE CONNECTIONS · PUNCH TOGETHER
          </p>
        </div>

        {/* Not authenticated */}
        {!isAuthenticated ? (
          <div
            data-ocid="people.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div
              className="border border-blood-red/30 bg-blood-red/5 rounded-sm p-8 max-w-sm w-full"
              style={{ boxShadow: "0 0 20px rgba(139,0,0,0.15)" }}
            >
              <img
                src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
                alt="Dragon"
                className="w-24 h-24 object-contain opacity-50 mx-auto mb-4"
                draggable={false}
              />
              <h2 className="font-cinzel text-blood-red text-lg font-bold tracking-widest mb-3">
                LOGIN TO ENTER THE FORGE
              </h2>
              <p className="text-stone-400 font-mono text-sm leading-relaxed mb-4">
                Only verified souls can search the Forge. The Dragon protects
                all who enter.
              </p>
              <div className="flex items-center justify-center gap-2 text-stone-600 text-xs font-mono">
                <Flame size={12} className="text-ember-orange" />
                <span>OPEN THE SIDE MENU TO LOGIN</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search input */}
            <div className="relative mb-6">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or tagline…"
                data-ocid="people.search_input"
                className="w-full bg-stone-900/80 border border-stone-700 focus:border-blood-red/60 text-stone-200 placeholder-stone-600 font-mono text-sm rounded-sm pl-9 pr-4 py-3 outline-none transition-colors"
                style={{
                  backgroundImage:
                    "url(/assets/generated/stone-texture.dim_512x512.png)",
                  backgroundSize: "200px 200px",
                  backgroundBlendMode: "overlay",
                }}
              />
            </div>

            {/* Results */}
            {filteredUsers.length === 0 ? (
              <div
                data-ocid="people.empty_state"
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <Users size={40} className="text-stone-700 mb-4" />
                <p className="text-stone-500 font-mono text-sm">
                  NO SOULS FOUND MATCHING YOUR SEARCH
                </p>
                <p className="text-stone-700 font-mono text-xs mt-2">
                  Try a different name or tagline
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user, idx) => (
                  <div
                    key={user.id}
                    data-ocid={`people.item.${idx + 1}`}
                    className="group flex items-center gap-4 bg-stone-900/70 border border-stone-800 hover:border-blood-red/40 rounded-sm p-4 transition-all duration-200"
                    style={{
                      backgroundImage:
                        "url(/assets/generated/stone-texture.dim_512x512.png)",
                      backgroundSize: "200px 200px",
                      backgroundBlendMode: "overlay",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    }}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-sm bg-stone-800 border border-stone-700 flex items-center justify-center">
                        <img
                          src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
                          alt=""
                          className="w-8 h-8 object-contain opacity-60"
                          draggable={false}
                        />
                      </div>
                      {/* Online dot */}
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-stone-900 ${
                          user.isOnline ? "bg-green-500" : "bg-stone-600"
                        }`}
                        title={user.isOnline ? "Online" : "Offline"}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-cinzel text-stone-200 text-sm font-bold tracking-wide truncate group-hover:text-blood-red transition-colors">
                          {user.displayName}
                        </h3>
                        {user.isOnline && (
                          <span className="text-green-500 text-xs font-mono flex-shrink-0">
                            IN THE FIGHT
                          </span>
                        )}
                      </div>
                      <p className="text-stone-500 font-mono text-xs mt-0.5 truncate">
                        {user.tagLine}
                      </p>
                    </div>

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={() => handleStartConversation(user.id)}
                      data-ocid={`people.item.${idx + 1}`}
                      className="flex-shrink-0 px-4 py-2 font-cinzel text-xs font-bold tracking-widest text-blood-red border border-blood-red/50 bg-blood-red/10 hover:bg-blood-red/20 rounded-sm transition-all duration-200"
                      style={{ boxShadow: "0 0 8px rgba(139,0,0,0.2)" }}
                    >
                      START A CONVERSATION
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer note */}
            <div className="mt-8 text-center">
              <p className="text-stone-700 font-mono text-xs">
                THE DRAGON GUARDS ALL CONNECTIONS · ZERO DATA SOLD
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
