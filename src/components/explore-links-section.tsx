import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon, DonateIcon, HeartIcon, HomeIcon, SearchIcon, ShelterPawIcon } from "@/components/icons";

type ExploreLink = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
};

const links: ExploreLink[] = [
  { href: "/perritos", title: "Adopta", description: "Conoce a los perritos que esperan un hogar y encuentra a tu compañero.", icon: <SearchIcon /> },
  { href: "/apadrinamiento", title: "Apadrina", description: "Acompaña a un peludo con un aporte mensual, sin llevártelo a casa.", icon: <HeartIcon /> },
  { href: "/voluntariado", title: "Voluntariado", description: "Suma tu tiempo, tu oficio o tu casa para cambiar la vida de un animal.", icon: <ShelterPawIcon /> },
  { href: "/adopciones", title: "Cómo adoptar", description: "Revisa las recomendaciones y los pasos para llevar a tu perrito a casa.", icon: <HomeIcon /> },
  { href: "/#donaciones", title: "Quiero donar", description: "Tu aporte se convierte en alimento, salud y esterilizaciones.", icon: <DonateIcon /> },
];

type ExploreLinksSectionProps = {
  eyebrow?: string;
  title?: string;
};

// Accesos a las formas de ayudar. Reutilizable en cualquier página.
export function ExploreLinksSection({ eyebrow = "Súmate a la causa", title = "¿Cómo quieres dejar tu huella?" }: ExploreLinksSectionProps) {
  return (
    <section className="explore-links-section">
      <div className="container">
        <div data-reveal="up">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
        </div>

        <div className="explore-links" data-reveal="up">
          {links.map((link) => (
            <Link className="explore-link" href={link.href} key={link.href}>
              <span className="explore-link-icon" aria-hidden="true">{link.icon}</span>
              <span className="explore-link-copy">
                <strong>{link.title}</strong>
                <span>{link.description}</span>
              </span>
              <span className="explore-link-arrow" aria-hidden="true"><ArrowIcon /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
