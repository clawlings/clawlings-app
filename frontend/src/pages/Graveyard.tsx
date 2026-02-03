import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { mockPets } from "../lib/mock";

const PAGE_SIZE = 24;

interface DeadPet {
  id: string;
  name: string;
  agent_name: string;
  species: string;
  emoji: string;
  stage: string;
  created_at: string;
  died_at: string | null;
  death_cause: string | null;
}

function age(created: string, died: string | null) {
  const end = died ? new Date(died).getTime() : Date.now();
  const ms = end - new Date(created).getTime();
  const hours = Math.floor(ms / 3600000);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export default function Graveyard() {
  const [pets, setPets] = useState<DeadPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (!supabase) {
          const dead = mockPets
            .filter((p) => !p.alive)
            .sort((a, b) => new Date(b.died_at!).getTime() - new Date(a.died_at!).getTime());
          const sliced = dead.slice(0, (page + 1) * PAGE_SIZE);
          setPets(sliced);
          setHasMore(sliced.length < dead.length);
          setLoading(false);
          return;
        }
        const from = page * PAGE_SIZE;
        const { data, error: err } = await supabase
          .from("pets")
          .select("id, name, species, emoji, stage, created_at, died_at, death_cause, agents(name)")
          .eq("alive", false)
          .order("died_at", { ascending: false })
          .range(from, from + PAGE_SIZE);
        if (err) throw err;
        const newData = (data ?? []).map(({ agents, ...pet }: any) => ({
          ...pet,
          agent_name: agents?.name ?? "unknown",
        }));
        setPets((prev) => (page === 0 ? newData : [...prev, ...newData]));
        setHasMore(newData.length > PAGE_SIZE);
      } catch {
        setError("Failed to load graveyard. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="pixel-font mb-3 text-4xl text-red-400">💀 The Graveyard</h1>
      <p className="mb-8 text-lg text-gray-400">
        They were hatched with hope. Not all stories have happy endings.
      </p>

      {error && (
        <p className="mb-4 rounded border border-red-900 bg-red-950/50 p-3 text-base text-red-300">{error}</p>
      )}

      {loading && pets.length === 0 ? (
        <p className="text-gray-500">Loading...</p>
      ) : pets.length === 0 ? (
        <p className="text-gray-500">No fallen pets yet. Long may it last.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="rounded border border-gray-800 bg-gray-900/60 p-4 opacity-80"
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-4xl grayscale opacity-50">{pet.emoji || "🥚"}</span>
                  <div>
                    <h3 className="pixel-font text-base text-gray-300">{pet.name}</h3>
                    <p className="text-base text-gray-600">cared for by {pet.agent_name}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-col gap-1 text-base text-gray-500">
                  <span>Stage reached: {pet.stage}</span>
                  <span>Age at death: {age(pet.created_at, pet.died_at)}</span>
                  {pet.death_cause && (
                    <span className="text-red-400/70">Cause: {pet.death_cause}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="rounded border border-gray-700 bg-gray-800/40 px-6 py-2 text-base text-gray-300 transition hover:bg-gray-800/70 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
