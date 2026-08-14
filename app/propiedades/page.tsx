import type { Metadata } from "next";
import { CatalogExperience } from "./catalog-experience";
import { getLiveProperties } from "../live-properties";
import { InternalHero } from "../internal-hero";
import { SiteFooter, SiteHeader } from "../site-chrome";
export const metadata: Metadata = {
  title: "Propiedades en venta y alquiler | Ideamos Propiedades",
  description: "Explor? propiedades seleccionadas en Buenos Aires y filtr? por operaci?n, tipo, zona y cantidad de ambientes.",
  alternates: { canonical: "https://inmobiliaria.ideamos.ar/propiedades" },
  openGraph: { title: "Propiedades con criterio | Ideamos", description: "Casas, departamentos, PH y terrenos seleccionados en Buenos Aires.", url: "https://inmobiliaria.ideamos.ar/propiedades", type: "website" },
};



export const dynamic = "force-dynamic";

export default async function PropertiesPage(){const properties=await getLiveProperties(); return <main><SiteHeader/><InternalHero section="01" label="CAT&Aacute;LOGO / PROPIEDADES" eyebrow="COMPRA / ALQUILER / INVERSI&Oacute;N" title={["Propiedades","con criterio."]} description="Explorá una selección cuidada y filtrá por operación, tipología o zona." metric={String(properties.length)} metricLabel="OPORTUNIDADES ACTIVAS"/><section className="catalog-page" id="resultados"><div className="catalog-intro"><span className="section-tag">SELECCIÓN IDEAMOS</span><h2>Encontrá el lugar<br/>que te representa.</h2><p>Usá los filtros para ordenar la búsqueda. Cada ficha incluye información completa, galería y contacto directo con nuestro equipo.</p></div><CatalogExperience properties={properties}/></section><SiteFooter/></main>}