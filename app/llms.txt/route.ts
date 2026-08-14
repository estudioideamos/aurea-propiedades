import { formatDevelopmentPrice } from "../developments";
import { getLiveDevelopments } from "../live-developments";
import { getLiveProperties } from "../live-properties";
import { formatPrice } from "../properties";
import { absoluteUrl } from "../seo";

export const dynamic = "force-dynamic";
const clean = (value: string) => value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();

export async function GET() {
  const [properties, developments] = await Promise.all([getLiveProperties(), getLiveDevelopments()]);
  const propertyLinks = properties.map((property) =>
    `- [${clean(property.title)}](${absoluteUrl(`/propiedades/${property.slug}`)}): ${clean(property.type)} en ${clean(property.location)}. ${clean(property.operation)} por ${clean(formatPrice(property))}. ${property.rooms} ambientes, ${property.bedrooms} dormitorios y ${property.area} m².`,
  );
  const developmentLinks = developments.map((development) =>
    `- [${clean(development.title)}](${absoluteUrl(`/emprendimientos/${development.slug}`)}): ${clean(development.status)} en ${clean(development.location)}. ${clean(development.units)}. ${clean(formatDevelopmentPrice(development))}. Entrega ${clean(development.delivery)}.`,
  );
  const body = [
    "# Ideamos Propiedades", "",
    "> Inmobiliaria boutique de Buenos Aires especializada en propiedades seleccionadas, emprendimientos, tasaciones y asesoramiento personalizado.", "",
    "Ideamos Propiedades presenta información pública y actualizada para comprar, vender, alquilar e invertir. Las fichas incluyen ubicación, precio, características, imágenes y contacto directo.", "",
    "## Secciones principales", "",
    `- [Inicio](${absoluteUrl("/")}): Presentación general, propiedades destacadas, servicios y experiencia.`,
    `- [Propiedades](${absoluteUrl("/propiedades")}): Catálogo con filtros por operación, tipo, zona y ambientes.`,
    `- [Emprendimientos](${absoluteUrl("/emprendimientos")}): Proyectos en pozo, en construcción y próximos a entregar.`,
    `- [Servicios](${absoluteUrl("/servicios")}): Compra, venta, alquileres, tasaciones, sucesiones e inversiones.`,
    `- [Tasación](${absoluteUrl("/tasacion")}): Solicitud de valuación profesional.`,
    `- [Nosotros](${absoluteUrl("/nosotros")}): Enfoque, experiencia y metodología de trabajo.`,
    `- [Contacto](${absoluteUrl("/contacto")}): Formulario, teléfono, correo y atención personalizada.`, "",
    `## Propiedades publicadas (${properties.length})`, "", ...propertyLinks, "",
    `## Emprendimientos publicados (${developments.length})`, "", ...developmentLinks, "",
    "## Contacto y uso de la información", "",
    "- Correo: hola@ideamos.ar", "- Teléfono: +54 11 5555 0190",
    "- Ubicación: Av. del Libertador 2424, Buenos Aires, Argentina", "- Idioma principal: español de Argentina",
    "- Los valores, la disponibilidad y las condiciones deben confirmarse con Ideamos Propiedades.", "",
  ].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=900",
    },
  });
}
