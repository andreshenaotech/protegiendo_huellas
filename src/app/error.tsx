"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="error-title">
        <p className="admin-kicker">Fundación Protegiendo Huellas</p>
        <h1 id="error-title">Estamos teniendo un problema temporal</h1>
        <p className="admin-login-copy">
          No pudimos cargar la información en este momento. Intenta de nuevo en unos segundos o
          escríbenos por WhatsApp al <a href="https://wa.me/573227464595">322 746 4595</a>.
        </p>
        <button className="btn btn-primary admin-submit" type="button" onClick={reset}>Intentar de nuevo</button>
      </section>
    </main>
  );
}
