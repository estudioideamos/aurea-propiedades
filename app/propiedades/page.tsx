import { CatalogExperience } from "./catalog-experience";
import { properties } from "../properties";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const dynamic = "force-static";

export default function PropertiesPage(){return <main><SiteHeader/><section className="inner-hero"><div className="module-label"><b>01</b><span>CATALOGO<br/>COMPLETO</span></div><div><p>COMPRA / ALQUILER / INVERSION</p><h1>Propiedades.</h1><p>Explora la cartera completa y filtra por operacion, tipo y zona.</p></div></section><section className="catalog-page"><CatalogExperience properties={properties}/></section><SiteFooter/></main>}
