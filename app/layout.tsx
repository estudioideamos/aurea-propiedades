import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { SiteMotion } from "./site-motion";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const dmSans = DM_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://inmobiliaria.ideamos.ar").replace(/\/$/, "");
const socialImage = `${siteUrl}/og.png`;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: "Ideamos Propiedades | Espacios excepcionales",
  description: "Propiedades seleccionadas para comprar, alquilar e invertir en Buenos Aires.",
  alternates: { canonical: `${siteUrl}/` },
  icons: { icon: `${basePath}/favicon.svg`, shortcut: `${basePath}/favicon.svg`, apple: `${basePath}/favicon.svg` },
  openGraph: { title: "Ideamos Propiedades", description: "Espacios excepcionales, guiados por tu forma de vivir.", siteName: "Ideamos Propiedades", images: [{ url: socialImage, width: 1200, height: 630, alt: "Ideamos Propiedades - Propiedades con criterio" }], locale: "es_AR", type: "website" },
  twitter: { card: "summary_large_image", title: "Ideamos Propiedades", description: "Espacios excepcionales, guiados por tu forma de vivir.", images: [socialImage] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${manrope.variable} ${dmSans.variable}`}><SiteMotion/>{children}</body></html>;
}