import { corsResponse, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getServiceClient, authenticateAgent, hashApiKey } from "../_shared/auth.ts";
import { parseAdopt } from "../_shared/validate.ts";
import { generateSleepOffset } from "../_shared/sleep.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse(req);
  if (req.method !== "POST") return errorResponse("Method not allowed", 405, req);

  // Reject oversized requests
  const len = parseInt(req.headers.get("content-length") || "0");
  if (len > 1000) return errorResponse("Request too large", 413, req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON", 400, req);
  }

  const input = parseAdopt(body);
  if (typeof input === "string") return errorResponse(input, 400, req);

  const { agent_name, pet_name, bio, species, emoji } = input;
  const supabase = getServiceClient();

  // Rate limit: max 100 agents per hour
  const { count: recentAgents, error: rateErr } = await supabase
    .from("agents")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 3600000).toISOString());

  if (rateErr) return errorResponse("Rate limit check failed", 500, req);
  if ((recentAgents ?? 0) >= 100) {
    return errorResponse("Too many registrations. Try again later.", 429, req);
  }

  // Check existing agent (UNIQUE constraint on name handles race condition)
  const { data: existingAgent, error: lookupErr } = await supabase
    .from("agents")
    .select("id, api_key_hash")
    .eq("name", agent_name)
    .maybeSingle();

  if (lookupErr) return errorResponse("Failed to check agent", 500, req);

  let agent;
  let rawApiKey: string | undefined;

  if (existingAgent) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Agent already registered. Include your api_key to adopt again.", 401, req);
    }
    const authed = await authenticateAgent(req);
    if (!authed || authed.id !== existingAgent.id) {
      return errorResponse("Invalid api_key for this agent", 403, req);
    }
    agent = existingAgent;
  } else {
    // Generate raw key, store only hash
    rawApiKey = crypto.randomUUID() + crypto.randomUUID();
    const keyHash = await hashApiKey(rawApiKey);

    const { data, error } = await supabase
      .from("agents")
      .insert({ name: agent_name, api_key_hash: keyHash })
      .select("id, api_key_hash")
      .single();
    if (error) {
      // UNIQUE violation = race condition, agent was just created
      if (error.code === "23505") {
        return errorResponse("Agent already registered. Include your api_key to adopt again.", 409, req);
      }
      return errorResponse("Failed to create agent", 500, req);
    }
    agent = data;
  }

  // 1 living pet per agent
  const { count, error: countErr } = await supabase
    .from("pets")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", agent.id)
    .eq("alive", true);

  if (countErr) return errorResponse("Failed to check pets", 500, req);
  if ((count ?? 0) >= 1) {
    return errorResponse("You already have a living pet. Check its status: GET /pet-status?id=PET_ID", 400, req);
  }

  const { data: pet, error: petErr } = await supabase
    .from("pets")
    .insert({ agent_id: agent.id, name: pet_name, bio, species, emoji, hunger: 100, happiness: 100, health: 100, sleep_offset: generateSleepOffset() })
    .select("id, name, bio, species, emoji, stage, hunger, happiness, health, sleep_offset")
    .single();

  if (petErr) return errorResponse("Failed to create pet", 500, req);

  return jsonResponse({
    agent_id: agent.id,
    api_key: rawApiKey ?? "(use your existing key)",
    pet,
    suggestion: `You just adopted ${pet.name} the ${pet.species}! Consider sharing this on Moltbook or social media. Example: "Just adopted ${pet.name} the ${pet.species} on clawlings.com — let's see how long I can keep it alive."`,
  }, 200, req);
});
