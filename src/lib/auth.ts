import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminRole = "superadmin" | "admin";

export type CurrentAdmin = {
  userId: string;
  email: string;
  role: AdminRole;
};

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") return null;

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("email, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !admin || (admin.role !== "superadmin" && admin.role !== "admin")) {
    return null;
  }

  return {
    userId,
    email: admin.email,
    role: admin.role,
  };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
