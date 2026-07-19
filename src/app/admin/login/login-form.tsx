"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setError("El correo o la contraseña no son correctos.");
      setLoading(false);
      return;
    }

    const { data: admin } = await supabase
      .from("admin_users")
      .select("role")
      .maybeSingle();

    if (!admin) {
      await supabase.auth.signOut();
      setError("Esta cuenta no tiene permisos administrativos.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <Link className="admin-back-link" href="/">← Volver a la landing</Link>
        <p className="admin-kicker">Fundación Protegiendo Huellas</p>
        <h1 id="admin-login-title">Acceso administrativo</h1>
        <p className="admin-login-copy">Ingresa con la cuenta autorizada para gestionar los perros en adopción.</p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Correo electrónico</span>
            <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Contraseña</span>
            <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p className="admin-message error" role="alert">{error}</p>}
          <button className="btn btn-primary admin-submit" type="submit" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar al panel"}
          </button>
        </form>
      </section>
    </main>
  );
}
