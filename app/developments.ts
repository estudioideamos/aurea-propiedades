export type Development = {
  id: number;
  slug: string;
  title: string;
  location: string;
  neighborhood: string;
  status: string;
  delivery: string;
  units: string;
  price: string;
  currency?: "USD" | "ARS";
  priceValue?: number;
  pricePrefix?: string;
  priceSuffix?: string;
  publicationStatus?: "published" | "draft";
  updatedAt?: string;
  image: string;
  gallery: string[];
  floors: string;
  apartments: string;
  garages: string;
  developer: string;
  architect: string;
  description: string[];
  amenities: string[];
  specifications: string[];
};

const galleryPool = [
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=88",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=88",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=88",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1800&q=88",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=88",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=88",
];

const makeGallery = (image: string, offset: number) => [
  image,
  ...Array.from({ length: 4 }, (_, index) => galleryPool[(offset + index) % galleryPool.length]),
];

const sharedAmenities = ["SUM equipado", "Terraza con parrilla", "Piscina y solarium", "Bicicletero", "Seguridad y control de acceso"];
const sharedSpecifications = ["Aberturas de alta prestación con DVH", "Climatización frío/calor", "Frentes e interiores de placard", "Griferías y sanitarios de primera línea", "Agua caliente central", "Espacio para lavarropas"];

const rawDevelopments = [
  { id:1, slug:"distrito-aura-palermo", title:"Distrito Aura", location:"Palermo, CABA", neighborhood:"Palermo", status:"EN POZO", delivery:"2028", units:"1 a 4 ambientes", price:"Desde USD 128.000", image:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=88", floors:"14 pisos", apartments:"82 unidades", garages:"24 cocheras", developer:"Aura Desarrollos", architect:"Estudio Norte", lead:"Una propuesta urbana contemporánea que combina plantas flexibles, expansiones exteriores y amenities pensados para una vida dinámica.", context:"Ubicado en un corredor consolidado de Palermo, con gastronomía, servicios y múltiples alternativas de movilidad a pocos minutos." },
  { id:2, slug:"rio-norte-vicente-lopez", title:"Río Norte", location:"Vicente López, Buenos Aires", neighborhood:"Vicente López", status:"EN CONSTRUCCIÓN", delivery:"2027", units:"2 a 5 ambientes", price:"Desde USD 198.000", image:"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=88", floors:"11 pisos", apartments:"56 unidades", garages:"42 cocheras", developer:"Ribera Grupo", architect:"M2 Arquitectura", lead:"Residencias amplias con balcones profundos, visuales abiertas y una materialidad sobria que prioriza luz, confort y durabilidad.", context:"A pasos del río y con acceso directo a los principales corredores de Zona Norte y la Ciudad de Buenos Aires." },
  { id:3, slug:"casa-parque-san-isidro", title:"Casa Parque", location:"San Isidro, Buenos Aires", neighborhood:"San Isidro", status:"ÚLTIMAS UNIDADES", delivery:"2026", units:"3 y 4 ambientes", price:"Desde USD 285.000", image:"https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=88", floors:"3 niveles", apartments:"18 residencias", garages:"30 cocheras", developer:"Parque Desarrollos", architect:"Taller Estudio", lead:"Un conjunto de baja escala que integra arquitectura, jardines y espacios comunes en una experiencia residencial serena.", context:"En un entorno arbolado de San Isidro, cerca de colegios, centros comerciales y conexiones rapidas con Panamericana." },
  { id:4, slug:"nexo-belgrano", title:"Nexo Belgrano", location:"Belgrano, CABA", neighborhood:"Belgrano", status:"EN POZO", delivery:"2028", units:"1 a 3 ambientes", price:"Desde USD 112.000", image:"https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1800&q=88", floors:"12 pisos", apartments:"68 unidades", garages:"20 cocheras", developer:"Nexo Urbano", architect:"Linea Arquitectos", lead:"Departamentos eficientes y luminosos con configuraciones versatiles para vivir, trabajar o invertir en una ubicación estratégica.", context:"Cercano a avenidas, tren, subte y una red completa de comercios, universidades y espacios verdes." },
  { id:5, slug:"lagos-residences-nordelta", title:"Lagos Residences", location:"Nordelta, Tigre", neighborhood:"Nordelta", status:"EN CONSTRUCCIÓN", delivery:"2027", units:"2 a 4 ambientes", price:"Desde USD 210.000", image:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=88", floors:"5 niveles", apartments:"40 residencias", garages:"64 cocheras", developer:"Lagos Living", architect:"Estudio Delta", lead:"Residencias orientadas al agua, con terrazas generosas y areas comunes que prolongan la experiencia de vivir junto al paisaje.", context:"Dentro de Nordelta, con cercania a colegios, centros de salud, gastronomía, deporte y servicios cotidianos." },
  { id:6, slug:"pasaje-colegiales", title:"Pasaje Colegiales", location:"Colegiales, CABA", neighborhood:"Colegiales", status:"PRÓXIMA ENTREGA", delivery:"2026", units:"Estudios a 3 ambientes", price:"Desde USD 138.000", image:"https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=88", floors:"9 pisos", apartments:"45 unidades", garages:"16 cocheras", developer:"Pasaje Grupo", architect:"Modulo Arquitectura", lead:"Un edificio de escala barrial con unidades funcionales, patios, balcones y una terraza comun diseñada para encontrarse.", context:"En el limite entre Colegiales y Palermo, rodeado de propuestas gastronomicas, espacios creativos y transporte publico." },
  { id:7, slug:"olivos-central", title:"Olivos Central", location:"Olivos, Buenos Aires", neighborhood:"Olivos", status:"EN POZO", delivery:"2029", units:"2 a 4 ambientes", price:"Desde USD 175.000", image:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1800&q=88", floors:"10 pisos", apartments:"60 unidades", garages:"48 cocheras", developer:"Central Desarrollos", architect:"Atelier Urbano", lead:"Un proyecto de líneas puras, balcones corridos y plantas bien resueltas, pensado para familias y perfiles inversores.", context:"En el centro de Olivos, a minutos del río, el tren y la avenida Maipú, con todos los servicios a distancia caminable." },
  { id:8, slug:"puerto-madero-dock", title:"Dock 08", location:"Puerto Madero, CABA", neighborhood:"Puerto Madero", status:"ÚLTIMAS UNIDADES", delivery:"2026", units:"2 a 5 ambientes", price:"Desde USD 360.000", image:"https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1800&q=88", floors:"22 pisos", apartments:"96 unidades", garages:"120 cocheras", developer:"Dock Capital", architect:"Estudio Sur", lead:"Residencias premium con vistas abiertas, servicios de hotelería y una selección de materiales de alta gama.", context:"En uno de los sectores más exclusivos de la ciudad, junto al río, parques, gastronomía y el distrito financiero." },
];

export const developments: Development[] = rawDevelopments.map((item, index) => {
  const match = item.price.match(/^(.*?)\s*(USD|ARS)\s+([\d.]+)(?:\s+(.*))?$/);
  return {
  ...item,
  currency: (match?.[2] ?? "USD") as "USD" | "ARS",
  priceValue: Number((match?.[3] ?? "0").replace(/\./g, "")),
  pricePrefix: match?.[1]?.trim() ?? "",
  priceSuffix: match?.[4]?.trim() ?? "",
  publicationStatus: "published" as const,
  gallery: makeGallery(item.image, index),
  description: [item.lead, item.context],
  amenities: sharedAmenities,
  specifications: sharedSpecifications,
};
});

export const formatDevelopmentPrice = (development: Development) => {
  if (typeof development.priceValue !== "number") return development.price;
  const base = `${development.currency ?? "USD"} ${new Intl.NumberFormat("es-AR").format(development.priceValue)}`;
  return [development.pricePrefix?.trim(), base, development.priceSuffix?.trim()].filter(Boolean).join(" ");
};
