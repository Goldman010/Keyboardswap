import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase client with the service role key.
 * Called at request time (not module evaluation time) so the build succeeds
 * even before SUPABASE_SERVICE_ROLE_KEY is configured in the environment.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.",
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
