import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isDev = import.meta.env.DEV;

if (!supabaseUrl || !supabaseAnonKey) {
  if (isDev) {
    console.warn("[Clawlings] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — using mock data");
  } else {
    console.error("[Clawlings] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in production!");
  }
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const functionsBaseUrl = supabaseUrl
  ? `${supabaseUrl}/functions/v1`
  : "";
