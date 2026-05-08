/**
 * Supabase client for CoachOS API (Cloudflare Workers).
 * Uses the service role key for server-side operations.
 *
 * Credentials MUST be supplied at runtime via Cloudflare Worker secrets
 * (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY). They must never be
 * hard-coded in source control.
 *
 * Call initSupabase(url, key) once per request (in Hono middleware) before
 * any route handler uses the exported `supabase` proxy.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function initSupabase(url: string | undefined, serviceRoleKey: string | undefined): void {
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase credentials. " +
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set as Cloudflare Worker secrets."
    );
  }
  _client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) {
      throw new Error(
        "Supabase client has not been initialized. " +
          "Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY Worker secrets are configured " +
          "and initSupabase() is called before any route handler runs."
      );
    }
    const value = (_client as Record<string, unknown>)[prop as string];
    return typeof value === "function" ? (value as Function).bind(_client) : value;
  },
});
