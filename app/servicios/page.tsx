import { SiteFooter, SiteHeader } from "../site-chrome";
import { ServicesExperience } from "./services-experience";

export const dynamic = "force-static";

export default function ServicesPage(){return <main><SiteHeader/><section className="inner-hero services-hero"><div className="module-label"><b>03</b><span>SERVICIOS<br/>INTEGRALES</span></div><div><p>ESTRATEGIA / GESTI&Oacute;N / CIERRE</p><h1>Una estructura.<br/>Todo resuelto.</h1><p>Respuestas concretas para comprar, vender, alquilar, tasar y ordenar operaciones especiales.</p></div></section><ServicesExperience/><SiteFooter/></main>}