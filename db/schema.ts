import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const propertyRecords = sqliteTable("properties", {
  id: integer("id").primaryKey({ autoIncrement: true }), slug: text("slug").notNull().unique(), title: text("title").notNull(), location: text("location").notNull(), zone: text("zone").notNull(), operation: text("operation").notNull(), type: text("type").notNull(), currency: text("currency").notNull().default("USD"), price: integer("price").notNull(), rooms: integer("rooms").notNull().default(1), bedrooms: integer("bedrooms").notNull().default(1), bathrooms: integer("bathrooms").notNull().default(1), area: integer("area").notNull(), image: text("image").notNull(), description: text("description").notNull().default(""), amenities: text("amenities").notNull().default("[]"), status: text("status").notNull().default("published"), featured: integer("featured", { mode: "boolean" }).notNull().default(false), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }), propertyId: integer("property_id").references(() => propertyRecords.id), name: text("name").notNull(), email: text("email"), phone: text("phone"), message: text("message").notNull(), status: text("status").notNull().default("new"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
