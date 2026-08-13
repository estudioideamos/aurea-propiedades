import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Bath, BedDouble, CalendarDays, CarFront, Check, Home, MapPin, Maximize2, Play, Ruler, Sparkles } from "lucide-react";
import { formatExpenses, formatPrice, properties as staticProperties } from "../../properties";
import { getLiveProperty } from "../../live-properties";
import { SiteFooter, SiteHeader } from "../../site-chrome";
import { siteAsset } from "../../site-path";
import { PropertyActions } from "./property-actions";
import { PropertyGallery } from "./property-gallery";
import { PropertyInquiryForm } from "./property-inquiry-form";
import "./property-inquiry.css";

const galleryPool=[
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=86",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=86",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=86",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1600&q=86",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=86"
];

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://inmobiliaria.ideamos.ar").replace(/\/$/, "");
const absoluteImage = (image: string) => /^https?:\/\//i.test(image) ? image : `${siteUrl}${image.startsWith("/") ? image : `/${image}`}`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { property } = await getLiveProperty(slug);
  if (!property) return { title: "Propiedad no encontrada | Ideamos Propiedades" };
  const title = `${property.title} | Ideamos Propiedades`;
  const description = `${property.type} en ${property.location}. ${formatPrice(property)}. Conoc\u00e9 sus caracter\u00edsticas, galer\u00eda y ubicaci\u00f3n.`;
  const url = `${siteUrl}/propiedades/${property.slug}`;
  const image = absoluteImage(property.image);
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Ideamos Propiedades", locale: "es_AR", type: "website", images: [{ url: image, alt: property.title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export function generateStaticParams() {
  return staticProperties.map(({ slug }) => ({ slug }));
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { property, all: properties } = await getLiveProperty(slug);
  if(!property) notFound();
  const managedGallery = (property.gallery ?? []).filter(image => image && image !== property.image);
  const gallery = managedGallery.length ? [property.image, ...managedGallery] : [property.image, ...Array.from({length:4},(_,i)=>galleryPool[(property.id+i)%galleryPool.length])];
  const covered = property.coveredArea ?? (property.type === "Terreno" ? 0 : Math.round(property.area * .84));
  const garage = property.garages ?? (property.type === "Departamento" ? 1 : property.type === "Casa" ? 2 : 1);
  const rawAge = property.age || (property.id % 3 === 0 ? "A estrenar" : `${4 + property.id} a\u00f1os`);
  const age = rawAge.replace(/a(?:nos|\u00f1os)/gi, "a\u00f1os");
  const related=properties.filter(item=>item.id!==property.id&&(item.zone===property.zone||item.type===property.type)).slice(0,3);
  const mapUrl=`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`;
  return <main className="detail-page premium-detail"><SiteHeader/>
    <section className="detail-intro"><div className="detail-breadcrumb"><Link href="/">Inicio</Link><span>/</span><Link href="/propiedades">Propiedades</Link><span>/</span><b>{property.title}</b></div><div className="detail-intro-grid"><div><div className="detail-pills"><span>{property.operation}</span><span>Destacada</span></div><h1>{property.title}</h1><p><MapPin aria-hidden="true" strokeWidth={1.8}/>{property.location}</p></div><div className="detail-price"><small>VALOR DE PUBLICACION</small><strong>{formatPrice(property)}</strong>{formatExpenses(property)&&<em className="detail-expenses">Expensas {formatExpenses(property)}</em>}<span>Ref. AUR-{String(property.id).padStart(4,"0")}</span></div></div><PropertyActions title={property.title}/></section>
    <PropertyGallery images={gallery} title={property.title}/>
    <section className="property-overview"><article><Home aria-hidden="true" strokeWidth={1.7}/><span>TIPO</span><b>{property.type}</b></article><article><BedDouble aria-hidden="true" strokeWidth={1.7}/><span>DORMITORIOS</span><b>{property.bedrooms}</b></article><article><Bath aria-hidden="true" strokeWidth={1.7}/><span>BA&Ntilde;OS</span><b>{property.bathrooms}</b></article><article><Maximize2 aria-hidden="true" strokeWidth={1.7}/><span>SUPERFICIE</span><b>{property.area} m2</b></article><article><CarFront aria-hidden="true" strokeWidth={1.7}/><span>COCHERAS</span><b>{garage}</b></article><article><CalendarDays aria-hidden="true" strokeWidth={1.7}/><span>ANTIGUEDAD</span><b>{age}</b></article></section>
    <section className="detail-layout"><div className="detail-content">
      <section className="detail-block description-block"><p className="detail-block-label">01 / DESCRIPCI&Oacute;N</p><h2>Un espacio pensado<br/>para vivir bien.</h2><p>{property.description} La propuesta combina una distribuci&oacute;n funcional, buena entrada de luz y ambientes preparados para disfrutar todos los d&iacute;as. Su ubicaci&oacute;n permite acceder con facilidad a servicios, espacios verdes y los principales corredores de la zona.</p><p>Una propiedad seleccionada por Ideamos por su equilibrio entre arquitectura, calidad constructiva y potencial de valor.</p></section>
      <section className="detail-block"><div className="detail-block-head"><div><p className="detail-block-label">02 / RESUMEN GENERAL</p><h2>Datos principales</h2></div><Ruler aria-hidden="true" strokeWidth={1.5}/></div><div className="detail-data-grid"><div><span>ID DE PROPIEDAD</span><b>AUR-{String(property.id).padStart(4,"0")}</b></div><div><span>OPERACION</span><b>{property.operation}</b></div><div><span>TIPO</span><b>{property.type}</b></div><div><span>AMBIENTES</span><b>{property.rooms}</b></div><div><span>DORMITORIOS</span><b>{property.bedrooms}</b></div><div><span>BA&Ntilde;OS</span><b>{property.bathrooms}</b></div><div><span>SUPERFICIE CUBIERTA</span><b>{covered?`${covered} m2`:"A definir"}</b></div><div><span>SUPERFICIE TOTAL</span><b>{property.area} m2</b></div><div><span>COCHERAS</span><b>{garage}</b></div><div><span>ANTIGUEDAD</span><b>{age}</b></div><div><span>ESTADO</span><b>{property.condition || "Excelente"}</b></div><div><span>ORIENTACION</span><b>{property.orientation || "Norte"}</b></div>{formatExpenses(property)&&<div className="detail-data-expenses"><span>EXPENSAS MENSUALES</span><b>{formatExpenses(property)}</b></div>}</div></section>
      <section className="detail-block"><div className="detail-block-head"><div><p className="detail-block-label">03 / CARACTERISTICAS</p><h2>Comodidades</h2></div><Sparkles aria-hidden="true" strokeWidth={1.5}/></div><div className="feature-grid">{property.amenities.map(item=><span key={item}><i><Check aria-hidden="true" strokeWidth={2}/></i>{item}</span>)}<span><i><Check aria-hidden="true" strokeWidth={2}/></i>Excelente luminosidad</span><span><i><Check aria-hidden="true" strokeWidth={2}/></i>Entorno consolidado</span><span><i><Check aria-hidden="true" strokeWidth={2}/></i>Acceso a servicios</span></div></section>
      <section className="detail-tour"><img src={gallery[2]} alt={`Recorrido de ${property.title}`}/><div><p>04 / RECORRIDO</p><h2>Conocela en detalle.</h2><a href={`https://wa.me/541155550190?text=${encodeURIComponent(`Hola, quisiera solicitar el video de ${property.title}.`)}`} target="_blank" rel="noreferrer"><Play aria-hidden="true" fill="currentColor"/> Solicitar video</a></div></section>
      <section className="detail-block location-block"><div className="detail-block-head"><div><p className="detail-block-label">05 / UBICACI&Oacute;N</p><h2>{property.location}</h2></div><MapPin aria-hidden="true" strokeWidth={1.5}/></div><iframe title={`Mapa de ${property.location}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/></section>
    </div><aside className="detail-sidebar"><div className="contact-card premium-contact"><p className="detail-block-label">COORDIN&Aacute; UNA VISITA</p><h3>&iquest;Quer&eacute;s conocerla?</h3><p>Dejanos tus datos y un asesor especializado te contacta dentro de las pr&oacute;ximas 24 horas.</p><PropertyInquiryForm propertyId={property.id} propertyTitle={property.title}/><a href={`https://wa.me/541155550190?text=${encodeURIComponent(`Hola, me interesa ${property.title}.`)}`} target="_blank" rel="noreferrer"><img src={siteAsset("/assets/whatsapp.svg")} alt="" aria-hidden="true"/> Consultar por WhatsApp</a></div><div className="detail-advisor"><span>ASESOR DE LA PROPIEDAD</span><div className="advisor-avatar">AP</div><h4>Equipo Ideamos</h4><p>Especialistas en {property.zone}</p><a href="tel:+541155550190">+54 11 5555 0190</a></div></aside></section>
    <section className="related-section"><div className="related-heading"><div><p>06 / TAMBIEN PUEDE INTERESARTE</p><h2>Propiedades relacionadas</h2></div><Link href="/propiedades">Ver todas <ArrowUpRight aria-hidden="true" strokeWidth={1.8}/></Link></div><div className="related-grid">{related.map(item=><article key={item.id}><Link href={`/propiedades/${item.slug}`} className="related-image"><img src={item.image} alt={item.title}/><span>{item.operation}</span></Link><div><p>{item.type} / {item.location}</p><h3><Link href={`/propiedades/${item.slug}`}>{item.title}</Link></h3><strong>{formatPrice(item)}</strong></div></article>)}</div></section><SiteFooter/></main>;
}