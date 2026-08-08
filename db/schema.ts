import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const propertyRecords = sqliteTable("properties", {
  id: integer("id").primaryKey({ autoIncrement: true }), slug: text("slug").notNull().unique(), title: text("title").notNull(), location: text("location").notNull(), zone: text("zone").notNull(), operation: text("operation").notNull(), type: text("type").notNull(), currency: text("currency").notNull().default("USD"), price: integer("price").notNull(), pricePrefix: text("price_prefix").notNull().default(""), priceSuffix: text("price_suffix").notNull().default(""), rooms: integer("rooms").notNull().default(1), bedrooms: integer("bedrooms").notNull().default(1), bathrooms: integer("bathrooms").notNull().default(1), area: integer("area").notNull(), coveredArea: integer("covered_area").notNull().default(0), garages: integer("garages").notNull().default(0), age: text("age").notNull().default(""), condition: text("condition").notNull().default("Excelente"), orientation: text("orientation").notNull().default("Norte"), image: text("image").notNull(), gallery: text("gallery").notNull().default("[]"), description: text("description").notNull().default(""), amenities: text("amenities").notNull().default("[]"), status: text("status").notNull().default("published"), featured: integer("featured", { mode: "boolean" }).notNull().default(false), source: text("source").notNull().default("manual"), externalId: text("external_id"), externalUpdatedAt: text("external_updated_at"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }), propertyId: integer("property_id").references(() => propertyRecords.id), name: text("name").notNull(), email: text("email"), phone: text("phone"), message: text("message").notNull(), status: text("status").notNull().default("new"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  agencyName: text("agency_name").notNull().default("Ideamos Propiedades"),
  contactName: text("contact_name").notNull().default("Equipo Ideamos"),
  contactEmail: text("contact_email").notNull().default("hola@ideamos.ar"),
  phone: text("phone").notNull().default("+54 11 5555 0190"),
  address: text("address").notNull().default("Av. del Libertador 2424, Buenos Aires"),
  schedule: text("schedule").notNull().default("Lun. a vie. / 9 a 18 h"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const developmentRecords = sqliteTable("developments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  neighborhood: text("neighborhood").notNull().default(""),
  status: text("status").notNull().default("EN POZO"),
  delivery: text("delivery").notNull().default("A confirmar"),
  units: text("units").notNull().default(""),
  currency: text("currency").notNull().default("USD"),
  priceValue: integer("price_value").notNull().default(0),
  pricePrefix: text("price_prefix").notNull().default("Desde"),
  priceSuffix: text("price_suffix").notNull().default(""),
  image: text("image").notNull().default(""),
  gallery: text("gallery").notNull().default("[]"),
  floors: text("floors").notNull().default(""),
  apartments: text("apartments").notNull().default(""),
  garages: text("garages").notNull().default(""),
  developer: text("developer").notNull().default(""),
  architect: text("architect").notNull().default(""),
  description: text("description").notNull().default("[]"),
  amenities: text("amenities").notNull().default("[]"),
  specifications: text("specifications").notNull().default("[]"),
  publicationStatus: text("publication_status").notNull().default("published"),
  source: text("source").notNull().default("manual"),
  externalId: text("external_id"),
  externalUpdatedAt: text("external_updated_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tokkoIntegrations = sqliteTable("tokko_integrations", {
  adminId: integer("admin_id").primaryKey(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
  apiKeyCiphertext: text("api_key_ciphertext"),
  apiKeyIv: text("api_key_iv"),
  apiKeyHint: text("api_key_hint").notNull().default(""),
  companyId: integer("company_id"),
  branchId: integer("branch_id"),
  lastSyncAt: text("last_sync_at"),
  lastSyncStatus: text("last_sync_status").notNull().default("never"),
  lastSyncCount: integer("last_sync_count").notNull().default(0),
  lastSyncError: text("last_sync_error").notNull().default(""),
  syncStartedAt: text("sync_started_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
