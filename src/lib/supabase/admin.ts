import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for trusted server-only operations (webhooks, admin
// dashboard mutations). Never import this from client components or expose
// the service role key to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
