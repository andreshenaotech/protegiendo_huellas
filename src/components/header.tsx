"use client";

import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { MenuIcon } from "@/components/icons";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 20);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="container nav">
        <Brand onClick={closeMenu} />
        <nav className={`nav-links${menuOpen ? " open" : ""}`} id="navLinks" aria-label="Navegación principal">
          <a href="#adopta" onClick={closeMenu}>Adopta</a>
          <a href="#proceso" onClick={closeMenu}>Cómo adoptar</a>
          <a href="#nosotros" onClick={closeMenu}>La fundación</a>
          <a className="btn btn-primary" href="#donaciones" onClick={closeMenu}>Quiero donar</a>
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="navLinks"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon />
        </button>
      </div>
    </header>
  );
}
