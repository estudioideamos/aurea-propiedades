import type { Metadata } from "next";
import { headers } from "next/headers";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const dmSans = DM_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3001";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  return {
    metadataBase: base,
    title: "Aurea Propiedades | Espacios excepcionales",
    description: "Propiedades seleccionadas para comprar, alquilar e invertir en Buenos Aires.",
    openGraph: { title: "Aurea Propiedades", description: "Espacios excepcionales, guiados por tu forma de vivir.", images: [{ url: "/og.png", width: 1200, height: 630 }], locale: "es_AR", type: "website" },
    twitter: { card: "summary_large_image", title: "Aurea Propiedades", description: "Espacios excepcionales, guiados por tu forma de vivir.", images: ["/og.png"] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${manrope.variable} ${dmSans.variable}`}>{children}</body></html>;
}