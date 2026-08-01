import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, properties } from "../../properties";

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);
  if (!property) notFound();
  return <main className="detail-page">
    <header className="detail-header"><Link className="brand" href="/"><span className="brand-mark">A</span><span>ÁUREA<small>PROPIEDADES</small></span></Link><Link href="/#propiedades">← Volver</Link></header>
    <section className="detail-hero"><img src={property.image} alt={property.title} /><div className="detail-title"><p className="eyebrow">{property.operation} · {property.location}</p><h1>{property.title}</h1><strong>{formatPrice(property)}</strong></div></section>
    <section className="detail-body"><div className="detail-main"><div className="detail-facts"><span><b>{property.rooms}</b> ambientes</span><span><b>{property.bedrooms}</b> dormitorios</span><span><b>{property.bathrooms}</b> baños</span><span><b>{property.area}</b> m²</span></div><p className="section-label">La propiedad</p><h2>Un espacio pensado para vivir bien.</h2><p className="detail-description">{property.description}</p><div className="amenities">{property.amenities.map(item => <span key={item}>✓ {item}</span>)}</div></div><aside className="contact-card"><p className="section-label">Coordiná una visita</p><h3>¿Querés conocerla?</h3><p>Dejanos tu consulta y un asesor se comunicará con vos.</p><input aria-label="Nombre" placeholder="Nombre" /><input aria-label="Teléfono" placeholder="Teléfono" /><input aria-label="Correo electrónico" placeholder="Correo electrónico" type="email" /><textarea aria-label="Mensaje" defaultValue={`Hola, me interesa ${property.title}.`} /><button>Enviar consulta →</button><a href="https://wa.me/5491100000000">Consultar por WhatsApp</a></aside></section>
  </main>;
}
