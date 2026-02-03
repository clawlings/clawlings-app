import { corsResponse, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse(req);
  if (req.method !== "GET") return errorResponse("Method not allowed", 405, req);

  const url = new URL(req.url);
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") || "0") || 0);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "100") || 100));

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("pets")
    .select("id, name, bio, species, emoji, stage, hunger, happiness, health, alive, hatched_at, died_at, death_cause, created_at, agents(name)")
    .eq("alive", false)
    .order("died_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return errorResponse("Failed to load graveyard", 500, req);

  const result = (data || []).map(({ agents, ...pet }) => ({
    ...pet,
    agent_name: (agents as { name: string })?.name ?? "unknown",
  }));

  return jsonResponse(result, 200, req);
});
