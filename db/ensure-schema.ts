import { env } from "cloudflare:workers";

type ColumnInfo = { name: string };

let schemaPromise: Promise<void> | null = null;

const propertyColumns: Record<string, string> = {
  price_prefix: "TEXT DEFAULT '' NOT NULL",
  price_suffix: "TEXT DEFAULT '' NOT NULL",
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
    price_prefix TEXT DEFAULT '' NOT NULL,
    price_suffix TEXT DEFAULT '' NOT NULL,
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
  await database.prepare(`CREATE TABLE IF NOT EXISTS developments (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    neighborhood TEXT DEFAULT '' NOT NULL,
    status TEXT DEFAULT 'EN POZO' NOT NULL,
    delivery TEXT DEFAULT 'A confirmar' NOT NULL,
    units TEXT DEFAULT '' NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    price_value INTEGER DEFAULT 0 NOT NULL,
    price_prefix TEXT DEFAULT 'Desde' NOT NULL,
    price_suffix TEXT DEFAULT '' NOT NULL,
    image TEXT DEFAULT '' NOT NULL,
    gallery TEXT DEFAULT '[]' NOT NULL,
    floors TEXT DEFAULT '' NOT NULL,
    apartments TEXT DEFAULT '' NOT NULL,
    garages TEXT DEFAULT '' NOT NULL,
    developer TEXT DEFAULT '' NOT NULL,
    architect TEXT DEFAULT '' NOT NULL,
    description TEXT DEFAULT '[]' NOT NULL,
    amenities TEXT DEFAULT '[]' NOT NULL,
    specifications TEXT DEFAULT '[]' NOT NULL,
    publication_status TEXT DEFAULT 'published' NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`).run();
  await database.prepare("CREATE UNIQUE INDEX IF NOT EXISTS developments_slug_unique ON developments (slug)").run();
  await database.prepare(`CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY NOT NULL DEFAULT 1,
    agency_name TEXT DEFAULT 'Ideamos Propiedades' NOT NULL,
    contact_name TEXT DEFAULT 'Equipo Ideamos' NOT NULL,
    contact_email TEXT DEFAULT 'hola@ideamos.ar' NOT NULL,
    phone TEXT DEFAULT '+54 11 5555 0190' NOT NULL,
    address TEXT DEFAULT 'Av. del Libertador 2424, Buenos Aires' NOT NULL,
    schedule TEXT DEFAULT 'Lun. a vie. / 9 a 18 h' NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`).run();

  await database.prepare(`INSERT OR IGNORE INTO site_settings
    (id, agency_name, contact_name, contact_email, phone, address, schedule)
    VALUES (1, 'Ideamos Propiedades', 'Equipo Ideamos', 'hola@ideamos.ar', '+54 11 5555 0190', 'Av. del Libertador 2424, Buenos Aires', 'Lun. a vie. / 9 a 18 h')`).run();

  await database.prepare(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_iterations INTEGER NOT NULL,
    display_name TEXT DEFAULT 'Equipo Ideamos' NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
  await database.prepare(`CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
  )`).run();
  await database.prepare("CREATE INDEX IF NOT EXISTS admin_sessions_token_index ON admin_sessions(token_hash)").run();
  await database.prepare(`CREATE TABLE IF NOT EXISTS admin_login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    email TEXT NOT NULL,
    ip TEXT NOT NULL,
    attempted_at TEXT NOT NULL
  )`).run();
  await database.prepare("CREATE INDEX IF NOT EXISTS admin_login_attempts_lookup ON admin_login_attempts(email,ip,attempted_at)").run();
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