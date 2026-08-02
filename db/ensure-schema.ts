import { env } from "cloudflare:workers";

type ColumnInfo = { name: string };

let schemaPromise: Promise<void> | null = null;

const propertyColumns: Record<string, string> = {
  covered_area: "INTEGER DEFAULT 0 NOT NULL",
  garages: "INTEGER DEFAULT 0 NOT NULL",
  age: "TEXT DEFAULT '' NOT NULL",
  condition: "TEXT DEFAULT 'Excelente' NOT NULL",
  orientation: "TEXT DEFAULT 'Norte' NOT NULL",
  gallery: "TEXT DEFAULT '[]' NOT NULL",
};

async function upgradeSchema() {
  const database = env.DB;
  if (!database) throw new Error("La base de datos del panel no esta conectada.");

  await database.prepare(`CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    zone TEXT NOT NULL,
    operation TEXT NOT NULL,
    type TEXT NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    price INTEGER NOT NULL,
    rooms INTEGER DEFAULT 1 NOT NULL,
    bedrooms INTEGER DEFAULT 1 NOT NULL,
    bathrooms INTEGER DEFAULT 1 NOT NULL,
    area INTEGER NOT NULL,
    covered_area INTEGER DEFAULT 0 NOT NULL,
    garages INTEGER DEFAULT 0 NOT NULL,
    age TEXT DEFAULT '' NOT NULL,
    condition TEXT DEFAULT 'Excelente' NOT NULL,
    orientation TEXT DEFAULT 'Norte' NOT NULL,
    image TEXT NOT NULL,
    gallery TEXT DEFAULT '[]' NOT NULL,
    description TEXT DEFAULT '' NOT NULL,
    amenities TEXT DEFAULT '[]' NOT NULL,
    status TEXT DEFAULT 'published' NOT NULL,
    featured INTEGER DEFAULT 0 NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`).run();

  const columnResult = await database.prepare("PRAGMA table_info(properties)").all<ColumnInfo>();
  const columns = new Set((columnResult.results ?? []).map(column => column.name));
  for (const [name, definition] of Object.entries(propertyColumns)) {
    if (!columns.has(name)) await database.prepare(`ALTER TABLE properties ADD COLUMN ${name} ${definition}`).run();
  }

  await database.prepare("CREATE UNIQUE INDEX IF NOT EXISTS properties_slug_unique ON properties (slug)").run();
  await database.prepare(`CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    property_id INTEGER,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON UPDATE NO ACTION ON DELETE NO ACTION
  )`).run();
}

export function ensureDatabaseSchema() {
  if (!schemaPromise) {
    schemaPromise = upgradeSchema().catch(error => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}