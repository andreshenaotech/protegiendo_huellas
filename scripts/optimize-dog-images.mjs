import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

// Recomprime las fotos de perros subidas antes de la optimización automática.
// Sin argumentos solo informa. Con --apply sube la versión WebP, actualiza la
// ficha y elimina el archivo original. Con --backup=<carpeta> guarda una copia
// local de cada original (y un manifest.json) antes de tocar nada; usar una
// carpeta fuera del repositorio.

const BUCKET = "dog-images";
const MAX_DIMENSION = 1600;
const QUALITY = 82;
const MIN_BYTES_TO_OPTIMIZE = 400 * 1024;

const apply = process.argv.includes("--apply");
const backupDir = process.argv.find((arg) => arg.startsWith("--backup="))?.slice("--backup=".length);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
});

const { data: dogs, error } = await supabase
  .from("dogs")
  .select("id, name, image_path")
  .not("image_path", "is", null)
  .order("id");
if (error) throw error;

console.log(`Proyecto: ${new URL(url).hostname}`);
console.log(`Modo: ${apply ? "APLICAR" : "solo lectura (usa --apply para escribir)"}`);

let optimized = 0;
let savedBytes = 0;
const failures = [];
const manifest = [];

for (const dog of dogs) {
  const { data: original, error: downloadError } = await supabase.storage.from(BUCKET).download(dog.image_path);
  if (downloadError || !original) {
    failures.push(`${dog.id} ${dog.name}: no se pudo descargar`);
    continue;
  }

  const originalBytes = original.size;

  if (backupDir) {
    const target = path.join(backupDir, ...dog.image_path.split("/"));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, Buffer.from(await original.arrayBuffer()));
    manifest.push({ id: dog.id, name: dog.name, image_path: dog.image_path, bytes: originalBytes });
    await writeFile(path.join(backupDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  }
  if (originalBytes < MIN_BYTES_TO_OPTIMIZE && dog.image_path.endsWith(".webp")) continue;

  const output = await sharp(Buffer.from(await original.arrayBuffer()))
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  if (output.length >= originalBytes) continue;

  console.log(`${dog.id} ${dog.name}: ${(originalBytes / 1e6).toFixed(2)} MB -> ${(output.length / 1e6).toFixed(2)} MB`);
  optimized += 1;
  savedBytes += originalBytes - output.length;
  if (!apply) continue;

  const newPath = `${dog.id}/${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(newPath, output, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });
  if (uploadError) {
    failures.push(`${dog.id} ${dog.name}: no se pudo subir (${uploadError.message})`);
    continue;
  }

  // Solo se actualiza si la ficha sigue apuntando al archivo original.
  const { data: updated, error: updateError } = await supabase
    .from("dogs")
    .update({ image_path: newPath })
    .eq("id", dog.id)
    .eq("image_path", dog.image_path)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    await supabase.storage.from(BUCKET).remove([newPath]);
    failures.push(`${dog.id} ${dog.name}: la ficha cambió o no se pudo actualizar`);
    continue;
  }

  const { error: removeError } = await supabase.storage.from(BUCKET).remove([dog.image_path]);
  if (removeError) failures.push(`${dog.id} ${dog.name}: optimizada, pero el original no se pudo borrar`);
}

console.log(JSON.stringify({
  dogsWithImage: dogs.length,
  optimized,
  savedMB: Number((savedBytes / 1e6).toFixed(1)),
  applied: apply,
  failures,
}, null, 2));
