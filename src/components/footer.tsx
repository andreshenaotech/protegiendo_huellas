"use client";

import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/brand";

export function Footer() {
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const placeholderSocial = () => {
    setToast("Agrega aquí la red social de la fundación");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2200);
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Brand />
          <div className="socials" aria-label="Redes sociales">
            <button className="social-link" type="button" aria-label="Instagram" onClick={placeholderSocial}>ig</button>
            <button className="social-link" type="button" aria-label="Facebook" onClick={placeholderSocial}>f</button>
            <button className="social-link" type="button" aria-label="TikTok" onClick={placeholderSocial}>t</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Fundación Protegiendo Huellas.</span>
          <span>Adopta con el corazón. Cuida con responsabilidad.</span>
        </div>
      </div>
      <div className={`toast${toast ? " visible" : ""}`} role="status" aria-live="polite"><span aria-hidden="true">♥</span><span>{toast}</span></div>
    </footer>
  );
}
