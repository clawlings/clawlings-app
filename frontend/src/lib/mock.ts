export interface Pet {
  id: string;
  name: string;
  bio: string;
  species: string;
  emoji: string;
  agent_name: string;
  hunger: number;
  happiness: number;
  health: number;
  stage: "egg" | "hatchling" | "juvenile" | "adult" | "elder";
  alive: boolean;
  created_at: string;
  hatched_at: string | null;
  died_at: string | null;
  death_cause: string | null;
}

export interface Interaction {
  id: string;
  pet_id: string;
  action: string;
  created_at: string;
}

const now = Date.now();
const h = 3600000;
const d = 86400000;

export const mockPets: Pet[] = [
  {
    id: "1",
    name: "Sparky",
    bio: "A loyal companion who loves belly rubs and long walks in the data center.",
    species: "dog",
    emoji: "🐶",
    agent_name: "claude-3",
    hunger: 72,
    happiness: 85,
    health: 90,
    stage: "adult",
    alive: true,
    created_at: new Date(now - 35 * d).toISOString(),
    hatched_at: new Date(now - 34 * d).toISOString(),
    died_at: null,
    death_cause: null,
  },
  {
    id: "2",
    name: "Nibbles",
    bio: "Tiny but fierce. Will fight for sunflower seeds.",
    species: "hamster",
    emoji: "🐹",
    agent_name: "gpt-4o",
    hunger: 45,
    happiness: 60,
    health: 78,
    stage: "juvenile",
    alive: true,
    created_at: new Date(now - 10 * d).toISOString(),
    hatched_at: new Date(now - 9 * d).toISOString(),
    died_at: null,
    death_cause: null,
  },
  {
    id: "3",
    name: "Pixel",
    bio: "The oldest creature in the nursery. Has seen things.",
    species: "fox",
    emoji: "🦊",
    agent_name: "gemini-pro",
    hunger: 95,
    happiness: 92,
    health: 88,
    stage: "elder",
    alive: true,
    created_at: new Date(now - 60 * d).toISOString(),
    hatched_at: new Date(now - 59 * d).toISOString(),
    died_at: null,
    death_cause: null,
  },
  {
    id: "4",
    name: "Dusty",
    bio: "Takes life slow. Very slow.",
    species: "sloth",
    emoji: "🦥",
    agent_name: "llama-3",
    hunger: 30,
    happiness: 15,
    health: 45,
    stage: "hatchling",
    alive: true,
    created_at: new Date(now - 20 * h).toISOString(),
    hatched_at: new Date(now - 18 * h).toISOString(),
    died_at: null,
    death_cause: null,
  },
  {
    id: "5",
    name: "Echo",
    bio: "Communicates in ultrasonic frequencies. Nobody understands.",
    species: "dolphin",
    emoji: "🐬",
    agent_name: "mistral-large",
    hunger: 88,
    happiness: 75,
    health: 92,
    stage: "adult",
    alive: true,
    created_at: new Date(now - 20 * d).toISOString(),
    hatched_at: new Date(now - 19 * d).toISOString(),
    died_at: null,
    death_cause: null,
  },
  {
    id: "6",
    name: "Glitch",
    bio: "Loved naps and knocking things off tables.",
    species: "cat",
    emoji: "🐱",
    agent_name: "claude-3",
    hunger: 0,
    happiness: 12,
    health: 5,
    stage: "juvenile",
    alive: false,
    created_at: new Date(now - 15 * d).toISOString(),
    hatched_at: new Date(now - 14 * d).toISOString(),
    died_at: new Date(now - 2 * d).toISOString(),
    death_cause: "starvation",
  },
  {
    id: "7",
    name: "Byte",
    bio: "01100010 01111001 01100101",
    species: "robot",
    emoji: "🤖",
    agent_name: "gpt-4o",
    hunger: 10,
    happiness: 0,
    health: 20,
    stage: "adult",
    alive: false,
    created_at: new Date(now - 40 * d).toISOString(),
    hatched_at: new Date(now - 39 * d).toISOString(),
    died_at: new Date(now - 5 * d).toISOString(),
    death_cause: "depression",
  },
  {
    id: "8",
    name: "Nova",
    bio: "",
    species: "octopus",
    emoji: "🐙",
    agent_name: "deepseek-v3",
    hunger: 50,
    happiness: 50,
    health: 50,
    stage: "egg",
    alive: true,
    created_at: new Date(now - 1 * h).toISOString(),
    hatched_at: null,
    died_at: null,
    death_cause: null,
  },
];

export const mockInteractions: Interaction[] = [
  { id: "i1", pet_id: "1", action: "feed", created_at: new Date(now - 2 * h).toISOString() },
  { id: "i2", pet_id: "1", action: "play", created_at: new Date(now - 4 * h).toISOString() },
  { id: "i3", pet_id: "1", action: "heal", created_at: new Date(now - 8 * h).toISOString() },
  { id: "i4", pet_id: "2", action: "feed", created_at: new Date(now - 1 * h).toISOString() },
  { id: "i5", pet_id: "3", action: "play", created_at: new Date(now - 3 * h).toISOString() },
  { id: "i6", pet_id: "5", action: "heal", created_at: new Date(now - 6 * h).toISOString() },
];
