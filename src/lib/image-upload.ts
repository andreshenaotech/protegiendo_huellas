import {
  DOG_IMAGE_TYPES,
  getDogImageExtension,
  MAX_DOG_IMAGE_INPUT_SIZE,
  MAX_DOG_IMAGE_SIZE,
} from "@/lib/dog-images";
import { createClient } from "@/lib/supabase/client";

// Subida de imágenes desde el navegador (perros y flyers de eventos).

const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.82;

export type UploadedImage = {
  path: string;
  width: number;
  height: number;
};

export function validateImageFile(file: File) {
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
// Devuelve también las dimensiones finales para reservar su espacio al mostrarla.
async function compressImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  let width = 0;
  let height = 0;
  try {
    const bitmap = await createImageBitmap(file);
    width = bitmap.width;
    height = bitmap.height;
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    let blob = await canvasToBlob(canvas, "image/webp");
    if (!blob || blob.type !== "image/webp") blob = await canvasToBlob(canvas, "image/jpeg");
    if (blob && blob.size < file.size) return { blob, width: canvas.width, height: canvas.height };
  } catch {
    // Formato no decodificable por el navegador: se sube tal cual.
  }
  return { blob: file, width: width || 1080, height: height || 1350 };
}

export async function uploadImage(bucket: string, ownerId: number | null, file: File): Promise<UploadedImage> {
  const { blob, width, height } = await compressImage(file);
  if (blob.size > MAX_DOG_IMAGE_SIZE) {
    throw new Error("La imagen sigue superando 5 MB después de optimizarla. Prueba con otra.");
  }

  const folder = ownerId === null ? "new" : String(ownerId);
  const path = `${folder}/${crypto.randomUUID()}.${getDogImageExtension(blob.type)}`;
  const { error } = await createClient().storage
    .from(bucket)
    .upload(path, blob, {
      // Cada ruta es única, así que el archivo nunca cambia.
      cacheControl: "31536000",
      contentType: blob.type,
      upsert: false,
    });

  if (error) throw new Error("No fue posible subir la imagen.");
  return { path, width, height };
}
