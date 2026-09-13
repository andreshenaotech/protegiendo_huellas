import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { DOGS_CACHE_TAG } from "@/lib/dog-content";
import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

async function fetchPublishedDogs() {
  const supabase = createClient<Database>(getSupabaseUrl(), getSupabasePublicKey(), {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  const { data, error } = await supabase
    .from("dogs")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw new Error("No fue posible cargar los perros en adopción.");
  return data;
}

// Lectura pública y cacheada del catálogo. No usa cookies, así la landing se
// sirve desde caché y solo consulta Supabase al revalidar. Si Supabase falla,
// la función lanza el error para que Next conserve la última versión válida.
// En desarrollo se consulta siempre: la caché local de `next dev` puede quedar
// con datos viejos cuando la base cambia fuera de la app.
export const getPublishedDogs = process.env.NODE_ENV === "development"
  ? fetchPublishedDogs
  : unstable_cache(fetchPublishedDogs, ["published-dogs"], {
    tags: [DOGS_CACHE_TAG],
    revalidate: 300,
  });
