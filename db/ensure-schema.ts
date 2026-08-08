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
  source: "TEXT DEFAULT 'manual' NOT NULL",
  external_id: "TEXT",
  external_updated_at: "TEXT",
};

const developmentColumns: Record<string, string> = {
  source: "TEXT DEFAULT 'manual' NOT NULL",
  external_id: "TEXT",
  external_updated_at: "TEXT",
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
  await database.prepare("CREATE UNIQUE INDEX IF NOT EXISTS properties_external_id_unique ON properties (external_id) WHERE external_id IS NOT NULL").run();
  await database.prepare("CREATE INDEX IF NOT EXISTS properties_source_status_index ON properties (source, status)").run();
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
    source TEXT DEFAULT 'manual' NOT NULL,
    external_id TEXT,
    external_updated_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`).run();
  const developmentColumnResult = await database.prepare("PRAGMA table_info(developments)").all<ColumnInfo>();
  const developmentColumnNames = new Set((developmentColumnResult.results ?? []).map(column => column.name));
  for (const [name, definition] of Object.entries(developmentColumns)) {
    if (!developmentColumnNames.has(name)) await database.prepare(`ALTER TABLE developments ADD COLUMN ${name} ${definition}`).run();
  }

  await database.prepare("CREATE UNIQUE INDEX IF NOT EXISTS developments_slug_unique ON developments (slug)").run();
  await database.prepare("CREATE UNIQUE INDEX IF NOT EXISTS developments_external_id_unique ON developments (external_id) WHERE external_id IS NOT NULL").run();
  await database.prepare("CREATE INDEX IF NOT EXISTS developments_source_status_index ON developments (source, publication_status)").run();
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
  await database.prepare(`CREATE TABLE IF NOT EXISTS tokko_integrations (
    admin_id INTEGER PRIMARY KEY NOT NULL,
    enabled INTEGER DEFAULT 0 NOT NULL,
    api_key_ciphertext TEXT,
    api_key_iv TEXT,
    api_key_hint TEXT DEFAULT '' NOT NULL,
    company_id INTEGER,
    branch_id INTEGER,
    last_sync_at TEXT,
    last_sync_status TEXT DEFAULT 'never' NOT NULL,
    last_sync_count INTEGER DEFAULT 0 NOT NULL,
    last_sync_error TEXT DEFAULT '' NOT NULL,
    sync_started_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
  )`).run();
  await database.prepare("CREATE INDEX IF NOT EXISTS tokko_integrations_enabled_index ON tokko_integrations(enabled)").run();
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