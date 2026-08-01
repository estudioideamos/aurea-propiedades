"use client";

import Link from "next/link";
import { useState } from "react";

function Brand() {
  return <Link className="brand" href="/" aria-label="Aurea Propiedades, inicio"><span className="brand-mark"><i/><i/></span><span><b>&Aacute;UREA</b><small>PROPIEDADES</small></span></Link>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <><div className="top-rail"><span>BUENOS AIRES / ARGENTINA</span><span>COMPRA / VENTA / ALQUILER / INVERSION</span><a href="tel:+541155550190">+54 11 5555 0190</a></div><header className="site-header"><Brand/><nav className={open ? "open" : ""}><Link href="/propiedades">Propiedades</Link><Link href="/nosotros">Nosotros</Link><Link href="/servicios">Servicios</Link><Link href="/contacto">Contacto</Link></nav><Link className="header-action" href="/tasacion">Tas&aacute; tu propiedad <span className="mini-arrow"/></Link><button className={`menu-toggle ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)} aria-label="Abrir menu"><i/><i/></button></header></>;
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-lead"><Brand/><h2>Hagamos que tu pr&oacute;ximo movimiento inmobiliario sea extraordinario.</h2><Link href="/contacto" className="circle-link"><span className="mini-arrow"/></Link></div><div className="footer-grid"><div><span className="footer-label">NAVEGACION</span><Link href="/propiedades">Propiedades</Link><Link href="/nosotros">Nosotros</Link><Link href="/servicios">Servicios</Link><Link href="/contacto">Contacto</Link></div><div><span className="footer-label">OFICINA</span><p>Av. del Libertador 2424<br/>Buenos Aires, Argentina</p><a href="tel:+541155550190">+54 11 5555 0190</a><a href="mailto:hola@aureapropiedades.com">hola@aureapropiedades.com</a></div><div><span className="footer-label">GESTION</span><Link href="/tasacion">Solicitar tasaci&oacute;n</Link><Link href="/admin">Administraci&oacute;n</Link></div></div><div className="footer-bottom"><span>2026 AUREA PROPIEDADES</span><span>HECHO PARA VIVIR MEJOR</span></div></footer>;
}