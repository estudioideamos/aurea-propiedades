import { desc, eq, sql } from "drizzle-orm";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { properties as seedProperties, type Property } from "../../../properties";
import { getDb } from "../../../../db";
import { propertyRecords } from "../../../../db/schema";

const ADMIN_EMAIL = "r.lavega@ideamos.com.ar";
const validOperations = new Set(["Venta", "Alquiler"]);
const validTypes = new Set(["Casa", "Departamento", "PH", "Terreno"]);
const validCurrencies = new Set(["USD", "ARS"]);
const validStatuses = new Set(["published", "draft", "reserved"]);

type PropertyPayload = Partial<Property> & { status?: string };

async function isAuthorized() {
  const user = await getChatGPTUser();
  return Boolean(user && user.email.toLowerCase() === ADMIN_EMAIL);
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseAmenities(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map(item => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map(item => item.trim()).filter(Boolean);
  return [];
}

function serialize(row: typeof propertyRecords.$inferSelect) {
  let amenities: string[] = [];
  try { amenities = JSON.parse(row.amenities) as string[]; } catch { amenities = []; }
  return { ...row, amenities };
}

async function ensureSeeded() {
  const db = getDb();
  const [summary] = await db.select({ total: sql<number>`count(*)` }).from(propertyRecords);
  if (Number(summary?.total ?? 0) > 0) return;
  await db.insert(propertyRecords).values(seedProperties.map(property => ({
    slug: property.slug,
    title: property.title,
    location: property.location,
    zone: property.zone,
    operation: property.operation,
    type: property.type,
    currency: property.currency,
    price: property.price,
    rooms: property.rooms,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    image: property.image,
    description: property.description,
    amenities: JSON.stringify(property.amenities),
    status: "published",
    featured: Boolean(property.featured),
  })));
}

function validate(payload: PropertyPayload) {
  const title = String(payload.title ?? "").trim();
  const location = String(payload.location ?? "").trim();
  const image = String(payload.image ?? "").trim();
  if (!title || !location || !image) return "Completá nombre, ubicación e imagen.";
  if (!validOperations.has(String(payload.operation))) return "La operación no es válida.";
  if (!validTypes.has(String(payload.type))) return "El tipo de propiedad no es válido.";
  if (!validCurrencies.has(String(payload.currency))) return "La moneda no es válida.";
  if (!validStatuses.has(String(payload.status ?? "published"))) return "El estado no es válido.";
  if (Number(payload.price) < 0 || Number(payload.area) <= 0) return "Revisá precio y superficie.";
  return null;
}

function valuesFrom(payload: PropertyPayload) {
  const title = String(payload.title).trim();
  return {
    slug: slugify(String(payload.slug || title)),
    title,
    location: String(payload.location).trim(),
    zone: String(payload.zone || "CABA").trim(),
    operation: String(payload.operation),
    type: String(payload.type),
    currency: String(payload.currency || "USD"),
    price: Number(payload.price || 0),
    rooms: Math.max(1, Number(payload.rooms || 1)),
    bedrooms: Math.max(0, Number(payload.bedrooms || 0)),
    bathrooms: Math.max(0, Number(payload.bathrooms || 0)),
    area: Math.max(1, Number(payload.area || 1)),
    image: String(payload.image).trim(),
    description: String(payload.description || "").trim(),
    amenities: JSON.stringify(parseAmenities(payload.amenities)),
    status: String(payload.status || "published"),
    featured: Boolean(payload.featured),
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  if (!(await isAuthorized())) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    await ensureSeeded();
    const rows = await getDb().select().from(propertyRecords).orderBy(desc(propertyRecords.updatedAt), desc(propertyRecords.id));
    return Response.json({ properties: rows.map(serialize) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudieron cargar las propiedades" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthorized())) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    const payload = await request.json() as PropertyPayload;
    const error = validate(payload);
    if (error) return Response.json({ error }, { status: 400 });
    await ensureSeeded();
    const [created] = await getDb().insert(propertyRecords).values(valuesFrom(payload)).returning();
    return Response.json({ property: serialize(created) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear la propiedad";
    return Response.json({ error: message.includes("UNIQUE") ? "Ya existe una propiedad con ese enlace." : message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAuthorized())) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    const payload = await request.json() as PropertyPayload & { id?: number };
    if (!payload.id) return Response.json({ error: "Falta el identificador." }, { status: 400 });
    const error = validate(payload);
    if (error) return Response.json({ error }, { status: 400 });
    const [updated] = await getDb().update(propertyRecords).set(valuesFrom(payload)).where(eq(propertyRecords.id, payload.id)).returning();
    if (!updated) return Response.json({ error: "Propiedad no encontrada." }, { status: 404 });
    return Response.json({ property: serialize(updated) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo actualizar" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorized())) return Response.json({ error: "No autorizado" }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Falta el identificador." }, { status: 400 });
  const [deleted] = await getDb().delete(propertyRecords).where(eq(propertyRecords.id, id)).returning({ id: propertyRecords.id });
  if (!deleted) return Response.json({ error: "Propiedad no encontrada." }, { status: 404 });
  return Response.json({ ok: true });
}