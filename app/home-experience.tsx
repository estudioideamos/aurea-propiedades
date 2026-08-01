"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice, type Property } from "./properties";

function Brand() {
  return <Link className="brand" href="/" aria-label="Áurea Propiedades, inicio"><span className="brand-mark">A</span><span>ÁUREA<small>PROPIEDADES</small></span></Link>;
}

function PropertyCard({ property }: { property: Property }) {
  const [favorite, setFavorite] = useState(false);
  return <article className="property-card">
    <div className="property-media"><img src={property.image} alt={property.title} /><span className="property-tag">{property.operation}</span><button className={`favorite ${favorite ? "active" : ""}`} onClick={() => setFavorite(!favorite)} aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"} type="button">{favorite ? "♥" : "♡"}</button></div>
    <div className="property-copy"><p className="eyebrow">{property.type} · {property.location}</p><h3><Link href={`/propiedades/${property.slug}`}>{property.title}</Link></h3><div className="property-meta"><span>{property.rooms} amb.</span><span>{property.bedrooms} dorm.</span><span>{property.area} m²</span></div><div className="property-footer"><strong>{formatPrice(property)}</strong><Link href={`/propiedades/${property.slug}`} aria-label={`Ver ${property.title}`}>↗</Link></div></div>
  </article>;
}

export function HomeExperience({ properties }: { properties: Property[] }) {
  const [menu, setMenu] = useState(false);
  const [operation, setOperation] = useState("Venta");
  const [type, setType] = useState("Todos");
  const [zone, setZone] = useState("Todas");
  const [searched, setSearched] = useState(false);
  const visible = useMemo(() => properties.filter((property) => property.operation === operation && (type === "Todos" || property.type === type) && (zone === "Todas" || property.zone === zone)), [operation, type, zone, properties]);
  const runSearch = () => { setSearched(true); document.getElementById("propiedades")?.scrollIntoView({ behavior: "smooth" }); };

  return <main>
    <header className="site-header"><Brand /><button className="menu-toggle" onClick={() => setMenu(!menu)} aria-label="Abrir menú">{menu ? "×" : "☰"}</button><nav className={menu ? "open" : ""}><a href="#propiedades">Propiedades</a><a href="#servicios">Servicios</a><a href="#nosotros">Nosotros</a><a href="#contacto">Contacto</a></nav><a className="header-action" href="#contacto">Tasá tu propiedad <span>↗</span></a></header>

    <section className="hero"><img className="hero-image" src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2200&q=90" alt="Interior contemporáneo y luminoso" /><div className="hero-shade" /><div className="hero-copy"><p className="hero-kicker">Buenos Aires · Argentina</p><h1>Encontrá un lugar<br />que se sienta <em>tuyo.</em></h1><p>Propiedades extraordinarias, seleccionadas con criterio y acompañadas de principio a fin.</p></div><div className="search-panel" aria-label="Buscar propiedades"><div className="operation-tabs">{(["Venta", "Alquiler"] as const).map((item) => <button className={operation === item ? "active" : ""} onClick={() => setOperation(item)} key={item}>{item}</button>)}</div><div className="search-fields"><label><span>TIPO DE PROPIEDAD</span><select value={type} onChange={(e) => setType(e.target.value)}><option>Todos</option><option>Casa</option><option>Departamento</option><option>PH</option><option>Terreno</option></select></label><label><span>UBICACIÓN</span><select value={zone} onChange={(e) => setZone(e.target.value)}><option>Todas</option><option>CABA</option><option>Zona Norte</option></select></label><button className="search-button" onClick={runSearch}>Buscar <span>→</span></button></div></div><div className="hero-index"><span>01</span><i /><span>06</span></div></section>

    <section className="intro" id="nosotros"><div><p className="section-label">Nuestra mirada</p><span className="accent-dot" /></div><div><h2>Menos propiedades.<br /><em>Mejores decisiones.</em></h2><p>Combinamos conocimiento del mercado, sensibilidad arquitectónica y atención personal para encontrar hogares que realmente valen la pena.</p></div><div className="intro-stats"><strong>12+</strong><span>años conectando<br />personas y lugares</span></div></section>

    <section className="properties-section" id="propiedades"><div className="section-heading"><div><p className="section-label">Colección seleccionada</p><h2>{searched ? `${visible.length} resultados` : "Propiedades destacadas"}</h2></div><a href="#propiedades">Ver todas <span>↗</span></a></div><div className="filter-row">{(["Venta", "Alquiler"] as const).map(item => <button key={item} className={operation === item ? "active" : ""} onClick={() => setOperation(item)}>{item}</button>)}<span>{visible.length} propiedades</span></div><div className="property-grid">{visible.length ? visible.map((property) => <PropertyCard key={property.id} property={property} />) : <div className="empty-state"><strong>No encontramos coincidencias.</strong><p>Probá ampliando la ubicación o el tipo de propiedad.</p></div>}</div></section>

    <section className="manifesto"><div className="manifesto-image"><img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85" alt="Arquitectura residencial" /><span>Desde 2013</span></div><div className="manifesto-copy"><p className="section-label">Otra forma de hacer inmobiliaria</p><h2>Tu próximo capítulo empieza en el lugar correcto.</h2><p>No mostramos metros cuadrados: entendemos proyectos de vida. Cada búsqueda empieza escuchando y termina cuando las llaves están en tus manos.</p><a href="#contacto" className="text-link">Conocé cómo trabajamos <span>↗</span></a><div className="metrics"><div><strong>480</strong><span>operaciones acompañadas</span></div><div><strong>96%</strong><span>de clientes nos recomiendan</span></div></div></div></section>

    <section className="services" id="servicios"><div className="section-heading"><div><p className="section-label">Servicios</p><h2>Un equipo. Todo resuelto.</h2></div></div><div className="service-list">{[['01','Comprar','Búsqueda personalizada, negociación y acompañamiento legal.'],['02','Vender','Tasación estratégica, producción visual y difusión dirigida.'],['03','Alquilar','Selección, documentación y gestión clara para ambas partes.'],['04','Invertir','Análisis de oportunidades con criterio patrimonial y proyección.']].map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p><b>↗</b></article>)}</div></section>

    <section className="contact" id="contacto"><div><p className="section-label">Conversemos</p><h2>¿Buscás algo<br />especial?</h2><p>Contanos qué tenés en mente. Nosotros empezamos a buscar.</p></div><a href="https://wa.me/5491100000000" target="_blank" rel="noreferrer">Escribir por WhatsApp <span>↗</span></a></section>
    <footer><Brand /><div><a href="#propiedades">Propiedades</a><a href="#servicios">Servicios</a><a href="#contacto">Contacto</a><Link href="/admin">Administración</Link></div><p>© 2026 Áurea Propiedades · Buenos Aires</p></footer>
  </main>;
}
