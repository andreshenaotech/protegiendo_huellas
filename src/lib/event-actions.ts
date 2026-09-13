"use server";

import { updateTag } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { EVENT_FLYERS_BUCKET, isValidImagePath } from "@/lib/dog-images";
import {
  type EventValues,
  EVENTS_CACHE_TAG,
  type FoundationEvent,
  normalizeEventValues,
  validateEventValues,
} from "@/lib/event-content";
import { createClient } from "@/lib/supabase/server";

export type EventActionResult =
  | { ok: true; event: FoundationEvent | null }
  | { ok: false; error: string };

type SaveEventInput = {
  id: number | null;
  values: EventValues;
  // Flyer recién subido desde el navegador, con sus dimensiones.
  flyer: { path: string; width: number; height: number } | null;
};

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function removeFlyers(supabase: ServerClient, paths: (string | null | undefined)[]) {
  const validPaths = paths.filter((path): path is string => Boolean(path));
  if (validPaths.length === 0) return;
  const { error } = await supabase.storage.from(EVENT_FLYERS_BUCKET).remove(validPaths);
  if (error) console.error("No fue posible limpiar flyers de Storage", validPaths, error.message);
}

const SESSION_EXPIRED = "Tu sesión expiró. Vuelve a iniciar sesión.";

// Mismo patrón que src/lib/dog-actions.ts: el navegador sube el flyer y el
// servidor escribe la fila, limpia archivos y invalida la caché pública.
export async function saveEvent(input: SaveEventInput): Promise<EventActionResult> {
  if (!await getCurrentAdmin()) return { ok: false, error: SESSION_EXPIRED };

  const flyer = input.flyer;
  if (flyer && (!isValidImagePath(flyer.path, input.id) || flyer.width <= 0 || flyer.height <= 0)) {
    return { ok: false, error: "El flyer subido no es válido." };
  }

  const supabase = await createClient();
  const fail = async (error: string): Promise<EventActionResult> => {
    await removeFlyers(supabase, [flyer?.path]);
    return { ok: false, error };
  };

  const values = normalizeEventValues(input.values);
  const validationError = validateEventValues(values);
  if (validationError) return fail(validationError);

  const row = {
    title: values.title,
    description: values.description || null,
    event_date: values.eventDate,
    // Solo horas y minutos: el navegador puede enviar segundos (HH:MM:SS).
    event_time: values.eventTime ? values.eventTime.slice(0, 5) : null,
    location: values.location || null,
    instagram_url: values.instagramUrl || null,
    facebook_url: values.facebookUrl || null,
    tiktok_url: values.tiktokUrl || null,
  };

  if (input.id === null) {
    if (!flyer) return fail("Sube el flyer del evento.");
    const { data: event, error } = await supabase
      .from("events")
      .insert({ ...row, flyer_path: flyer.path, flyer_width: flyer.width, flyer_height: flyer.height })
      .select("*")
      .single();

    if (error || !event) return fail("No fue posible crear el evento.");
    updateTag(EVENTS_CACHE_TAG);
    return { ok: true, event };
  }

  const { data: current, error: currentError } = await supabase
    .from("events")
    .select("flyer_path")
    .eq("id", input.id)
    .maybeSingle();

  if (currentError || !current) return fail("No encontramos el evento que quieres editar.");

  const { data: event, error } = await supabase
    .from("events")
    .update(flyer ? { ...row, flyer_path: flyer.path, flyer_width: flyer.width, flyer_height: flyer.height } : row)
    .eq("id", input.id)
    .select("*")
    .single();

  if (error || !event) return fail("No fue posible guardar los cambios del evento.");

  if (flyer && current.flyer_path !== flyer.path) await removeFlyers(supabase, [current.flyer_path]);
  updateTag(EVENTS_CACHE_TAG);
  return { ok: true, event };
}

export async function deleteEvent(id: number): Promise<EventActionResult> {
  if (!await getCurrentAdmin()) return { ok: false, error: SESSION_EXPIRED };
  const supabase = await createClient();

  const { data: deleted, error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .select("flyer_path")
    .maybeSingle();

  if (error || !deleted) return { ok: false, error: "No fue posible eliminar el evento." };

  await removeFlyers(supabase, [deleted.flyer_path]);
  updateTag(EVENTS_CACHE_TAG);
  return { ok: true, event: null };
}
