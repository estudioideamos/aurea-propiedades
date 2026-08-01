"use client";

import Link from "next/link";
import { ArrowUp, ArrowUpRight, Clock3, House, Instagram, Linkedin, MapPin, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

const orbitText = "EXPLORAR \u00b7 PROPIEDADES \u00b7 \u00c1UREA \u00b7 ";

function Brand() {
  return <Link className="brand" href="/" aria-label="Aurea Propiedades, inicio"><span className="brand-mark"><i/><i/></span><span><b>&Aacute;UREA</b><small>PROPIEDADES</small></span></Link>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <><div className="top-rail"><span>BUENOS AIRES / ARGENTINA</span><span>COMPRA / VENTA / ALQUILER / INVERSION</span><a href="tel:+541155550190">+54 11 5555 0190</a></div><header className="site-header"><Brand/><nav className={open ? "open" : ""}><Link href="/propiedades">Propiedades</Link><Link href="/nosotros">Nosotros</Link><Link href="/servicios">Servicios</Link><Link href="/contacto">Contacto</Link></nav><Link className="header-action" href="/tasacion">Tas&aacute; tu propiedad <ArrowUpRight className="mini-arrow" aria-hidden="true" strokeWidth={1.8}/></Link><button className={`menu-toggle ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)} aria-label="Abrir menu"><i/><i/></button></header></>;
}

export function SiteFooter() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => { const onScroll=()=>setShowTop(window.scrollY>520); onScroll(); window.addEventListener("scroll",onScroll,{passive:true}); return()=>window.removeEventListener("scroll",onScroll); },[]);
  return <><footer className="site-footer rich-footer">
    <section className="rich-footer-cta"><div><p className="rich-footer-eyebrow"><i/> PROPIEDADES PARA VIVIR MEJOR</p><h2><span>Tu pr&oacute;xima historia merece</span><em>un lugar extraordinario.</em></h2></div><Link className="footer-orbit-link" href="/propiedades" aria-label="Explorar propiedades"><span className="footer-orbit-text" aria-hidden="true">{orbitText.split("").map((char,index)=><i key={`${char}-${index}`} style={{transform:`rotate(${index*(360/orbitText.length)}deg)`}}>{char===" "?"\u00a0":char}</i>)}</span><span className="footer-orbit-core"><House aria-hidden="true" strokeWidth={1.65}/></span></Link></section>
    <div className="rich-footer-main"><div className="rich-footer-brand"><Brand/><p>Una inmobiliaria boutique que combina arquitectura, estrategia y cercan&iacute;a para acompa&ntilde;ar decisiones que importan.</p><div className="footer-social"><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram aria-hidden="true" strokeWidth={1.7}/></a><a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin aria-hidden="true" strokeWidth={1.7}/></a></div></div>
      <nav className="rich-footer-nav"><p>EXPLOR&Aacute;</p><Link href="/propiedades">Propiedades</Link><Link href="/propiedades?operacion=venta">Comprar</Link><Link href="/propiedades?operacion=alquiler">Alquilar</Link><Link href="/tasacion">Vender</Link><Link href="/nosotros">Nuestra mirada</Link></nav>
      <nav className="rich-footer-nav"><p>SERVICIOS</p><Link href="/servicios">Compra y venta</Link><Link href="/servicios">Inversiones</Link><Link href="/tasacion">Tasaciones</Link><Link href="/contacto">Contacto</Link><Link href="/admin">Administraci&oacute;n</Link></nav>
      <div className="rich-footer-contact"><p className="contact-kicker">ASESORAMIENTO PERSONAL</p><h3>&iquest;Te ayudamos a elegir?</h3><a className="footer-whatsapp" href="https://wa.me/541155550190" target="_blank" rel="noreferrer"><span>Hablar por WhatsApp</span><ArrowUpRight aria-hidden="true" strokeWidth={1.8}/></a><p><MapPin aria-hidden="true"/> Av. del Libertador 2424<br/>Buenos Aires, Argentina</p><p><Clock3 aria-hidden="true"/> Lun. a vie. / 9 a 18 h</p><a href="mailto:hola@aureapropiedades.com">hola@aureapropiedades.com</a></div>
    </div>
    <div className="rich-footer-bottom"><span>2026 &Aacute;UREA PROPIEDADES. TODOS LOS DERECHOS RESERVADOS.</span><div className="footer-seal"><b>A</b><small>&Aacute;UREA / DESDE 2014</small></div><span>ARQUITECTURA / CRITERIO / VALOR</span></div>
  </footer><div className="floating-actions" aria-label="Accesos rapidos"><button className={`go-top ${showTop?"visible":""}`} onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} type="button" aria-label="Volver arriba"><span>Volver arriba</span><ArrowUp aria-hidden="true" strokeWidth={1.9}/></button><a className="whatsapp-float" href="https://wa.me/541155550190" target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp"><span>WhatsApp</span><MessageCircle aria-hidden="true" strokeWidth={1.9}/></a></div></>;
}