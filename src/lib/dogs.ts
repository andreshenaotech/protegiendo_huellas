import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { DOGS_CACHE_TAG } from "@/lib/dog-content";
import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

// Lectura pública y cacheada del catálogo. No usa cookies, así la landing se
// sirve desde caché y solo consulta Supabase al revalidar. Si Supabase falla,
// la función lanza el error para que Next conserve la última versión válida.
export const getPublishedDogs = unstable_cache(
  async () => {
    const supabase = createClient<Database>(getSupabaseUrl(), getSupabasePublicKey(), {
      auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    });
    const { data, error } = await supabase
      .from("dogs")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw new Error("No fue posible cargar los perros en adopción.");
    return data;
  },
  ["published-dogs"],
  { tags: [DOGS_CACHE_TAG], revalidate: 300 },
);
