import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { mockPets } from "../lib/mock";
import { getWatchlist, removeFromWatchlist } from "../lib/watchlist";
import PetCard from "../components/PetCard";
import type { PetData } from "../lib/types";

export default function Watchlist() {
  const [pets, setPets] = useState<PetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const ids = getWatchlist();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        setPets(mockPets.filter((p) => ids.includes(p.id)));
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("pets")
        .select("*, agents(name)")
        .in("id", ids);
      if (error) throw error;
      setPets(
        (data ?? []).map((row: any) => {
          const { agents, ...rest } = row;
          return { ...rest, agent_name: agents?.name ?? "unknown" };
        })
      );
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  }

  function handleRemove(id: string) {
    removeFromWatchlist(id);
    setPets((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return <p className="p-12 text-center text-gray-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="pixel-font mb-8 text-center text-2xl text-green-400">Watchlist</h1>

      {pets.length === 0 ? (
        <p className="text-center text-gray-500">No pets watched yet. Visit a pet's page and click Watch.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <div key={pet.id} className="relative">
              <PetCard pet={pet} />
              <button
                onClick={() => handleRemove(pet.id)}
                className="absolute top-2 right-2 rounded bg-red-900/80 px-2 py-0.5 text-xs text-red-200 hover:bg-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
