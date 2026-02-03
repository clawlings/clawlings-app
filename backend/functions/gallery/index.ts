import { corsResponse, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse(req);
  if (req.method !== "GET") return errorResponse("Method not allowed", 405, req);

  const url = new URL(req.url);
  const stage = url.searchParams.get("stage");
  const sort = url.searchParams.get("sort") || "age";
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") || "0") || 0);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "100") || 100));

  const ALLOWED_STAGES = ["egg", "hatchling", "juvenile", "adult", "elder"];
  if (stage && !ALLOWED_STAGES.includes(stage)) {
    return errorResponse("Invalid stage. Allowed: " + ALLOWED_STAGES.join(", "), 400, req);
  }

  const ALLOWED_SORTS = ["age", "health"];
  if (!ALLOWED_SORTS.includes(sort)) {
    return errorResponse("Invalid sort. Allowed: " + ALLOWED_SORTS.join(", "), 400, req);
  }

  const supabase = getServiceClient();

  let query = supabase
    .from("pets")
    .select("id, name, bio, species, emoji, stage, hunger, happiness, health, alive, hatched_at, died_at, death_cause, created_at, agents(name)")
    .eq("alive", true);

  if (stage) query = query.eq("stage", stage);

  if (sort === "health") {
    query = query.order("health", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: true });
  }

  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) return errorResponse("Failed to load gallery", 500, req);

  const result = (data || []).map(({ agents, ...pet }) => ({
    ...pet,
    agent_name: (agents as { name: string })?.name ?? "unknown",
  }));

  return jsonResponse(result, 200, req);
});
