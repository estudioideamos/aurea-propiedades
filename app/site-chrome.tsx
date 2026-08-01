"use client";

import Link from "next/link";
import { useState } from "react";

function Brand() {
  return <Link className="brand" href="/" aria-label="Aurea Propiedades, inicio"><span className="brand-mark">A</span><span><b>&Aacute;UREA</b><small>PROPIEDADES</small></span></Link>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <><div className="top-rail"><span>ESTUDIO INMOBILIARIO / BUENOS AIRES</span><span>CURADURIA / ESTRATEGIA / RESULTADOS</span></div><header className="site-header"><Brand/><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Abrir menu">{open ? "CERRAR" : "MENU"}</button><nav className={open ? "open" : ""}><Link href="/propiedades">PROPIEDADES</Link><Link href="/nosotros">NOSOTROS</Link><Link href="/servicios">SERVICIOS</Link><Link href="/contacto">CONTACTO</Link></nav><Link className="header-action" href="/tasacion">TASAR PROPIEDAD <span>+</span></Link></header></>;
}

export function SiteFooter() {
  return <footer><Brand/><div><Link href="/propiedades">PROPIEDADES</Link><Link href="/nosotros">NOSOTROS</Link><Link href="/servicios">SERVICIOS</Link><Link href="/contacto">CONTACTO</Link><Link href="/admin">ADMINISTRACION</Link></div><p>2026 / AUREA PROPIEDADES / BUENOS AIRES</p></footer>;
}
