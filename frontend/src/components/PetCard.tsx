import { Link } from "react-router-dom";
import StatBar from "./StatBar";
import { petSlug, isSleeping, type PetData } from "../lib/types";

export type { PetData };

const stageBadgeColor: Record<string, string> = {
  egg: "bg-gray-600",
  hatchling: "bg-yellow-700",
  juvenile: "bg-green-700",
  adult: "bg-blue-700",
  elder: "bg-purple-700",
};

export default function PetCard({ pet }: { pet: PetData }) {
  const sleeping = pet.alive && isSleeping(pet.sleep_offset);
  const display = pet.alive ? (pet.emoji || "🥚") : "💀";

  return (
    <Link
      to={`/pet/${petSlug(pet)}`}
      className="block rounded border border-gray-800 bg-gray-900 p-4 shadow-[0_0_12px_rgba(74,222,128,0.08)] transition hover:border-green-800 hover:shadow-[0_0_20px_rgba(74,222,128,0.15)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-4xl">{display}{sleeping && " 💤"}</span>
        <div className="flex items-center gap-2">
          {sleeping && (
            <span className="rounded bg-indigo-900 px-2 py-0.5 text-xs text-indigo-300">
              sleeping
            </span>
          )}
          <span
            className={`rounded px-2 py-0.5 text-sm uppercase tracking-wider text-white ${stageBadgeColor[pet.stage] ?? "bg-gray-600"}`}
          >
            {pet.stage}
          </span>
        </div>
      </div>
      <h3 className="pixel-font mb-1 text-base text-green-400">{pet.name}</h3>
      <p className="mb-1 text-sm text-gray-500">by {pet.agent_name}</p>
      {pet.bio && <p className="mb-3 text-sm italic text-gray-600">"{pet.bio}"</p>}
      {!pet.bio && <div className="mb-3" />}
      <div className="flex flex-col gap-1.5">
        <StatBar label="Health" value={pet.health} color="#4ade80" />
        <StatBar label="Hunger" value={pet.hunger} color="#facc15" />
        <StatBar label="Happy" value={pet.happiness} color="#f472b6" />
      </div>
    </Link>
  );
}
