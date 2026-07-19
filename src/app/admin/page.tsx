import type { Metadata } from "next";
import { AdminDashboard } from "@/app/admin/admin-dashboard";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Panel administrativo | Protegiendo Huellas",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data: dogs, error } = await supabase
    .from("dogs")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    throw new Error("No fue posible cargar los perros del panel administrativo.");
  }

  return <AdminDashboard admin={admin} initialDogs={dogs} />;
}
