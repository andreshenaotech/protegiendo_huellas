import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Protegiendo Huellas | Perritos en adopción",
  description: "Conoce a los perros en adopción de la Fundación Protegiendo Huellas en Paipa, Boyacá.",
};

export const viewport: Viewport = {
  themeColor: "#6fae2c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-scroll-behavior: Next desactiva el scroll suave durante los cambios
    // de página para que la nueva página abra arriba.
    <html lang="es" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
