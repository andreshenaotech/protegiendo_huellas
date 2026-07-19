import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type CreateAdminBody = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    return NextResponse.json({ error: "Sesión no autorizada." }, { status: 401 });
  }

  if (currentAdmin.role !== "superadmin") {
    return NextResponse.json({ error: "Solo la superadministradora puede crear administradores." }, { status: 403 });
  }

  let body: CreateAdminBody;
  try {
    body = await request.json() as CreateAdminBody;
  } catch {
    return NextResponse.json({ error: "Los datos enviados no son válidos." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Ingresa un correo válido." }, { status: 400 });
  }

  if (password.length < 10) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 10 caracteres." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !created.user) {
    const duplicate = authError?.code === "email_exists" || authError?.message.toLowerCase().includes("already");
    return NextResponse.json(
      { error: duplicate ? "Ya existe un usuario con ese correo." : "No fue posible crear el administrador." },
      { status: duplicate ? 409 : 400 },
    );
  }

  const { error: profileError } = await supabaseAdmin.from("admin_users").insert({
    user_id: created.user.id,
    email,
    role: "admin",
    created_by: currentAdmin.userId,
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: "No fue posible asignar los permisos administrativos." }, { status: 500 });
  }

  return NextResponse.json({ admin: { email, role: "admin" } }, { status: 201 });
}
