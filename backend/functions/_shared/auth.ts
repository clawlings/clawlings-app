import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/** Hash API key with SHA-256 for storage/comparison */
export async function hashApiKey(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Validate Bearer token against agents.api_key_hash. Returns agent row or null. */
export async function authenticateAgent(
  req: Request,
): Promise<{ id: string; name: string } | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const apiKey = header.slice(7);
  if (!apiKey || apiKey.length < 16) return null;

  const keyHash = await hashApiKey(apiKey);
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("agents")
    .select("id, name")
    .eq("api_key_hash", keyHash)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
