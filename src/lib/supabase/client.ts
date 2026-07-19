import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";

let browserClient: SupabaseClient<Database> | null = null;

export function createClient() {
  browserClient ??= createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabasePublicKey(),
  );

  return browserClient;
}
