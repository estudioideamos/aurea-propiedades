"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice, type Property } from "./properties";

function Brand() {
  return <Link className="brand" href="/" aria-label="Ãurea Propiedades, inicio"><span className="brand-mark">A</span><span>ÃUREA<small>PROPIEDADES</small></span></Link>;
}

function PropertyCard({ property }: { property: Property }) {
  const [favorite, setFavorite] = useState(false);
  return <article className="property-card">
    <div className="property-media"><img src={property.image} alt={property.title} /><span className="property-number">A.{String(property.id).padStart(2, "0")}</span><span className="property-tag">{property.operation}</span><button className={`favorite ${favorite ? "active" : ""}`} onClick={() => setFavorite(!favorite)} aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"} type="button">{favorite ? "â™¥" : "â™¡"}</button></div>
    <div className="property-copy"><p className="eyebrow">{property.type} Â· {property.location}</p><h3><Link href={`/propiedades/${property.slug}`}>{property.title}</Link></h3><div className="property-meta"><span>{property.rooms} amb.</span><span>{property.bedrooms} dorm.</span><span>{property.area} mÂ²</span></div><div className="property-footer"><strong>{formatPrice(property)}</strong><Link href={`/propiedades/${property.slug}`} aria-label={`Ver ${property.title}`}><span>Explorar</span> â†—</Link></div></div>
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
    <div className="top-rail"><span>ESTUDIO INMOBILIARIO â€” BUENOS AIRES</span><span>CURADURÃA Â· ESTRATEGIA Â· RESULTADOS</span></div><header className="site-header"><Brand /><button className="menu-toggle" onClick={() => setMenu(!menu)} aria-label="Abrir menÃº">{menu ? "Ã—" : "â˜°"}</button><nav className={menu ? "open" : ""}><a href="#propiedades">Propiedades</a><a href="#servicios">Servicios</a><a href="#nosotros">Nosotros</a><a href="#contacto">Contacto</a></nav><a className="header-action" href="#contacto">TasÃ¡ tu propiedad <span>â†—</span></a></header>

    <section className="hero"><img className="hero-image" src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2200&q=90" alt="Interior contemporÃ¡neo y luminoso" /><div className="hero-shade" /><div className="hero-grid" aria-hidden="true"><i /><i /><i /><i /></div><div className="hero-copy"><p className="hero-kicker"><span>01</span> Inmuebles de autor Â· Buenos Aires</p><h1>Espacios que<br /><em>marcan una Ã©poca.</em></h1><p>Una colecciÃ³n precisa de propiedades excepcionales. Arquitectura, ubicaciÃ³n y valor sostenido en el tiempo.</p></div><aside className="hero-feature"><span>A / 01</span><p>Propiedad destacada</p><strong>Casa del Lago</strong><small>Nordelta Â· 310 mÂ²</small><a href="/propiedades/casa-del-lago-nordelta">Descubrir â†—</a></aside><div className="search-panel" aria-label="Buscar propiedades"><div className="operation-tabs">{(["Venta", "Alquiler"] as const).map((item) => <button className={operation === item ? "active" : ""} onClick={() => setOperation(item)} key={item}>{item}</button>)}</div><div className="search-fields"><label><span>TIPO DE PROPIEDAD</span><select value={type} onChange={(e) => setType(e.target.value)}><option>Todos</option><option>Casa</option><option>Departamento</option><option>PH</option><option>Terreno</option></select></label><label><span>UBICACIÃ“N</span><select value={zone} onChange={(e) => setZone(e.target.value)}><option>Todas</option><option>CABA</option><option>Zona Norte</option></select></label><button className="search-button" onClick={runSearch}>Buscar <span>â†’</span></button></div></div><div className="hero-index"><span>01</span><i /><span>06</span></div></section><div className="marquee-band" aria-hidden="true"><div><span>COMPRAR</span><b>✦</b><span>VENDER</span><b>✦</b><span>INVERTIR</span><b>✦</b><span>ALQUILAR</span><b>✦</b><span>COMPRAR</span><b>✦</b><span>VENDER</span><b>✦</b><span>INVERTIR</span><b>✦</b><span>ALQUILAR</span></div></div>

    <section className="intro" id="nosotros"><div><p className="section-label">Nuestra mirada</p><span className="accent-dot" /></div><div><h2>Curamos patrimonio.<br /><em>Construimos confianza.</em></h2><p>Combinamos conocimiento del mercado, sensibilidad arquitectÃ³nica y atenciÃ³n personal para encontrar hogares que realmente valen la pena.</p></div><div className="intro-stats"><strong>12+</strong><span>aÃ±os conectando<br />personas y lugares</span></div></section>

    <section className="properties-section" id="propiedades"><div className="section-heading"><div><p className="section-label">Portfolio privado</p><h2>{searched ? `${visible.length} resultados` : "Activos destacados"}</h2></div><a href="#propiedades">Ver todas <span>â†—</span></a></div><div className="filter-row">{(["Venta", "Alquiler"] as const).map(item => <button key={item} className={operation === item ? "active" : ""} onClick={() => setOperation(item)}>{item}</button>)}<span>{visible.length} propiedades</span></div><div className="property-grid">{visible.length ? visible.map((property) => <PropertyCard key={property.id} property={property} />) : <div className="empty-state"><strong>No encontramos coincidencias.</strong><p>ProbÃ¡ ampliando la ubicaciÃ³n o el tipo de propiedad.</p></div>}</div></section>

    <section className="manifesto"><div className="manifesto-image"><img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85" alt="Arquitectura residencial" /><span>Desde 2013</span></div><div className="manifesto-copy"><p className="section-label">Otra forma de hacer inmobiliaria</p><h2>Tu prÃ³ximo capÃ­tulo empieza en el lugar correcto.</h2><p>No mostramos metros cuadrados: entendemos proyectos de vida. Cada bÃºsqueda empieza escuchando y termina cuando las llaves estÃ¡n en tus manos.</p><a href="#contacto" className="text-link">ConocÃ© cÃ³mo trabajamos <span>â†—</span></a><div className="metrics"><div><strong>480</strong><span>operaciones acompaÃ±adas</span></div><div><strong>96%</strong><span>de clientes nos recomiendan</span></div></div></div></section>

    <section className="services" id="servicios"><div className="section-heading"><div><p className="section-label">Servicios</p><h2>Estrategia inmobiliaria integral.</h2></div></div><div className="service-list">{[['01','Comprar','BÃºsqueda personalizada, negociaciÃ³n y acompaÃ±amiento legal.'],['02','Vender','TasaciÃ³n estratÃ©gica, producciÃ³n visual y difusiÃ³n dirigida.'],['03','Alquilar','SelecciÃ³n, documentaciÃ³n y gestiÃ³n clara para ambas partes.'],['04','Invertir','AnÃ¡lisis de oportunidades con criterio patrimonial y proyecciÃ³n.']].map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p><b>â†—</b></article>)}</div></section>

    <section className="contact" id="contacto"><div><p className="section-label">Conversemos</p><h2>Â¿BuscÃ¡s algo<br />especial?</h2><p>Contanos quÃ© tenÃ©s en mente. Nosotros empezamos a buscar.</p></div><a href="https://wa.me/5491100000000" target="_blank" rel="noreferrer">Escribir por WhatsApp <span>â†—</span></a></section>
    <footer><Brand /><div><a href="#propiedades">Propiedades</a><a href="#servicios">Servicios</a><a href="#contacto">Contacto</a><Link href="/admin">AdministraciÃ³n</Link></div><p>Â© 2026 Ãurea Propiedades Â· Buenos Aires</p></footer>
  </main>;
}
