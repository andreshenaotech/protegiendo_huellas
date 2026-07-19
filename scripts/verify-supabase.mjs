import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.VERIFY_ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.VERIFY_ADMIN_PASSWORD;

if (!url || !publicKey || !serviceRoleKey || !adminEmail || !adminPassword) {
  throw new Error("Faltan las variables públicas, service role o las credenciales VERIFY_ADMIN_*.");
}

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};

const serviceClient = createClient(url, serviceRoleKey, clientOptions);
const publicClient = createClient(url, publicKey, clientOptions);
const adminClient = createClient(url, publicKey, clientOptions);
let temporaryDogId = null;
let temporaryImagePath = null;
let temporaryUserId = null;

try {
  const { data: migratedDogs, error: migratedDogsError } = await publicClient
    .from("dogs")
    .select("id, name, description, image_path")
    .order("id", { ascending: true });
  if (migratedDogsError) throw migratedDogsError;
  if (migratedDogs.length !== 51) throw new Error(`Se esperaban 51 perros y hay ${migratedDogs.length}.`);
  if (migratedDogs[0]?.name !== "Ámbar") throw new Error("El nombre Ámbar no conserva su codificación correcta.");
  if (!migratedDogs.some((dog) => dog.name === "Muñeco")) throw new Error("Falta Muñeco o su nombre está mal codificado.");
  if (!migratedDogs.some((dog) => dog.name === "Milú")) throw new Error("Falta Milú o su nombre está mal codificado.");
  if (migratedDogs.filter((dog) => dog.name === "Tigre").length !== 2) throw new Error("Deben existir dos perros llamados Tigre.");
  if (!migratedDogs.every((dog) => dog.description === null && dog.image_path === null)) {
    throw new Error("La migración inicial debe conservar descripciones e imágenes pendientes.");
  }

  const temporaryEmail = `rls-check-${Date.now()}@example.invalid`;
  const temporaryPassword = `RlsCheck-${crypto.randomUUID()}!`;
  const { data: temporaryUserData, error: temporaryUserError } = await serviceClient.auth.admin.createUser({
    email: temporaryEmail,
    password: temporaryPassword,
    email_confirm: true,
  });
  if (temporaryUserError || !temporaryUserData.user) throw temporaryUserError ?? new Error("No se pudo crear el usuario temporal.");
  temporaryUserId = temporaryUserData.user.id;

  const nonAdminClient = createClient(url, publicKey, clientOptions);
  const { error: nonAdminSignInError } = await nonAdminClient.auth.signInWithPassword({
    email: temporaryEmail,
    password: temporaryPassword,
  });
  if (nonAdminSignInError) throw nonAdminSignInError;
  const unauthorizedName = `__NON_ADMIN_CHECK_${Date.now()}__`;
  const { error: unauthorizedInsertError } = await nonAdminClient.from("dogs").insert({
    name: unauthorizedName,
    description: "Comprobación temporal",
    age: "N/A",
    size: "N/A",
    status: "N/A",
  });
  await nonAdminClient.auth.signOut();
  if (!unauthorizedInsertError) {
    await serviceClient.from("dogs").delete().eq("name", unauthorizedName);
    throw new Error("Un usuario autenticado sin rol admin pudo insertar un perro.");
  }
  await serviceClient.auth.admin.deleteUser(temporaryUserId);
  temporaryUserId = null;

  const { error: signInError } = await adminClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });
  if (signInError) throw signInError;

  const testName = `__CRUD_CHECK_${Date.now()}__`;
  const { data: insertedDog, error: insertError } = await adminClient
    .from("dogs")
    .insert({
      name: testName,
      description: "Descripción libre de comprobación",
      age: "2 años",
      size: "Mediano",
      status: "Castrado y vacunado",
    })
    .select("*")
    .single();
  if (insertError || !insertedDog) throw insertError ?? new Error("El admin no pudo crear un perro.");
  temporaryDogId = insertedDog.id;

  temporaryImagePath = `${temporaryDogId}/verification-${crypto.randomUUID()}.png`;
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
  const { error: uploadError } = await adminClient.storage
    .from("dog-images")
    .upload(temporaryImagePath, png, { contentType: "image/png", upsert: false });
  if (uploadError) throw uploadError;

  const { data: updatedDog, error: updateError } = await adminClient
    .from("dogs")
    .update({
      description: "Descripción libre actualizada",
      image_path: temporaryImagePath,
    })
    .eq("id", temporaryDogId)
    .select("*")
    .single();
  if (updateError || updatedDog?.image_path !== temporaryImagePath) {
    throw updateError ?? new Error("El admin no pudo editar el perro.");
  }

  const { data: publicDog, error: publicDogError } = await publicClient
    .from("dogs")
    .select("description, image_path")
    .eq("id", temporaryDogId)
    .single();
  if (publicDogError || publicDog.description !== "Descripción libre actualizada") {
    throw publicDogError ?? new Error("La landing no puede leer los cambios del perro.");
  }

  const { data: downloadedImage, error: downloadError } = await publicClient.storage
    .from("dog-images")
    .download(temporaryImagePath);
  if (downloadError || !downloadedImage || downloadedImage.size === 0) {
    throw downloadError ?? new Error("La imagen pública no se puede descargar.");
  }

  const { error: removeError } = await adminClient.storage.from("dog-images").remove([temporaryImagePath]);
  if (removeError) throw removeError;
  temporaryImagePath = null;

  const { error: deleteError } = await adminClient.from("dogs").delete().eq("id", temporaryDogId);
  if (deleteError) throw deleteError;
  temporaryDogId = null;

  const { count: finalCount, error: finalCountError } = await publicClient
    .from("dogs")
    .select("id", { count: "exact", head: true });
  if (finalCountError || finalCount !== 51) {
    throw finalCountError ?? new Error("La prueba temporal no dejó la tabla en su estado inicial.");
  }

  await adminClient.auth.signOut();
  console.log(JSON.stringify({
    migratedDogs: 51,
    accentsVerified: true,
    duplicateTigreVerified: true,
    nonAdminWriteBlocked: true,
    adminCrudVerified: true,
    storageVerified: true,
    cleanupVerified: true,
  }));
} finally {
  if (temporaryImagePath) {
    await serviceClient.storage.from("dog-images").remove([temporaryImagePath]);
  }
  if (temporaryDogId) {
    await serviceClient.from("dogs").delete().eq("id", temporaryDogId);
  }
  if (temporaryUserId) {
    await serviceClient.auth.admin.deleteUser(temporaryUserId);
  }
  await adminClient.auth.signOut();
}
