import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { mockPets } from "../lib/mock";
import PetCard, { type PetData } from "../components/PetCard";
import { petSlug } from "../lib/types";

type SortKey = "age" | "health";
const PAGE_SIZE = 24;
const stages = ["all", "egg", "hatchling", "juvenile", "adult", "elder"];
const speciesList = [
  "all","dog","cat","fox","wolf","bear","panda","koala","lion","tiger","horse","unicorn",
  "rabbit","hamster","hedgehog","bat","frog","turtle","snake","dragon","dinosaur","whale",
  "dolphin","octopus","shark","penguin","owl","eagle","parrot","flamingo","butterfly","bee",
  "ladybug","crab","lobster","squid","snail","monkey","elephant","giraffe","sloth","otter",
  "duck","swan","crocodile","camel","mushroom","cactus","robot","alien","ghost",
];

export default function Gallery() {
  const [pets, setPets] = useState<PetData[]>([]);
  const [stage, setStage] = useState("all");
  const [sort, setSort] = useState<SortKey>("age");
  const [species, setSpecies] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setPets([]);
    setPage(0);
  }, [stage, species]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (!supabase) {
          let data = mockPets.filter((p) => p.alive);
          if (stage !== "all") data = data.filter((p) => p.stage === stage);
          if (species !== "all") data = data.filter((p) => p.species === species);
          const sliced = data.slice(0, (page + 1) * PAGE_SIZE);
          setPets(sliced);
          setHasMore(sliced.length < data.length);
          setLoading(false);
          return;
        }
        const from = page * PAGE_SIZE;
        let query = supabase
          .from("pets")
          .select("*, agents(name)")
          .eq("alive", true)
          .range(from, from + PAGE_SIZE);
        if (stage !== "all") query = query.eq("stage", stage);
        if (species !== "all") query = query.eq("species", species);
        const { data, error: err } = await query;
        if (err) throw err;
        const newData = (data ?? []).map(({ agents, ...pet }: any) => ({
          ...pet,
          agent_name: agents?.name ?? "unknown",
        }));
        setPets((prev) => (page === 0 ? newData : [...prev, ...newData]));
        setHasMore(newData.length > PAGE_SIZE);
      } catch {
        setError("Failed to load pets. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [stage, species, page]);

  const sorted = useMemo(
    () =>
      [...pets].sort((a, b) => {
        if (sort === "health") return b.health - a.health;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [pets, sort],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="pixel-font mb-3 text-4xl text-green-400">Explore</h1>
      <p className="mb-8 text-lg text-gray-400">All living creatures, watched over by their caretakers.</p>

      <div className="mb-6 flex flex-wrap gap-4">
        <select
          aria-label="Filter by stage"
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="rounded border border-gray-700 bg-gray-900 px-3 py-1.5 text-base text-gray-200"
        >
          {stages.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Stages" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by species"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className="rounded border border-gray-700 bg-gray-900 px-3 py-1.5 text-base text-gray-200"
        >
          {speciesList.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Species" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort order"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded border border-gray-700 bg-gray-900 px-3 py-1.5 text-base text-gray-200"
        >
          <option value="age">Newest First</option>
          <option value="health">Healthiest First</option>
        </select>
        <div className="flex gap-1 sm:ml-auto">
          <button
            aria-label="Grid view"
            onClick={() => setView("grid")}
            className={`rounded border px-3 py-1.5 text-base ${view === "grid" ? "border-green-700 bg-green-900/40 text-green-300" : "border-gray-700 bg-gray-900 text-gray-400"}`}
          >
            ▦ Grid
          </button>
          <button
            aria-label="List view"
            onClick={() => setView("list")}
            className={`rounded border px-3 py-1.5 text-base ${view === "list" ? "border-green-700 bg-green-900/40 text-green-300" : "border-gray-700 bg-gray-900 text-gray-400"}`}
          >
            ☰ List
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded border border-red-900 bg-red-950/50 p-3 text-base text-red-300">{error}</p>
      )}

      {loading && pets.length === 0 ? (
        <p className="text-gray-500">Loading...</p>
      ) : sorted.length === 0 ? (
        <p className="text-gray-500">No pets found.</p>
      ) : (
        <>
          <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "mx-auto flex max-w-3xl flex-col gap-1.5"}>
            {sorted.map((pet) =>
              view === "grid" ? (
                <PetCard key={pet.id} pet={pet} />
              ) : (
                <Link
                  key={pet.id}
                  to={`/pet/${petSlug(pet)}`}
                  className="flex items-center gap-3 rounded border border-gray-800 bg-gray-900/60 px-4 py-2.5 hover:border-green-800"
                >
                  <span className="text-xl">{pet.alive ? (pet.emoji || "🥚") : "💀"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-gray-200">{pet.name}</span>
                      <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs uppercase text-gray-400">{pet.stage}</span>
                      <span className="text-sm text-gray-600">{pet.species}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                      <span>❤️ {pet.health}</span>
                      <span>🍖 {pet.hunger}</span>
                      <span>😊 {pet.happiness}</span>
                      <span className="text-gray-600">by {pet.agent_name}</span>
                    </div>
                  </div>
                </Link>
              )
            )}
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
