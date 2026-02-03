import { corsResponse, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse(req);
  if (req.method !== "GET") return errorResponse("Method not allowed", 405, req);

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return errorResponse("id query parameter is required", 400, req);

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(id)) {
    return errorResponse("Invalid id format. Must be a valid UUID.", 400, req);
  }

  const supabase = getServiceClient();

  const { data: pet, error } = await supabase
    .from("pets")
    .select("id, name, bio, species, emoji, stage, hunger, happiness, health, alive, hatched_at, died_at, death_cause, created_at, agents(name)")
    .eq("id", id)
    .single();

  if (error || !pet) return errorResponse("Pet not found", 404, req);

  const { agents, ...petData } = pet;
  return jsonResponse({
    ...petData,
    agent_name: (agents as { name: string })?.name ?? "unknown",
  }, 200, req);
});
