import { CatalogExperience } from "./catalog-experience";
import { properties } from "../properties";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const dynamic = "force-static";

export default function PropertiesPage(){return <main><SiteHeader/><section className="inner-hero catalog-hero"><div className="module-label"><b>01</b><span>CAT&Aacute;LOGO<br/>COMPLETO</span></div><div className="catalog-hero-copy"><p>COMPRA / ALQUILER / INVERSI&Oacute;N</p><h1>Propiedades<br/><em>con criterio.</em></h1><div className="catalog-hero-bottom"><p>Explor&aacute; una selecci&oacute;n cuidada y filtr&aacute; por operaci&oacute;n, tipolog&iacute;a o zona.</p><span><b>{properties.length}</b> OPORTUNIDADES ACTIVAS</span></div></div></section><section className="catalog-page"><div className="catalog-intro"><span className="section-tag">SELECCI&Oacute;N &Aacute;UREA</span><h2>Encontr&aacute; el lugar<br/>que te representa.</h2><p>Us&aacute; los filtros para ordenar la b&uacute;squeda. Cada ficha incluye informaci&oacute;n completa, galer&iacute;a y contacto directo con nuestro equipo.</p></div><CatalogExperience properties={properties}/></section><SiteFooter/></main>}