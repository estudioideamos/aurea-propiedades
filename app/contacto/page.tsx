import { ArrowUpRight } from "lucide-react";
import { SiteFooter, SiteHeader } from "../site-chrome";
import { InternalHero } from "../internal-hero";
import { ContactFormExperience } from "./contact-form-experience";
import { ContactDetails } from "./contact-details";
import { siteAsset } from "../site-path";

export const dynamic = "force-static";

export default function ContactPage(){return <main><SiteHeader/><InternalHero section="04" label="CONTACTO / DIRECTO" eyebrow="CONTANOS TU OBJETIVO" title={["Empecemos","una charla."]} description="Contanos qué necesitás y un asesor especializado te responde personalmente." metric="24h" metricLabel="TIEMPO DE RESPUESTA"/><section className="contact-vian"><header className="contact-vian-heading"><div><span className="section-tag">01 / CONTACTO IDEAMOS</span><h2>Construyamos una<br/>decisión que dure.</h2></div><p>Comprar, vender o invertir empieza con una conversación clara. Contanos tu objetivo y armamos el próximo paso con criterio.</p></header><div className="contact-vian-layout"><aside className="contact-vian-info"><img src={siteAsset("/assets/aurea-hero-vian.png")} alt="Residencia contemporánea seleccionada por Ideamos"/><div className="contact-vian-overlay"><p>ATENCIÓN PERSONAL</p><h3>Estamos cerca para acompañarte.</h3><a href="https://wa.me/541155550190" target="_blank" rel="noreferrer">Hablar por WhatsApp <ArrowUpRight aria-hidden="true"/></a></div></aside><div className="contact-vian-panel"><header><span>02 / EMPECEMOS</span><h2>Contanos qué necesitás hoy.</h2><p>Completá el formulario y una persona del equipo te contacta dentro de las próximas 24 horas hábiles.</p></header><ContactFormExperience/></div></div><ContactDetails/></section><SiteFooter/></main>}