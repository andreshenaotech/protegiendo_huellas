import { type DogActionResult, saveDog } from "@/lib/dog-actions";
import type { DogValues } from "@/lib/dog-content";
import {
  DOG_IMAGE_TYPES,
  DOG_IMAGES_BUCKET,
  getDogImageExtension,
  MAX_DOG_IMAGE_INPUT_SIZE,
  MAX_DOG_IMAGE_SIZE,
} from "@/lib/dog-images";
import { createClient } from "@/lib/supabase/client";

// Flujo compartido de edición de perros para el panel y la landing.

const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.82;

export function validateDogImageFile(file: File) {
  if (!DOG_IMAGE_TYPES.includes(file.type as (typeof DOG_IMAGE_TYPES)[number])) {
    return "La imagen debe ser JPG, PNG o WebP.";
  }
  if (file.size > MAX_DOG_IMAGE_INPUT_SIZE) {
    return "La imagen no puede superar 20 MB.";
  }
  return null;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, IMAGE_QUALITY));
}

// Redimensiona a un máximo de 1600 px y recomprime en WebP (o JPEG si el
// navegador no soporta WebP). Si algo falla se usa el archivo original.
async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    let blob = await canvasToBlob(canvas, "image/webp");
    if (!blob || blob.type !== "image/webp") blob = await canvasToBlob(canvas, "image/jpeg");
    if (blob && blob.size < file.size) return blob;
  } catch {
    // Formato no decodificable por el navegador: se sube tal cual.
  }
  return file;
}

async function uploadDogImage(dogId: number | null, file: File) {
  const image = await compressImage(file);
  if (image.size > MAX_DOG_IMAGE_SIZE) {
    throw new Error("La imagen sigue superando 5 MB después de optimizarla. Prueba con otra.");
  }

  const folder = dogId === null ? "new" : String(dogId);
  const path = `${folder}/${crypto.randomUUID()}.${getDogImageExtension(image.type)}`;
  const { error } = await createClient().storage
    .from(DOG_IMAGES_BUCKET)
    .upload(path, image, {
      // Cada ruta es única, así que el archivo nunca cambia.
      cacheControl: "31536000",
      contentType: image.type,
      upsert: false,
    });

  if (error) throw new Error("No fue posible subir la imagen.");
  return path;
}

type SubmitDogInput = {
  id: number | null;
  values: DogValues;
  imageFile: File | null;
  removeImage?: boolean;
};

export async function submitDog({ id, values, imageFile, removeImage = false }: SubmitDogInput): Promise<DogActionResult> {
  let uploadedImagePath: string | null = null;

  try {
    if (imageFile) uploadedImagePath = await uploadDogImage(id, imageFile);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No fue posible subir la imagen." };
  }

  try {
    // Si la acción rechaza el guardado, el servidor ya elimina la imagen subida.
    // Ante un error de red no se borra nada: el servidor pudo haber guardado la
    // fila y un archivo huérfano es preferible a una ficha sin imagen.
    return await saveDog({ id, values, uploadedImagePath, removeImage });
  } catch {
    return { ok: false, error: "No fue posible completar el guardado. Recarga la página y verifica los cambios." };
  }
}
