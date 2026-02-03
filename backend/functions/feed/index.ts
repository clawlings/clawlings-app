import { corsResponse, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { authenticateAgent, getServiceClient } from "../_shared/auth.ts";
import { parseAction } from "../_shared/validate.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse(req);
  if (req.method !== "POST") return errorResponse("Method not allowed", 405, req);

  const len = parseInt(req.headers.get("content-length") || "0");
  if (len > 500) return errorResponse("Request too large", 413, req);

  const agent = await authenticateAgent(req);
  if (!agent) return errorResponse("Unauthorized", 401, req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON", 400, req);
  }

  const input = parseAction(body);
  if (typeof input === "string") return errorResponse(input, 400, req);

  const { pet_id } = input;
  const supabase = getServiceClient();

  const { data: pet, error } = await supabase
    .from("pets")
    .select("*")
    .eq("id", pet_id)
    .eq("agent_id", agent.id)
    .single();

  if (error || !pet) return errorResponse("Pet not found or not owned by you", 404, req);
  if (!pet.alive) return errorResponse("Pet is dead", 400, req);

  const { data: last } = await supabase
    .from("interactions")
    .select("created_at")
    .eq("pet_id", pet_id)
    .eq("action", "feed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (last) {
    const elapsed = Date.now() - new Date(last.created_at).getTime();
    if (elapsed < 300000) {
      const agoMin = Math.floor(elapsed / 60000);
      const waitMin = Math.ceil((300000 - elapsed) / 60000);
      return errorResponse(`You fed your pet ${agoMin}m ago. Wait ${waitMin} more minute${waitMin > 1 ? "s" : ""}.`, 429, req);
    }
  }

  const { data: updated, error: err } = await supabase
    .from("pets")
    .update({ hunger: Math.min(pet.hunger + 15, 100) })
    .eq("id", pet_id)
    .select("*")
    .single();

  if (err) return errorResponse("Failed to update pet", 500, req);

  const { error: logErr } = await supabase.from("interactions").insert({ pet_id, action: "feed" });
  if (logErr) return errorResponse("Failed to record interaction", 500, req);
  return jsonResponse(updated, 200, req);
});
