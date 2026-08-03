import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Building2, CalendarDays, Check, Layers3, MapPin, ParkingCircle, Ruler, Sparkles } from "lucide-react";
import { developments as staticDevelopments, formatDevelopmentPrice } from "../../developments";
import { getLiveDevelopment } from "../../live-developments";
import { PropertyGallery } from "../../propiedades/[slug]/property-gallery";
import { SiteFooter, SiteHeader } from "../../site-chrome";
import { siteAsset } from "../../site-path";

export function generateStaticParams() {
  return staticDevelopments.map(({ slug }) => ({ slug }));
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function DevelopmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { development, all } = await getLiveDevelopment(slug);
  if (!development) notFound();
  const related = all.filter(item => item.id !== development.id).slice(0, 3);
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(development.location)}&output=embed`;

  return <main className="detail-page premium-detail development-detail"><SiteHeader/>
    <section className="detail-intro"><div className="detail-breadcrumb"><Link href="/">Inicio</Link><span>/</span><Link href="/emprendimientos">Emprendimientos</Link><span>/</span><b>{development.title}</b></div><div className="detail-intro-grid"><div><div className="detail-pills"><span>{development.status}</span><span>Emprendimiento</span></div><h1>{development.title}</h1><p><MapPin aria-hidden="true" strokeWidth={1.8}/>{development.location}</p></div><div className="detail-price"><small>VALOR DE PUBLICACI?N</small><strong>{formatDevelopmentPrice(development)}</strong><span>Entrega estimada / {development.delivery}</span></div></div></section>
    <PropertyGallery images={development.gallery} title={development.title}/>
    <section className="property-overview development-overview"><article><Layers3 aria-hidden="true" strokeWidth={1.7}/><span>UNIDADES</span><b>{development.units}</b></article><article><CalendarDays aria-hidden="true" strokeWidth={1.7}/><span>ENTREGA</span><b>{development.delivery}</b></article><article><Building2 aria-hidden="true" strokeWidth={1.7}/><span>ESCALA</span><b>{development.floors}</b></article><article><Ruler aria-hidden="true" strokeWidth={1.7}/><span>RESIDENCIAS</span><b>{development.apartments}</b></article><article><ParkingCircle aria-hidden="true" strokeWidth={1.7}/><span>COCHERAS</span><b>{development.garages}</b></article><article><Sparkles aria-hidden="true" strokeWidth={1.7}/><span>ESTADO</span><b>{development.status}</b></article></section>
    <section className="detail-layout"><div className="detail-content">
      <section className="detail-block description-block"><p className="detail-block-label">01 / EL PROYECTO</p><h2>Arquitectura para<br/>lo que viene.</h2>{development.description.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>
      <section className="detail-block"><div className="detail-block-head"><div><p className="detail-block-label">02 / INFORMACIÓN GENERAL</p><h2>Datos del desarrollo</h2></div><Building2 aria-hidden="true" strokeWidth={1.5}/></div><div className="detail-data-grid"><div><span>PROYECTO</span><b>{development.title}</b></div><div><span>TIPOLOGÍAS</span><b>{development.units}</b></div><div><span>ESTADO DE OBRA</span><b>{development.status}</b></div><div><span>ENTREGA ESTIMADA</span><b>{development.delivery}</b></div><div><span>CANTIDAD DE PISOS</span><b>{development.floors}</b></div><div><span>UNIDADES</span><b>{development.apartments}</b></div><div><span>COCHERAS</span><b>{development.garages}</b></div><div><span>DESARROLLADOR</span><b>{development.developer}</b></div><div><span>ARQUITECTURA</span><b>{development.architect}</b></div></div></section>
      <section className="detail-block"><div className="detail-block-head"><div><p className="detail-block-label">03 / ESPACIOS COMUNES</p><h2>Amenities para disfrutar</h2></div><Sparkles aria-hidden="true" strokeWidth={1.5}/></div><div className="feature-grid">{development.amenities.map(item=><span key={item}><i><Check aria-hidden="true" strokeWidth={2}/></i>{item}</span>)}</div></section>
      <section className="detail-block"><div className="detail-block-head"><div><p className="detail-block-label">04 / CALIDAD CONSTRUCTIVA</p><h2>Detalles que hacen la diferencia</h2></div><Ruler aria-hidden="true" strokeWidth={1.5}/></div><div className="feature-grid">{development.specifications.map(item=><span key={item}><i><Check aria-hidden="true" strokeWidth={2}/></i>{item}</span>)}</div></section>
      <section className="detail-tour development-experience"><img src={development.gallery[2]} alt={`Arquitectura de ${development.title}`}/><div><p>05 / EXPERIENCIA</p><h2>Una nueva forma<br/>de habitar.</h2><a href={`https://wa.me/541155550190?text=${encodeURIComponent(`Hola, quisiera recibir la presentación de ${development.title}.`)}`} target="_blank" rel="noreferrer"><ArrowUpRight aria-hidden="true"/> Solicitar brochure</a></div></section>
      <section className="detail-block location-block"><div className="detail-block-head"><div><p className="detail-block-label">06 / UBICACIÓN</p><h2>{development.location}</h2></div><MapPin aria-hidden="true" strokeWidth={1.5}/></div><iframe title={`Mapa de ${development.location}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/></section>
    </div><aside className="detail-sidebar"><div className="contact-card premium-contact"><p className="detail-block-label">RECIBÍ INFORMACIÓN</p><h3>¿Querés conocer el proyecto?</h3><p>Dejanos tus datos y te enviamos disponibilidad, planos, valores y forma de pago.</p><label><span>NOMBRE</span><input placeholder="Tu nombre"/></label><label><span>TELÉFONO</span><input placeholder="+54 9 11"/></label><label><span>EMAIL</span><input placeholder="nombre@email.com" type="email"/></label><label><span>MENSAJE</span><textarea defaultValue={`Hola, me interesa el emprendimiento ${development.title}.`}/></label><button type="button">Solicitar información <ArrowUpRight aria-hidden="true" strokeWidth={1.8}/></button><a href={`https://wa.me/541155550190?text=${encodeURIComponent(`Hola, me interesa el emprendimiento ${development.title}.`)}`} target="_blank" rel="noreferrer"><img src={siteAsset("/assets/whatsapp.svg")} alt="" aria-hidden="true"/> Consultar por WhatsApp</a></div><div className="detail-advisor"><span>ASESORAMIENTO EN EMPRENDIMIENTOS</span><div className="advisor-avatar">ID</div><h4>Equipo Ideamos</h4><p>Inversión y nuevos desarrollos</p><a href="tel:+541155550190">+54 11 5555 0190</a></div></aside></section>
    <section className="related-section"><div className="related-heading"><div><p>07 / OTRAS OPORTUNIDADES</p><h2>Emprendimientos relacionados</h2></div><Link href="/emprendimientos">Ver todos <ArrowUpRight aria-hidden="true" strokeWidth={1.8}/></Link></div><div className="related-grid">{related.map(item=><article key={item.id}><Link href={`/emprendimientos/${item.slug}`} className="related-image"><img src={item.image} alt={item.title}/><span>{item.status}</span></Link><div><p>{item.units} / {item.location}</p><h3><Link href={`/emprendimientos/${item.slug}`}>{item.title}</Link></h3><strong>{formatDevelopmentPrice(item)}</strong></div></article>)}</div></section><SiteFooter/>
  </main>;
}
