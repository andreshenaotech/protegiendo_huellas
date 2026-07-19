import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminLoginForm } from "@/app/admin/login/login-form";

export const metadata: Metadata = {
  title: "Acceso administrativo | Protegiendo Huellas",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");
  return <AdminLoginForm />;
}
