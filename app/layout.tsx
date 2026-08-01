import type { Metadata } from "next";
import { headers } from "next/headers";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3001";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  return {
    metadataBase: base,
    title: "Áurea Propiedades | Casas con carácter",
    description: "Propiedades seleccionadas para comprar, alquilar e invertir en Buenos Aires.",
    openGraph: { title: "Áurea Propiedades", description: "Encontrá un lugar que se sienta tuyo.", images: [{ url: "/og.png", width: 1200, height: 630 }], locale: "es_AR", type: "website" },
    twitter: { card: "summary_large_image", title: "Áurea Propiedades", description: "Encontrá un lugar que se sienta tuyo.", images: ["/og.png"] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${manrope.variable} ${cormorant.variable}`}>{children}</body></html>;
}
