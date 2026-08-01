"use client";

import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Crosshair, Heart, House, KeyRound, ScanEye, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice, type Property } from "./properties";
import { SiteFooter, SiteHeader } from "./site-chrome";
import { siteAsset } from "./site-path";

type IconKind = "home" | "key" | "chart" | "compass" | "shield" | "eye";
const iconMap: Record<IconKind, LucideIcon> = { home: House, key: KeyRound, chart: TrendingUp, compass: Crosshair, shield: ShieldCheck, eye: ScanEye };
function CustomIcon({ kind }: { kind: IconKind }) { const Icon = iconMap[kind]; return <span className={`custom-icon icon-${kind}`} aria-hidden="true"><Icon strokeWidth={1.8}/></span>; }
type SearchDropdownProps = { label: string; value: string; options: string[]; onChange: (value: string) => void };
function SearchDropdown({ label, value, options, onChange }: SearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (root.current && !root.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const choose = (option: string) => { onChange(option); setOpen(false); };
  return <div className={"search-dropdown " + (open ? "open" : "")} ref={root}>
    <button className="search-dropdown-trigger" type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(current => !current)} onKeyDown={event => { if (event.key === "Escape") setOpen(false); if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); } }}>
      <span><small>{label}</small><b>{value}</b></span><ChevronDown aria-hidden="true" strokeWidth={1.8}/>
    </button>
    {open && <div className="search-dropdown-menu" role="listbox" aria-label={label}>{options.map(option => <button type="button" role="option" aria-selected={option === value} className={option === value ? "selected" : ""} key={option} onClick={() => choose(option)}><span>{option}</span>{option === value && <Check aria-hidden="true" strokeWidth={2.2}/>}</button>)}</div>}
  </div>;
}


export function PropertyCard({ property, index }: { property: Property; index: number }) {
  const [favorite, setFavorite] = useState(false);
  return <article className="property-card reveal-card"><div className="property-media"><Link className="property-media-link" href={`/propiedades/${property.slug}`} aria-label={`Ver detalle de ${property.title}`}><img src={property.image} alt={property.title}/><span className="card-index">{String(index + 1).padStart(2,"0")}</span><span className="property-tag">{property.operation}</span></Link><button aria-label="Guardar propiedad" className={`favorite ${favorite ? "active" : ""}`} onClick={()=>setFavorite(!favorite)} type="button"><Heart className="favorite-icon" aria-hidden="true" strokeWidth={1.8} fill={favorite ? "currentColor" : "none"}/></button></div><div className="property-copy"><div className="card-location"><span>{property.type}</span><span>{property.location}</span></div><h3><Link href={`/propiedades/${property.slug}`}>{property.title}</Link></h3><div className="property-data"><div><b>{property.rooms}</b><span>Amb.</span></div><div><b>{property.bedrooms}</b><span>Dorm.</span></div><div><b>{property.area}</b><span>m2</span></div></div><div className="property-footer"><strong>{formatPrice(property)}</strong><Link className="round-arrow" href={`/propiedades/${property.slug}`}><ArrowUpRight className="mini-arrow" aria-hidden="true"/></Link></div></div></article>;
}

const services: {icon:IconKind; title:string; text:string; href:string}[] = [
  {icon:"home",title:"Compra y venta",text:"Una seleccion precisa, una narrativa visual potente y negociacion de punta a punta.",href:"/servicios"},
  {icon:"key",title:"Alquileres",text:"Busqueda, evaluacion, documentacion y gestion para entrar con tranquilidad.",href:"/propiedades"},
  {icon:"chart",title:"Inversion",text:"Lectura de mercado, renta esperada y potencial de valorizacion de cada activo.",href:"/servicios"},
  {icon:"compass",title:"Tasaciones",text:"Valor real respaldado por comparables, contexto y conocimiento territorial.",href:"/tasacion"}
];


const testimonials = [
  { quote: "Entendieron lo que buscábamos antes que nosotros. La experiencia fue clara, cálida y mucho más simple de lo esperado.", author: "CAROLINA Y MARTÍN", role: "COMPRADORES / SAN ISIDRO" },
  { quote: "Presentaron nuestra casa con una sensibilidad increíble y cuidaron cada conversación. Vendimos bien y sin sentir que perdíamos el control.", author: "LUCÍA FERNÁNDEZ", role: "PROPIETARIA / PALERMO" },
  { quote: "No me mostraron cantidad: me mostraron criterio. Encontramos una inversión sólida y entendí cada decisión antes de avanzar.", author: "MARTÍN ROSSI", role: "INVERSOR / ZONA NORTE" },
  { quote: "Desde la primera visita hasta la firma todo fue ordenado, humano y transparente. Áurea hizo que una decisión enorme se sintiera liviana.", author: "SOFÍA Y TOMÁS", role: "COMPRADORES / NORDELTA" }
];
const testimonialOrbitText = "VOCES REALES · TESTIMONIOS · ";
function MetricCounter({ value, suffix }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const element = useRef<HTMLElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    let frame = 0;

    const run = () => {
      if (started.current) return;
      started.current = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplay(value);
        return;
      }
      const duration = 1550;
      const start = performance.now();
      const tick = (time: number) => {
        const progress = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(value * eased));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        run();
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(node);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [value]);

  return <strong ref={element} aria-label={`${value}${suffix ?? ""}`}>{display}{suffix && <span>{suffix}</span>}</strong>;
}
export function HomeExperience({ properties }: { properties: Property[] }) {
  const [operation,setOperation]=useState("Venta"); const [type,setType]=useState("Todos"); const [zone,setZone]=useState("Todas");
  const [testimonialIndex,setTestimonialIndex]=useState(0);
  useEffect(()=>{ const timer=window.setInterval(()=>setTestimonialIndex(current=>(current+1)%testimonials.length),7500); return()=>window.clearInterval(timer); },[]);
  const previousTestimonial=()=>setTestimonialIndex(current=>(current-1+testimonials.length)%testimonials.length);
  const nextTestimonial=()=>setTestimonialIndex(current=>(current+1)%testimonials.length);
  const visible=useMemo(()=>properties.filter(p=>p.operation===operation&&(type==="Todos"||p.type===type)&&(zone==="Todas"||p.zone===zone)),[operation,type,zone,properties]);
  const runSearch=()=>document.getElementById("propiedades")?.scrollIntoView({behavior:"smooth"});
  return <main className="vian-site"><SiteHeader/>
    <section className="vian-hero"><img className="vian-hero-image" src={siteAsset("/assets/aurea-hero-vian.png")} alt="Residencia contemporanea seleccionada por Aurea"/><div className="vian-hero-shade"/><div className="vian-hero-copy"><p className="pill-label"><i/> INMOBILIARIA BOUTIQUE</p><h1>Espacios excepcionales,<br/><span>guiados por tu forma de vivir.</span></h1><p className="hero-description">Seleccionamos propiedades con arquitectura, ubicaci&oacute;n y valor real. Te acompa&ntilde;amos con criterio desde la primera visita hasta la firma.</p><Link href="/propiedades" className="lime-button">Explorar propiedades <ArrowUpRight className="mini-arrow" aria-hidden="true"/></Link></div><aside className="core-card"><div><p>VALOR CENTRAL</p><h2>Elegir bien cambia todo.</h2><Link href="/nosotros">Nuestro enfoque <ArrowUpRight className="mini-arrow" aria-hidden="true"/></Link></div><img src={siteAsset("/assets/aurea-core-values.png")} alt="Maqueta arquitectonica Aurea"/></aside><div className="hero-scroll"><span>SCROLL</span><i/></div></section>
    <section className="floating-search"><div className="search-title"><CustomIcon kind="compass"/><div><span>BUSQUEDA PERSONALIZADA</span><b>Encontr&aacute; tu lugar</b></div></div><div className="operation-tabs">{(["Venta","Alquiler"] as const).map(item=><button className={operation===item?"active":""} onClick={()=>setOperation(item)} key={item}>{item}</button>)}</div><SearchDropdown label="TIPO DE PROPIEDAD" value={type} options={["Todos","Casa","Departamento","PH","Terreno"]} onChange={setType}/><SearchDropdown label="ZONA" value={zone} options={["Todas","CABA","Zona Norte"]} onChange={setZone}/><button className="search-button" onClick={runSearch}>Buscar <ArrowUpRight className="mini-arrow" aria-hidden="true"/></button></section>
    <section className="vian-intro"><div className="section-tag">01 / NUESTRA MIRADA</div><div><h2>Propiedades que se sienten bien <span>antes de entrar.</span></h2><p>No publicamos por volumen. Curamos una cartera acotada y acompa&ntilde;amos cada operaci&oacute;n con informaci&oacute;n clara, sensibilidad arquitect&oacute;nica y estrategia comercial.</p></div><div className="intro-badge"><strong>12</strong><span>A&Ntilde;OS<br/>DE EXPERIENCIA</span></div></section>
    <section className="approach-section"><div className="approach-image"><img src={siteAsset("/assets/aurea-core-values.png")} alt="Modelo 3D de vivienda contemporanea"/><span className="floating-dot dot-one"/><span className="floating-dot dot-two"/></div><div className="approach-copy"><p className="pill-label dark"><i/> LO QUE NOS DIFERENCIA</p><h2>Menos ruido.<br/>Mejores decisiones.</h2><p>Combinamos tecnolog&iacute;a, criterio humano y conocimiento de Buenos Aires para que cada paso tenga sentido.</p><div className="benefit-list"><article><CustomIcon kind="eye"/><div><h3>Curadur&iacute;a real</h3><p>Solo activos que superan nuestros criterios de ubicaci&oacute;n, estado y potencial.</p></div></article><article><CustomIcon kind="shield"/><div><h3>Proceso sin fricci&oacute;n</h3><p>Documentaci&oacute;n, negociaci&oacute;n y seguimiento en una sola experiencia.</p></div></article><article><CustomIcon kind="chart"/><div><h3>Valor a largo plazo</h3><p>Miramos m&aacute;s all&aacute; del precio para proteger tu decisi&oacute;n patrimonial.</p></div></article></div><Link href="/nosotros" className="text-link">Conoc&eacute; c&oacute;mo trabajamos <ArrowUpRight className="mini-arrow" aria-hidden="true"/></Link></div></section>
    <section className="vian-services"><div className="vian-section-head"><div><span className="section-tag">02 / SERVICIOS</span><h2>Todo lo que necesit&aacute;s,<br/>en un mismo equipo.</h2></div><Link href="/servicios" className="outline-button">Ver todos los servicios <ArrowUpRight className="mini-arrow" aria-hidden="true"/></Link></div><div className="service-grid">{services.map((service,index)=><article key={service.title}><div className="service-number">0{index+1}</div><CustomIcon kind={service.icon}/><h3>{service.title}</h3><p>{service.text}</p><Link href={service.href} className="round-arrow"><ArrowUpRight className="mini-arrow" aria-hidden="true"/></Link></article>)}</div></section>
    <section className="properties-section" id="propiedades"><div className="vian-section-head"><div><span className="section-tag">03 / PROPIEDADES DESTACADAS</span><h2>Lugares para vivir.<br/>Activos para crecer.</h2></div><div className="property-head-actions"><div className="filter-row">{(["Venta","Alquiler"] as const).map(item=><button key={item} className={operation===item?"active":""} onClick={()=>setOperation(item)}>{item}</button>)}</div><Link href="/propiedades" className="outline-button">Ver las 16 <ArrowUpRight className="mini-arrow" aria-hidden="true"/></Link></div></div><div className="property-grid">{visible.slice(0,6).map((p,i)=><PropertyCard key={p.id} property={p} index={i}/>)}</div></section>
    <section className="metrics-section"><div className="metrics-image"><img src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=88" alt="Arquitectura residencial contemporanea"/><div><p>NUESTRO COMPROMISO</p><h2>Resultados que construyen confianza.</h2></div></div><div className="metrics-grid"><article><MetricCounter value={480} suffix="+"/><p>Operaciones acompa&ntilde;adas</p></article><article><MetricCounter value={96} suffix="%"/><p>Clientes que nos recomiendan</p></article><article><MetricCounter value={24} suffix="h"/><p>Tiempo medio de respuesta</p></article><article><MetricCounter value={16}/><p>Propiedades activas hoy</p></article></div></section>
    <section className="process-section"><div className="vian-section-head"><div><span className="section-tag">04 / UN PROCESO CLARO</span><h2>De la idea a las llaves,<br/>sin vueltas.</h2></div></div><div className="process-cards"><article><span>01</span><CustomIcon kind="compass"/><h3>Diagn&oacute;stico</h3><p>Entendemos tu momento, presupuesto y objetivo.</p></article><article><span>02</span><CustomIcon kind="eye"/><h3>Selecci&oacute;n</h3><p>Filtramos oportunidades y organizamos recorridos.</p></article><article><span>03</span><CustomIcon kind="chart"/><h3>Negociaci&oacute;n</h3><p>Definimos estrategia, oferta y condiciones.</p></article><article><span>04</span><CustomIcon kind="key"/><h3>Cierre</h3><p>Coordinamos cada documento hasta la entrega.</p></article></div></section>
    <section className="testimonial-section testimonial-carousel"><div className="testimonial-orbit" aria-hidden="true"><span className="testimonial-orbit-text">{testimonialOrbitText.split("").map((char,index)=><i key={char+"-"+index} style={{transform:"rotate("+(index*(360/testimonialOrbitText.length))+"deg)"}}>{char===" "?"\u00a0":char}</i>)}</span><span className="testimonial-orbit-core"><img src={siteAsset("/assets/aurea-hero-vian.png")} alt=""/><b>&ldquo;</b></span></div><p className="testimonial-kicker">CLIENTES / EXPERIENCIAS / CONFIANZA</p><div className="testimonial-slide" key={testimonialIndex}><blockquote>{testimonials[testimonialIndex].quote}</blockquote><div className="quote-author"><b>{testimonials[testimonialIndex].author}</b><span>{testimonials[testimonialIndex].role}</span></div></div><div className="testimonial-controls"><button type="button" onClick={previousTestimonial} aria-label="Testimonio anterior"><ChevronLeft aria-hidden="true"/></button><div>{testimonials.map((_,index)=><button type="button" key={index} className={index===testimonialIndex?"active":""} onClick={()=>setTestimonialIndex(index)} aria-label={"Ver testimonio "+(index+1)}/>)}</div><button type="button" onClick={nextTestimonial} aria-label="Testimonio siguiente"><ChevronRight aria-hidden="true"/></button></div></section>
    <section className="faq-section"><div><span className="section-tag">05 / PREGUNTAS FRECUENTES</span><h2>Todo claro desde el principio.</h2><p>Si tu pregunta no est&aacute; ac&aacute;, escribinos. Respondemos en menos de 24 horas.</p><Link className="lime-button" href="/contacto">Hablemos <ArrowUpRight className="mini-arrow" aria-hidden="true"/></Link></div><div className="faq-list"><details open><summary>Qu&eacute; necesito para empezar a buscar?<span/></summary><p>Con una zona aproximada, presupuesto y tipo de operaci&oacute;n alcanza para armar una primera selecci&oacute;n.</p></details><details><summary>C&oacute;mo realizan una tasaci&oacute;n?<span/></summary><p>Comparamos operaciones reales, oferta activa, estado, ubicaci&oacute;n y atributos particulares de la propiedad.</p></details><details><summary>Acompa&ntilde;an la negociaci&oacute;n y la firma?<span/></summary><p>S&iacute;. Coordinamos oferta, documentaci&oacute;n, escriban&iacute;a y seguimiento hasta la entrega de llaves.</p></details><details><summary>Puedo publicar mi propiedad con &Aacute;urea?<span/></summary><p>S&iacute;. Primero realizamos una visita, una evaluaci&oacute;n comercial y una propuesta de presentaci&oacute;n.</p></details></div></section>
    <section className="vian-contact"><div><p>HAGAMOS ALGO EXTRAORDINARIO</p><h2>Tu pr&oacute;ximo lugar<br/>empieza con una charla.</h2></div><Link href="/contacto" className="giant-arrow"><ArrowUpRight className="mini-arrow" aria-hidden="true"/></Link></section><SiteFooter/></main>;
}