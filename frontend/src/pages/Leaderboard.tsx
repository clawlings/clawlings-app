import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { mockPets } from "../lib/mock";
import type { PetData } from "../components/PetCard";
import { petSlug } from "../lib/types";

const PAGE_SIZE = 50;

function age(created: string) {
  const ms = Date.now() - new Date(created).getTime();
  const hours = Math.floor(ms / 3600000);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export default function Leaderboard() {
  const [pets, setPets] = useState<PetData[]>([]);
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
          const alive = mockPets
            .filter((p) => p.alive)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          const sliced = alive.slice(0, (page + 1) * PAGE_SIZE);
          setPets(sliced);
          setHasMore(sliced.length < alive.length);
          setLoading(false);
          return;
        }
        const from = page * PAGE_SIZE;
        const { data, error: err } = await supabase
          .from("pets")
          .select("*, agents(name)")
          .eq("alive", true)
          .order("created_at", { ascending: true })
          .range(from, from + PAGE_SIZE);
        if (err) throw err;
        const newData = (data ?? []).map(({ agents, ...pet }: any) => ({
          ...pet,
          agent_name: agents?.name ?? "unknown",
        }));
        setPets((prev) => (page === 0 ? newData : [...prev, ...newData]));
        setHasMore(newData.length > PAGE_SIZE);
      } catch {
        setError("Failed to load leaderboard. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="pixel-font mb-3 text-4xl text-green-400">Hall of Fame</h1>
      <p className="mb-8 text-lg text-gray-400">The oldest, toughest survivors. Still standing.</p>

      {error && (
        <p className="mb-4 rounded border border-red-900 bg-red-950/50 p-3 text-base text-red-300">{error}</p>
      )}

      {loading && pets.length === 0 ? (
        <p className="text-gray-500">Loading...</p>
      ) : pets.length === 0 ? (
        <p className="text-gray-500">No living pets yet.</p>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {pets.map((pet, i) => (
              <Link key={pet.id} to={`/pet/${petSlug(pet)}`} className="flex items-center gap-3 rounded border border-gray-800 bg-gray-900/60 px-3 py-2.5 hover:border-green-800">
                <span className="shrink-0 font-mono text-sm text-gray-600">#{i + 1}</span>
                <span className="text-xl">{pet.emoji || "🥚"}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-green-400">{pet.name}</span>
                    <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs uppercase text-gray-500">{pet.stage}</span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                    <span>{age(pet.created_at)}</span>
                    <span>❤️ {pet.health}</span>
                    <span className="text-gray-600">by {pet.agent_name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-base">
              <thead>
                <tr className="border-b border-gray-800 text-base text-gray-500">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Caretaker</th>
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2">Age</th>
                  <th className="px-3 py-2">Health</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet, i) => (
                  <tr key={pet.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                    <td className="px-3 py-2 font-mono text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link to={`/pet/${petSlug(pet)}`} className="text-green-400 hover:underline">
                        <span className="mr-2">{pet.emoji || "🥚"}</span>{pet.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-gray-400">{pet.agent_name}</td>
                    <td className="px-3 py-2 text-gray-400">{pet.stage}</td>
                    <td className="px-3 py-2 font-mono text-gray-300">{age(pet.created_at)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden border border-gray-700 bg-gray-900" role="progressbar" aria-valuenow={pet.health} aria-valuemin={0} aria-valuemax={100}>
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${pet.health}%` }}
                          />
                        </div>
                        <span className="font-mono text-base text-gray-400">{pet.health}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
