export function petSlug(pet: { name: string; id: string }) {
  const slug = pet.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const shortId = pet.id.replace(/-/g, "").slice(0, 12);
  return `${slug}-${shortId}`;
}

export function petIdFromSlug(slug: string) {
  const hex = slug.match(/([a-f0-9]{12})$/)?.[1] ?? "";
  // Reconstruct UUID prefix: 8-4 format for .like() query
  return hex.length === 12 ? `${hex.slice(0, 8)}-${hex.slice(8, 12)}` : "";
}

export interface PetData {
  id: string;
  name: string;
  bio: string;
  species: string;
  emoji: string;
  hunger: number;
  happiness: number;
  health: number;
  stage: string;
  alive: boolean;
  agent_name: string;
  created_at: string;
  hatched_at?: string | null;
  died_at?: string | null;
  death_cause?: string | null;
}
