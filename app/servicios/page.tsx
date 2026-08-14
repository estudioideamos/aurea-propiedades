import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";
import { ServicesExperience } from "./services-experience";
import { InternalHero } from "../internal-hero";
export const metadata: Metadata = {
  title: "Servicios inmobiliarios | Ideamos Propiedades",
  description: "Compra, venta, alquileres, tasaciones, inversiones y gesti?n integral de operaciones inmobiliarias.",
  alternates: { canonical: "https://inmobiliaria.ideamos.ar/servicios" },
};



export const dynamic = "force-static";

export default function ServicesPage(){return <main><SiteHeader/><InternalHero section="03" label="SERVICIOS / INTEGRALES" eyebrow="ESTRATEGIA / GESTI&Oacute;N / CIERRE" title={["Una estructura.","Todo resuelto."]} description="Respuestas concretas para comprar, vender, alquilar, tasar y ordenar operaciones especiales." metric="05" metricLabel="SERVICIOS INTEGRALES"/><ServicesExperience/><SiteFooter/></main>}