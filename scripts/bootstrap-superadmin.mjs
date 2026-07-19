import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.INITIAL_ADMIN_PASSWORD;

if (!url || !publicKey || !serviceRoleKey || !email || !password) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL, la clave pública, SUPABASE_SERVICE_ROLE_KEY, INITIAL_ADMIN_EMAIL o INITIAL_ADMIN_PASSWORD.",
  );
}

if (password.length < 10) {
  throw new Error("INITIAL_ADMIN_PASSWORD debe tener al menos 10 caracteres.");
}

const serviceClient = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

const { data: usersData, error: usersError } = await serviceClient.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});

if (usersError) throw usersError;

let user = usersData.users.find((candidate) => candidate.email?.toLowerCase() === email);

if (user) {
  const { data, error } = await serviceClient.auth.admin.updateUserById(user.id, {
    email,
    email_confirm: true,
    password,
  });
  if (error || !data.user) throw error ?? new Error("No fue posible actualizar la superadmin.");
  user = data.user;
} else {
  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
  });
  if (error || !data.user) throw error ?? new Error("No fue posible crear la superadmin.");
  user = data.user;
}

const { error: profileError } = await serviceClient.from("admin_users").upsert({
  user_id: user.id,
  email,
  role: "superadmin",
  created_by: user.id,
}, { onConflict: "user_id" });

if (profileError) throw profileError;

const browserLikeClient = createClient(url, publicKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

const { error: signInError } = await browserLikeClient.auth.signInWithPassword({ email, password });
if (signInError) throw signInError;

const { data: profile, error: profileReadError } = await browserLikeClient
  .from("admin_users")
  .select("email, role")
  .single();
if (profileReadError || profile?.role !== "superadmin") {
  throw profileReadError ?? new Error("La cuenta no recibió el rol superadmin.");
}

const { count: dogCount, error: countError } = await browserLikeClient
  .from("dogs")
  .select("id", { count: "exact", head: true });
if (countError) throw countError;

await browserLikeClient.auth.signOut();

const rlsCheckName = `__RLS_CHECK_${Date.now()}__`;
const { error: anonymousInsertError } = await browserLikeClient.from("dogs").insert({
  name: rlsCheckName,
  description: "Comprobación temporal de RLS",
  age: "N/A",
  size: "N/A",
  status: "N/A",
});

if (!anonymousInsertError) {
  await serviceClient.from("dogs").delete().eq("name", rlsCheckName);
  throw new Error("La comprobación de seguridad falló: un visitante anónimo pudo insertar un perro.");
}

console.log(JSON.stringify({
  email: profile.email,
  role: profile.role,
  dogs: dogCount,
  anonymousInsertBlocked: true,
}));
