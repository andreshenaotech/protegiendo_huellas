"use server";

import { updateTag } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import {
  type Dog,
  type DogValues,
  DOGS_CACHE_TAG,
  normalizeDogValues,
  validateDogValues,
} from "@/lib/dog-content";
import { DOG_IMAGES_BUCKET, isValidDogImagePath } from "@/lib/dog-images";
import { createClient } from "@/lib/supabase/server";

export type DogActionResult =
  | { ok: true; dog: Dog | null }
  | { ok: false; error: string };

type SaveDogInput = {
  id: number | null;
  values: DogValues;
  // Ruta de una imagen recién subida desde el navegador.
  uploadedImagePath: string | null;
  removeImage: boolean;
};

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function removeImages(supabase: ServerClient, paths: (string | null | undefined)[]) {
  const validPaths = paths.filter((path): path is string => Boolean(path));
  if (validPaths.length === 0) return;
  const { error } = await supabase.storage.from(DOG_IMAGES_BUCKET).remove(validPaths);
  if (error) console.error("No fue posible limpiar imágenes de Storage", validPaths, error.message);
}

// Escrituras de perros. Se ejecutan en el servidor para que la fila, la
// limpieza de imágenes y la invalidación de caché no dependan de que el
// navegador siga abierto. RLS sigue siendo la autoridad final.
export async function saveDog(input: SaveDogInput): Promise<DogActionResult> {
  if (!await getCurrentAdmin()) return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const uploadedPath = input.uploadedImagePath;
  if (uploadedPath && !isValidDogImagePath(uploadedPath, input.id)) {
    return { ok: false, error: "La imagen subida no es válida." };
  }

  const supabase = await createClient();
  const fail = async (error: string): Promise<DogActionResult> => {
    await removeImages(supabase, [uploadedPath]);
    return { ok: false, error };
  };

  const values = normalizeDogValues(input.values);
  const validationError = validateDogValues(values);
  if (validationError) return fail(validationError);

  if (input.id === null) {
    const { data: dog, error } = await supabase
      .from("dogs")
      .insert({ ...values, image_path: uploadedPath })
      .select("*")
      .single();

    if (error || !dog) return fail("No fue posible agregar el perro.");
    updateTag(DOGS_CACHE_TAG);
    return { ok: true, dog };
  }

  const { data: current, error: currentError } = await supabase
    .from("dogs")
    .select("image_path")
    .eq("id", input.id)
    .maybeSingle();

  if (currentError || !current) return fail("No encontramos el perro que quieres editar.");

  const nextImagePath = uploadedPath ?? (input.removeImage ? null : current.image_path);
  const { data: dog, error } = await supabase
    .from("dogs")
    .update({ ...values, image_path: nextImagePath })
    .eq("id", input.id)
    .select("*")
    .single();

  if (error || !dog) return fail("No fue posible guardar los cambios.");

  if (current.image_path && current.image_path !== nextImagePath) {
    await removeImages(supabase, [current.image_path]);
  }
  updateTag(DOGS_CACHE_TAG);
  return { ok: true, dog };
}

export async function removeDogImage(id: number): Promise<DogActionResult> {
  if (!await getCurrentAdmin()) return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };
  const supabase = await createClient();

  const { data: current } = await supabase.from("dogs").select("image_path").eq("id", id).maybeSingle();
  const { data: dog, error } = await supabase
    .from("dogs")
    .update({ image_path: null })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !dog) return { ok: false, error: "No fue posible quitar la imagen de la ficha." };

  await removeImages(supabase, [current?.image_path]);
  updateTag(DOGS_CACHE_TAG);
  return { ok: true, dog };
}

export async function setDogAdopted(id: number, adopted: boolean): Promise<DogActionResult> {
  if (!await getCurrentAdmin()) return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };
  const supabase = await createClient();

  const { data: dog, error } = await supabase
    .from("dogs")
    .update({ adopted_at: adopted ? new Date().toISOString() : null })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !dog) {
    return { ok: false, error: adopted ? "No fue posible marcarlo como adoptado." : "No fue posible devolverlo a adopción." };
  }

  updateTag(DOGS_CACHE_TAG);
  return { ok: true, dog };
}

export async function deleteDog(id: number): Promise<DogActionResult> {
  if (!await getCurrentAdmin()) return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };
  const supabase = await createClient();

  const { data: deleted, error } = await supabase
    .from("dogs")
    .delete()
    .eq("id", id)
    .select("image_path")
    .maybeSingle();

  if (error || !deleted) return { ok: false, error: "No fue posible eliminar el perro." };

  await removeImages(supabase, [deleted.image_path]);
  updateTag(DOGS_CACHE_TAG);
  return { ok: true, dog: null };
}
