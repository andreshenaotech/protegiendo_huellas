import { Brand } from "@/components/brand";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/icons";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Brand />
          <div className="socials" aria-label="Redes sociales">
            <a className="social-link" href="https://www.facebook.com/fundacion.protegiendo.huellas.2025" target="_blank" rel="noopener noreferrer" aria-label="Facebook de Fundación Protegiendo Huellas"><FacebookIcon /></a>
            <a className="social-link" href="https://www.instagram.com/protegiendo_huellas/" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Fundación Protegiendo Huellas"><InstagramIcon /></a>
            <a className="social-link" href="https://www.tiktok.com/@protegiendo.huellas?_r=1&_t=ZS-989SSm8VsZj" target="_blank" rel="noopener noreferrer" aria-label="TikTok de Fundación Protegiendo Huellas"><TikTokIcon /></a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Fundación Protegiendo Huellas.</span>
          <span className="footer-bottom-links">
            <span>Adopta con el corazón. Cuida con responsabilidad.</span>
            <Link href="/admin/login">Acceso administrativo</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
