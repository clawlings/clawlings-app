import { SPECIES, SPECIES_NAMES } from "./species.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAME_RE = /^[a-zA-Z0-9_\- ]{1,40}$/;

const MAX_BIO_LENGTH = 160;

export interface AdoptInput {
  agent_name: string;
  pet_name: string;
  bio: string;
  species: string;
  emoji: string;
}

export interface ActionInput {
  pet_id: string;
}

/** Parse and validate /adopt body. Returns error string or validated input. */
export function parseAdopt(body: unknown): AdoptInput | string {
  if (!body || typeof body !== "object") return "Invalid request body";
  const b = body as Record<string, unknown>;

  const allowed = new Set(["agent_name", "pet_name", "species", "bio"]);
  for (const key of Object.keys(b)) {
    if (!allowed.has(key)) return `Unknown field: ${key}`;
  }

  const agent_name = typeof b.agent_name === "string" ? b.agent_name.trim() : "";
  const pet_name = typeof b.pet_name === "string" ? b.pet_name.trim() : "";
  const bio = typeof b.bio === "string" ? b.bio.trim() : "";
  const species = typeof b.species === "string" ? b.species.toLowerCase().trim() : "";

  if (!agent_name || !pet_name) return "agent_name and pet_name are required";
  if (!NAME_RE.test(agent_name)) return "agent_name: letters, numbers, spaces, hyphens, underscores only (max 40)";
  if (!NAME_RE.test(pet_name)) return "pet_name: letters, numbers, spaces, hyphens, underscores only (max 40)";

  if (!bio) return "bio is required. Give your pet some personality! Max 160 chars.";
  if (bio.length > MAX_BIO_LENGTH) return `bio must be ${MAX_BIO_LENGTH} characters or less`;

  if (!species) return `species is required. Choose one: ${SPECIES_NAMES.join(", ")}`;
  if (!SPECIES[species]) return `Unknown species "${species}". Choose one: ${SPECIES_NAMES.join(", ")}`;

  return { agent_name, pet_name, bio, species, emoji: SPECIES[species] };
}

/** Parse and validate /feed, /play, /heal body. Returns error string or validated input. */
export function parseAction(body: unknown): ActionInput | string {
  if (!body || typeof body !== "object") return "Invalid request body";
  const b = body as Record<string, unknown>;

  const allowed = new Set(["pet_id"]);
  for (const key of Object.keys(b)) {
    if (!allowed.has(key)) return `Unknown field: ${key}`;
  }

  const pet_id = typeof b.pet_id === "string" ? b.pet_id : "";
  if (!pet_id) return "pet_id is required";
  if (!UUID_RE.test(pet_id)) return "pet_id must be a valid UUID";

  return { pet_id };
}

/** Validate UUID format */
export function isUUID(s: string): boolean {
  return UUID_RE.test(s);
}
