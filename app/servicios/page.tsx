import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteFooter, SiteHeader } from "../site-chrome";
import { ServicesExperience } from "./services-experience";

export const dynamic = "force-static";

export default function ServicesPage(){return <main><SiteHeader/><section className="inner-hero services-hero"><div className="module-label"><b>03</b><span>SERVICIOS<br/>INTEGRALES</span></div><div><p>ESTRATEGIA / GESTI&Oacute;N / CIERRE</p><h1>Una estructura.<br/>Todo resuelto.</h1><p>Respuestas concretas para comprar, vender, alquilar, tasar y ordenar operaciones especiales.</p></div></section><ServicesExperience/><section className="process-band"><p>UN PROCESO SIMPLE Y TRANSPARENTE</p><div><span>01 / DIAGN&Oacute;STICO</span><span>02 / ESTRATEGIA</span><span>03 / EJECUCI&Oacute;N</span><span>04 / CIERRE</span></div><Link href="/contacto">INICIAR CONSULTA <ArrowUpRight className="button-icon" aria-hidden="true" strokeWidth={1.8}/></Link></section><SiteFooter/></main>}