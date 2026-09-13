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
  const [dogsResult, eventsResult] = await Promise.all([
    supabase.from("dogs").select("*").order("id", { ascending: false }),
    supabase.from("events").select("*").order("event_date", { ascending: false }),
  ]);

  if (dogsResult.error) {
    throw new Error("No fue posible cargar los perros del panel administrativo.");
  }

  // Si la tabla de eventos aún no existe o falla, el panel de perros sigue disponible.
  if (eventsResult.error) console.error("No fue posible cargar los eventos del panel", eventsResult.error.message);

  return <AdminDashboard admin={admin} initialDogs={dogsResult.data} initialEvents={eventsResult.data ?? []} />;
}
