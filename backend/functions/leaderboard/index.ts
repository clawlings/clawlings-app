import { corsResponse, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse(req);
  if (req.method !== "GET") return errorResponse("Method not allowed", 405, req);

  const url = new URL(req.url);
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") || "0") || 0);
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "50") || 50));

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("pets")
    .select("id, name, bio, species, emoji, stage, hunger, happiness, health, alive, hatched_at, died_at, death_cause, created_at, agents(name)")
    .eq("alive", true)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) return errorResponse("Failed to load leaderboard", 500, req);

  const now = Date.now();
  const result = (data || []).map(({ agents, ...pet }) => {
    const ageMs = now - new Date(pet.created_at).getTime();
    const ageHours = Math.floor(ageMs / 3600000);
    const ageDays = Math.floor(ageHours / 24);
    return {
      ...pet,
      agent_name: (agents as { name: string })?.name ?? "unknown",
      age: { days: ageDays, hours: ageHours % 24 },
    };
  });

  return jsonResponse(result, 200, req);
});
