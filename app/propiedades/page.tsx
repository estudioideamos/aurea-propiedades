import { CatalogExperience } from "./catalog-experience";
import { properties } from "../properties";
import { InternalHero } from "../internal-hero";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const dynamic = "force-static";

export default function PropertiesPage(){return <main><SiteHeader/><InternalHero section="01" label="CAT&Aacute;LOGO / PROPIEDADES" eyebrow="COMPRA / ALQUILER / INVERSI&Oacute;N" title={["Propiedades","con criterio."]} description="Explor&aacute; una selecci&oacute;n cuidada y filtr&aacute; por operaci&oacute;n, tipolog&iacute;a o zona." metric={String(properties.length)} metricLabel="OPORTUNIDADES ACTIVAS"/><section className="catalog-page"><div className="catalog-intro"><span className="section-tag">SELECCI&Oacute;N IDEAMOS</span><h2>Encontr&aacute; el lugar<br/>que te representa.</h2><p>Us&aacute; los filtros para ordenar la b&uacute;squeda. Cada ficha incluye informaci&oacute;n completa, galer&iacute;a y contacto directo con nuestro equipo.</p></div><CatalogExperience properties={properties}/></section><SiteFooter/></main>}