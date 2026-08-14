import type { Development } from "./developments";
import type { LiveProperty } from "./live-properties";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://inmobiliaria.ideamos.ar").replace(/\/$/, "");
export const SITE_NAME = "Ideamos Propiedades";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "RealEstateAgent"],
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl("/favicon.svg"),
      image: absoluteUrl("/og.png"),
      description: "Inmobiliaria boutique especializada en propiedades seleccionadas, emprendimientos, tasaciones y asesoramiento inmobiliario en Buenos Aires.",
      email: "hola@ideamos.ar",
      telephone: "+54 11 5555 0190",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Av. del Libertador 2424",
        addressLocality: "Buenos Aires",
        addressCountry: "AR",
      },
      areaServed: ["Ciudad Autónoma de Buenos Aires", "Zona Norte", "Buenos Aires"],
      sameAs: ["https://ideamos.ar/"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: "Propiedades y emprendimientos seleccionados para comprar, alquilar e invertir en Buenos Aires.",
      inLanguage: "es-AR",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

function propertySchemaType(type: string) {
  const normalized = type.toLocaleLowerCase("es-AR");
  if (normalized.includes("casa") || normalized.includes("chalet")) return "House";
  if (normalized.includes("departamento") || normalized.includes("piso") || normalized.includes("ph")) return "Apartment";
  return "Residence";
}

export function propertyJsonLd(property: LiveProperty) {
  const url = absoluteUrl(`/propiedades/${property.slug}`);
  const images = [property.image, ...(property.gallery ?? [])]
    .filter(Boolean)
    .map(absoluteUrl)
    .filter((image, index, values) => values.indexOf(image) === index);
  const modified = property.updatedAt && !Number.isNaN(Date.parse(property.updatedAt))
    ? new Date(property.updatedAt).toISOString()
    : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": propertySchemaType(property.type),
        "@id": `${url}#property`,
        name: property.title,
        description: property.description,
        url,
        image: images,
        mainEntityOfPage: url,
        address: { "@type": "PostalAddress", addressLocality: property.location, addressRegion: "Buenos Aires", addressCountry: "AR" },
        floorSize: { "@type": "QuantitativeValue", value: property.area, unitCode: "MTK", unitText: "m²" },
        numberOfRooms: property.rooms,
        numberOfBedrooms: property.bedrooms,
        numberOfBathroomsTotal: property.bathrooms,
        amenityFeature: property.amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
        additionalProperty: [
          { "@type": "PropertyValue", name: "Operación", value: property.operation },
          { "@type": "PropertyValue", name: "Tipo de propiedad", value: property.type },
          ...(property.expenses && property.expenses > 0
            ? [{ "@type": "PropertyValue", name: "Expensas mensuales", value: property.expenses, unitText: property.expensesCurrency ?? "ARS" }]
            : []),
        ],
        offers: {
          "@type": "Offer", url, price: property.price, priceCurrency: property.currency,
          availability: "https://schema.org/InStock", seller: { "@id": `${SITE_URL}/#organization` },
        },
        ...(modified ? { dateModified: modified } : {}),
      },
      breadcrumbJsonLd([["Inicio", "/"], ["Propiedades", "/propiedades"], [property.title, `/propiedades/${property.slug}`]], false),
    ],
  };
}

export function developmentJsonLd(development: Development) {
  const url = absoluteUrl(`/emprendimientos/${development.slug}`);
  const images = [development.image, ...development.gallery]
    .filter(Boolean)
    .map(absoluteUrl)
    .filter((image, index, values) => values.indexOf(image) === index);
  const modified = development.updatedAt && !Number.isNaN(Date.parse(development.updatedAt))
    ? new Date(development.updatedAt).toISOString()
    : undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ApartmentComplex",
        "@id": `${url}#development`,
        name: development.title,
        description: development.description.join(" "),
        url,
        image: images,
        mainEntityOfPage: url,
        address: { "@type": "PostalAddress", addressLocality: development.location, addressRegion: "Buenos Aires", addressCountry: "AR" },
        amenityFeature: development.amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
        additionalProperty: [
          { "@type": "PropertyValue", name: "Estado de obra", value: development.status },
          { "@type": "PropertyValue", name: "Entrega estimada", value: development.delivery },
          { "@type": "PropertyValue", name: "Tipologías", value: development.units },
          { "@type": "PropertyValue", name: "Cantidad de pisos", value: development.floors },
          { "@type": "PropertyValue", name: "Unidades", value: development.apartments },
        ],
        ...(typeof development.priceValue === "number" && development.priceValue > 0 ? {
          offers: {
            "@type": "Offer", url, price: development.priceValue, priceCurrency: development.currency ?? "USD",
            availability: "https://schema.org/InStock", seller: { "@id": `${SITE_URL}/#organization` },
          },
        } : {}),
        ...(modified ? { dateModified: modified } : {}),
      },
      breadcrumbJsonLd([["Inicio", "/"], ["Emprendimientos", "/emprendimientos"], [development.title, `/emprendimientos/${development.slug}`]], false),
    ],
  };
}

export function breadcrumbJsonLd(items: Array<[string, string]>, withContext = true) {
  const data = {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], index) => ({ "@type": "ListItem", position: index + 1, name, item: absoluteUrl(path) })),
  };
  return withContext ? { "@context": "https://schema.org", ...data } : data;
}

export function collectionJsonLd(name: string, description: string, path: string, entries: Array<{ name: string; path: string; image?: string }>) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${url}#collection`,
    name, description, url, inLanguage: "es-AR", isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList", numberOfItems: entries.length,
      itemListElement: entries.map((entry, index) => ({
        "@type": "ListItem", position: index + 1, url: absoluteUrl(entry.path), name: entry.name,
        ...(entry.image ? { image: absoluteUrl(entry.image) } : {}),
      })),
    },
  };
}
