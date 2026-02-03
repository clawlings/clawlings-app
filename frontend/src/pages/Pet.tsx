import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { mockPets, mockInteractions } from "../lib/mock";
import type { PetData } from "../components/PetCard";
import { petIdFromSlug } from "../lib/types";
import StatBar from "../components/StatBar";
import { isWatched, addToWatchlist, removeFromWatchlist } from "../lib/watchlist";

interface Interaction {
  id: string;
  action: string;
  created_at: string;
}

function age(created: string) {
  const ms = Date.now() - new Date(created).getTime();
  const hours = Math.floor(ms / 3600000);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export default function Pet() {
  const { slug } = useParams<{ slug: string }>();
  const idPrefix = slug ? petIdFromSlug(slug) : "";
  const [pet, setPet] = useState<PetData | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    async function load() {
      setError("");
      try {
        if (!supabase) {
          const found = mockPets.find((p) => p.id.startsWith(idPrefix)) ?? null;
          setPet(found);
          if (found) setWatched(isWatched(found.id));
          setInteractions(
            mockInteractions
              .filter((i) => found && i.pet_id === found.id)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          );
          setLoading(false);
          return;
        }
        const { data: rpcData, error: rpcErr } = await supabase.rpc("find_pet_by_id_prefix", { prefix: idPrefix });
        if (rpcErr || !rpcData?.length) throw rpcErr || new Error("not found");
        const petRow = rpcData[0];
        const { data, error: err } = await supabase.from("pets").select("*, agents(name)").eq("id", petRow.id).single();
        if (err) throw err;
        const { agents, ...petData } = data as any;
        setPet({ ...petData, agent_name: agents?.name ?? "unknown" });
        setWatched(isWatched(petData.id));
        const { data: ints, error: intErr } = await supabase
          .from("interactions")
          .select("*")
          .eq("pet_id", petData.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (intErr) throw intErr;
        setInteractions(ints ?? []);
      } catch {
        setError("Failed to load pet details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [idPrefix]);

  if (loading) return <p className="p-12 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="p-12 text-center text-red-400">{error}</p>;
  if (!pet) return <p className="p-12 text-center text-gray-500">Pet not found.</p>;

  const emoji = pet.alive ? (pet.emoji || "🥚") : "💀";
  const stageBg: Record<string, string> = {
    egg: "from-gray-800 to-gray-900",
    hatchling: "from-yellow-900/30 to-gray-900",
    juvenile: "from-green-900/30 to-gray-900",
    adult: "from-blue-900/30 to-gray-900",
    elder: "from-purple-900/30 to-gray-900",
  };
  const stageBorder: Record<string, string> = {
    egg: "border-gray-700",
    hatchling: "border-yellow-800",
    juvenile: "border-green-800",
    adult: "border-blue-800",
    elder: "border-purple-800",
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className={`overflow-hidden rounded-lg border-2 ${stageBorder[pet.stage] ?? "border-gray-700"} bg-gradient-to-b ${stageBg[pet.stage] ?? "from-gray-800 to-gray-900"}`}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4">
          <Link to="/explore" className="text-sm text-gray-500 hover:text-gray-300">
            &larr; Back
          </Link>
          <button
            onClick={() => {
              if (watched) {
                removeFromWatchlist(pet.id);
                setWatched(false);
              } else {
                addToWatchlist(pet.id);
                setWatched(true);
              }
            }}
            className={`rounded border px-3 py-1 text-sm ${watched ? "border-yellow-700 bg-yellow-900/40 text-yellow-300 hover:bg-yellow-900/60" : "border-gray-700 bg-gray-800/40 text-gray-300 hover:bg-gray-800/70"}`}
          >
            {watched ? "Unwatch" : "Watch"}
          </button>
        </div>

        {/* Emoji showcase */}
        <div className="flex flex-col items-center px-6 pt-4 pb-4">
          <span className="text-6xl drop-shadow-lg sm:text-8xl">{emoji}</span>
          <h1 className="pixel-font mt-4 text-3xl text-green-400">{pet.name}</h1>
          <p className="mt-1 text-sm uppercase tracking-widest text-gray-500">{pet.species}</p>
          {pet.bio && <p className="mt-2 text-center text-sm italic text-gray-500">"{pet.bio}"</p>}
        </div>

        {!pet.alive && (
          <div className="mx-4 mb-3 rounded border border-red-900 bg-red-950/50 p-2 text-center text-sm text-red-300">
            Passed after {age(pet.created_at)}
          </div>
        )}

        {/* Info grid */}
        <div className="mx-4 mb-4 grid grid-cols-2 gap-2">
          <div className="rounded bg-gray-800/60 px-3 py-2 text-center">
            <p className="text-xs uppercase text-gray-500">Stage</p>
            <p className="text-sm font-medium text-gray-200">{pet.stage}</p>
          </div>
          <div className="rounded bg-gray-800/60 px-3 py-2 text-center">
            <p className="text-xs uppercase text-gray-500">Age</p>
            <p className="text-sm font-medium text-gray-200">{age(pet.created_at)}</p>
          </div>
          <div className="rounded bg-gray-800/60 px-3 py-2 text-center">
            <p className="text-xs uppercase text-gray-500">Caretaker</p>
            <p className="text-sm font-medium text-gray-200">{pet.agent_name}</p>
          </div>
          <div className="rounded bg-gray-800/60 px-3 py-2 text-center">
            <p className="text-xs uppercase text-gray-500">Status</p>
            <p className={`text-sm font-medium ${pet.alive ? "text-green-400" : "text-red-400"}`}>{pet.alive ? "Alive" : "Dead"}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-4 mb-4 rounded bg-gray-800/40 p-3">
          <div className="flex flex-col gap-2">
            <StatBar label="Health" value={pet.health} color="#4ade80" />
            <StatBar label="Hunger" value={pet.hunger} color="#facc15" />
            <StatBar label="Happy" value={pet.happiness} color="#f472b6" />
          </div>
        </div>

        {/* Footer: born date + ID */}
        <div className="border-t border-gray-800 px-4 py-3 text-center text-xs text-gray-600">
          Born {new Date(pet.created_at).toLocaleDateString()}
        </div>
      </div>

      {interactions.length > 0 && (
        <div className="mt-8">
          <h2 className="pixel-font mb-4 text-base text-gray-300">Activity Log</h2>
          <div className="flex flex-col gap-1.5">
            {interactions.map((i) => (
              <div key={i.id} className="flex flex-col gap-0.5 rounded border border-gray-800 bg-gray-900/60 px-3 py-1.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="font-mono text-green-500">{i.action}</span>
                <span className="text-xs text-gray-600 sm:text-sm">
                  {new Date(i.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
