import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { EVENTS_CACHE_TAG } from "@/lib/event-content";
import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

async function fetchEvents() {
  const supabase = createClient<Database>(getSupabaseUrl(), getSupabasePublicKey(), {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true, nullsFirst: true });

  if (error) throw new Error("No fue posible cargar los eventos.");
  return data;
}

// Misma estrategia que getPublishedDogs (src/lib/dogs.ts): cacheado con tag e
// invalidado desde las server actions de eventos; en desarrollo sin caché.
export const getEvents = process.env.NODE_ENV === "development"
  ? fetchEvents
  : unstable_cache(fetchEvents, ["events"], {
    tags: [EVENTS_CACHE_TAG],
    revalidate: 300,
  });
