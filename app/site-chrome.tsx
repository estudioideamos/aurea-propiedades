"use client";

import Link from "next/link";
import { ArrowUp, ArrowUpRight, Check, ChevronDown, Clock3, House, Instagram, Linkedin, Mail, MapPin, Palette, X } from "lucide-react";
import { useEffect, useState } from "react";
import { siteAsset } from "./site-path";

const orbitText = "EXPLORAR \u00b7 PROPIEDADES \u00b7 IDEAMOS \u00b7 ";
const marqueeItems = ["PROPIEDADES SELECCIONADAS", "TASACIONES PROFESIONALES", "ADMINISTRACIÓN DE ALQUILERES", "ACOMPAÑAMIENTO PERSONAL", "BUENOS AIRES"];
const colorThemes = [
  { id: "lime", name: "Lima Ideamos", color: "#cfff3d", rgb: "207,255,61" },
  { id: "electric-lime", name: "Lima eléctrico", color: "#E8F115", rgb: "232,241,21" },
  { id: "red", name: "Rojo coral", color: "#ff5a4e", rgb: "255,90,78" },
  { id: "blue", name: "Azul cielo", color: "#65b6ff", rgb: "101,182,255" },
  { id: "amber", name: "Ámbar", color: "#ffbf3f", rgb: "255,191,63" },
  { id: "lavender", name: "Lavanda", color: "#b9a7ff", rgb: "185,167,255" },
];

function SiteMarquee() {
  const content = <>{marqueeItems.map(item => <span key={item}>{item}<i aria-hidden="true">✦</i></span>)}</>;
  return <div className="site-marquee" aria-label="Servicios destacados"><div className="site-marquee-track"><span className="site-marquee-group">{content}</span><span className="site-marquee-group" aria-hidden="true">{content}</span></div></div>;
}

function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("lime");

  const applyTheme = (id: string) => {
    const theme = colorThemes.find(item => item.id === id) ?? colorThemes[0];
    document.documentElement.style.setProperty("--accent", theme.color);
    document.documentElement.style.setProperty("--accent-rgb", theme.rgb);
    window.localStorage.setItem("aurea-accent", theme.id);
    setSelected(theme.id);
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("aurea-accent");
    if (saved && colorThemes.some(theme => theme.id === saved)) applyTheme(saved);
  }, []);

  return <aside className={"theme-switcher " + (open ? "open" : "")} aria-label="Personalizar color destacado">
    <button className="theme-switcher-toggle" type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? "Cerrar selector de color" : "Cambiar color destacado"}><Palette aria-hidden="true"/><span>COLOR</span></button>
    {open && <div className="theme-switcher-panel"><header><div><small>PERSONALIZÁ LA EXPERIENCIA</small><b>Color destacado</b></div><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar"><X aria-hidden="true"/></button></header><p>Elegí el acento visual de todo el sitio.</p><div className="theme-swatches">{colorThemes.map(theme => <button key={theme.id} type="button" className={selected === theme.id ? "active" : ""} onClick={() => applyTheme(theme.id)} aria-label={"Usar " + theme.name}><i style={{backgroundColor: theme.color}}/><span>{theme.name}</span>{selected === theme.id && <Check aria-hidden="true"/>}</button>)}</div></div>}
  </aside>;
}

export function IdeamosSymbol() {
  return <svg className="ideamos-symbol" viewBox="0 0 236 178" aria-hidden="true"><path d="M0 0h140l96 96v82h-88v-76L46 0H0Z"/><path d="M0 108 62 46l62 62H88v70H0v-70Z"/></svg>;
}

export function Brand() {
  return <Link className="brand ideamos-brand" href="/" aria-label="Ideamos Propiedades, inicio"><IdeamosSymbol/><span className="ideamos-word">ideamos</span></Link>;
}
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  return <><SiteMarquee/><header className="site-header"><Brand/><nav className="desktop-nav"><Link href="/propiedades">Propiedades</Link><Link href="/emprendimientos">Emprendimientos</Link><Link href="/nosotros">Nosotros</Link><Link href="/servicios">Servicios</Link><Link href="/contacto">Contacto</Link></nav><Link className="header-action" href="/tasacion">Tas&aacute; tu propiedad <ArrowUpRight className="mini-arrow" aria-hidden="true" strokeWidth={1.8}/></Link><button className={"menu-toggle " + (open ? "is-open" : "")} onClick={() => setOpen(!open)} aria-label={open ? "Cerrar men&uacute;" : "Abrir men&uacute;"} aria-expanded={open}><i/><i/></button><div className={"mobile-nav-drawer " + (open ? "open" : "")}><p className="mobile-menu-kicker">MEN&Uacute; / IDEAMOS PROPIEDADES</p><details open><summary><span>01</span><b>Inmuebles</b><ChevronDown aria-hidden="true"/></summary><div><Link href="/propiedades" onClick={closeMenu}>Propiedades</Link><Link href="/emprendimientos" onClick={closeMenu}>Emprendimientos</Link><Link href="/propiedades?operacion=venta" onClick={closeMenu}>Comprar</Link><Link href="/propiedades?operacion=alquiler" onClick={closeMenu}>Alquilar</Link></div></details><details><summary><span>02</span><b>Servicios</b><ChevronDown aria-hidden="true"/></summary><div><Link href="/servicios" onClick={closeMenu}>Todos los servicios</Link><Link href="/tasacion" onClick={closeMenu}>Tasaciones</Link><Link href="/contacto" onClick={closeMenu}>Administraci&oacute;n</Link></div></details><Link className="mobile-menu-row" href="/nosotros" onClick={closeMenu}><span>03</span><b>Nosotros</b><ArrowUpRight aria-hidden="true"/></Link><Link className="mobile-menu-row" href="/contacto" onClick={closeMenu}><span>04</span><b>Contacto</b><ArrowUpRight aria-hidden="true"/></Link><Link className="mobile-menu-cta" href="/tasacion" onClick={closeMenu}>Tas&aacute; tu propiedad <ArrowUpRight aria-hidden="true"/></Link></div></header><ThemeSwitcher/></>;
}

export function SiteFooter() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => { const onScroll=()=>setShowTop(window.scrollY>520); onScroll(); window.addEventListener("scroll",onScroll,{passive:true}); return()=>window.removeEventListener("scroll",onScroll); },[]);
  return <><footer className="site-footer rich-footer">
    <section className="rich-footer-cta"><div><p className="rich-footer-eyebrow"><i/> PROPIEDADES PARA VIVIR MEJOR</p><h2><span>Tu pr&oacute;xima historia merece</span><em>un lugar extraordinario.</em></h2></div><Link className="footer-orbit-link" href="/propiedades" aria-label="Explorar propiedades"><span className="footer-orbit-text" aria-hidden="true">{orbitText.split("").map((char,index)=><i key={`${char}-${index}`} style={{transform:`rotate(${index*(360/orbitText.length)}deg)`}}>{char===" "?"\u00a0":char}</i>)}</span><span className="footer-orbit-core"><House aria-hidden="true" strokeWidth={1.65}/></span></Link></section>
    <div className="rich-footer-main"><div className="rich-footer-brand"><Brand/><p>Una inmobiliaria boutique que combina arquitectura, estrategia y cercan&iacute;a para acompa&ntilde;ar decisiones que importan.</p><div className="footer-social"><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram aria-hidden="true" strokeWidth={1.7}/></a><a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin aria-hidden="true" strokeWidth={1.7}/></a></div></div>
      <nav className="rich-footer-nav"><p>EXPLOR&Aacute;</p><Link href="/propiedades">Propiedades</Link><Link href="/emprendimientos">Emprendimientos</Link><Link href="/propiedades?operacion=venta">Comprar</Link><Link href="/propiedades?operacion=alquiler">Alquilar</Link><Link href="/tasacion">Vender</Link><Link href="/nosotros">Nuestra mirada</Link></nav>
      <nav className="rich-footer-nav"><p>SERVICIOS</p><Link href="/servicios">Compra y venta</Link><Link href="/servicios">Inversiones</Link><Link href="/tasacion">Tasaciones</Link><Link href="/contacto">Contacto</Link><Link href="/admin">Administraci&oacute;n</Link></nav>
      <div className="rich-footer-contact"><p className="contact-kicker">ASESORAMIENTO PERSONAL</p><h3>&iquest;Te ayudamos a elegir?</h3><a className="footer-whatsapp" href="https://wa.me/541155550190" target="_blank" rel="noreferrer"><span>Hablar por WhatsApp</span><ArrowUpRight aria-hidden="true" strokeWidth={1.8}/></a><p><MapPin aria-hidden="true"/> Av. del Libertador 2424<br/>Buenos Aires, Argentina</p><p><Clock3 aria-hidden="true"/> Lun. a vie. / 9 a 18 h</p><a className="footer-email" href="mailto:hola@ideamos.ar"><Mail aria-hidden="true"/><span>hola@ideamos.ar</span></a></div>
    </div>
    <div className="rich-footer-bottom"><span>2026 IDEAMOS PROPIEDADES. TODOS LOS DERECHOS RESERVADOS.</span><div className="footer-seal"><b><IdeamosSymbol/></b><small>IDEAMOS / DESDE 2014</small></div><a className="footer-credit" href="https://ideamos.ar/" target="_blank" rel="noreferrer"><span>&copy; DISE&Ntilde;O Y DESARROLLO POR</span><b>ESTUDIO IDEAMOS</b><ArrowUpRight aria-hidden="true" strokeWidth={1.8}/></a></div>
  </footer><div className="floating-actions" aria-label="Accesos rapidos"><button className={`go-top ${showTop?"visible":""}`} onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} type="button" aria-label="Volver arriba"><span>Volver arriba</span><ArrowUp aria-hidden="true" strokeWidth={1.9}/></button><a className="whatsapp-float" href="https://wa.me/541155550190" target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp"><span>WhatsApp</span><img src={siteAsset("/assets/whatsapp.svg")} alt="" aria-hidden="true"/></a></div></>;
}