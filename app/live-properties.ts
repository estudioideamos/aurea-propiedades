import type { Property } from "./properties";
import { properties as staticProperties } from "./properties";

export type LiveProperty = Property & { status?: string; updatedAt?: string };

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];
  try { return JSON.parse(value) as string[]; } catch { return []; }
}

export async function getLiveProperties(): Promise<LiveProperty[]> {
  if (process.env.GITHUB_PAGES === "true") return staticProperties;
  try { const { refreshTokkoIfDue } = await import("./tokko-integration"); await refreshTokkoIfDue(); } catch { /* La cartera manual sigue disponible si Tokko no responde. */ }
  try {
    const [{ desc, eq }, { getDb }, { propertyRecords }] = await Promise.all([
      import("drizzle-orm"), import("../db"), import("../db/schema"),
    ]);
    const rows = await getDb().select().from(propertyRecords).where(eq(propertyRecords.status, "published")).orderBy(desc(propertyRecords.featured), desc(propertyRecords.updatedAt));
    if (!rows.length) return staticProperties;
    return rows.map(row => ({
      id: row.id, slug: row.slug, title: row.title, location: row.location, zone: row.zone as Property["zone"], operation: row.operation as Property["operation"], type: row.type as Property["type"], currency: row.currency as Property["currency"], price: row.price, pricePrefix: row.pricePrefix, priceSuffix: row.priceSuffix, rooms: row.rooms, bedrooms: row.bedrooms, bathrooms: row.bathrooms, area: row.area, image: row.image, description: row.description, amenities: parseStringArray(row.amenities), gallery: parseStringArray(row.gallery), coveredArea: row.coveredArea, garages: row.garages, age: row.age, condition: row.condition, orientation: row.orientation, featured: row.featured, status: row.status, updatedAt: row.updatedAt,
    }));
  } catch { return staticProperties; }
}

export async function getLiveProperty(slug: string) {
  const items = await getLiveProperties();
  return { property: items.find(item => item.slug === slug), all: items };
}