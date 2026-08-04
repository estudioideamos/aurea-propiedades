import { env } from "cloudflare:workers";
import { ensureDatabaseSchema } from "../db/ensure-schema";

type RuntimeEnv = typeof env & { TOKKO_CONFIG_ENCRYPTION_KEY?: string };
type IntegrationRow = {
  adminId: number;
  enabled: number;
  apiKeyCiphertext: string | null;
  apiKeyIv: string | null;
  apiKeyHint: string;
  companyId: number | null;
  branchId: number | null;
  lastSyncAt: string | null;
  lastSyncStatus: string;
  lastSyncCount: number;
  lastSyncError: string;
  syncStartedAt: string | null;
};
type TokkoResponse = { meta: { total_count: number; offset: number; limit: number }; objects: unknown[] };
type SaveTokkoInput = { enabled: boolean; apiKey?: string; companyId?: number | null; branchId?: number | null };

const API_URL = "https://www.tokkobroker.com/api/v1/property/";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64ToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  return Uint8Array.from(atob(padded), character => character.charCodeAt(0));
}

async function encryptionKey() {
  const secret = (env as RuntimeEnv).TOKKO_CONFIG_ENCRYPTION_KEY ?? process.env.TOKKO_CONFIG_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) throw new Error("La proteccion segura de Tokko todavia no esta configurada en el servidor.");
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptSecret(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(), encoder.encode(value));
  return { ciphertext: bytesToBase64(new Uint8Array(ciphertext)), iv: bytesToBase64(iv) };
}

async function decryptSecret(ciphertext: string, iv: string) {
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(iv) }, await encryptionKey(), base64ToBytes(ciphertext));
  return decoder.decode(plaintext);
}

async function integrationRow(adminId: number) {
  await ensureDatabaseSchema();
  return env.DB.prepare(`SELECT admin_id AS adminId, enabled, api_key_ciphertext AS apiKeyCiphertext,
    api_key_iv AS apiKeyIv, api_key_hint AS apiKeyHint, company_id AS companyId, branch_id AS branchId,
    last_sync_at AS lastSyncAt, last_sync_status AS lastSyncStatus, last_sync_count AS lastSyncCount,
    last_sync_error AS lastSyncError, sync_started_at AS syncStartedAt
    FROM tokko_integrations WHERE admin_id = ? LIMIT 1`).bind(adminId).first<IntegrationRow>();
}

export async function getTokkoIntegration(adminId: number) {
  const row = await integrationRow(adminId);
  return {
    enabled: Boolean(row?.enabled),
    apiKeyConfigured: Boolean(row?.apiKeyCiphertext && row?.apiKeyIv),
    apiKeyHint: row?.apiKeyHint ?? "",
    companyId: row?.companyId ?? null,
    branchId: row?.branchId ?? null,
    lastSyncAt: row?.lastSyncAt ?? null,
    lastSyncStatus: row?.lastSyncStatus ?? "never",
    lastSyncCount: Number(row?.lastSyncCount ?? 0),
    lastSyncError: row?.lastSyncError ?? "",
  };
}

export async function saveTokkoIntegration(adminId: number, input: SaveTokkoInput) {
  const current = await integrationRow(adminId);
  const apiKey = String(input.apiKey ?? "").trim();
  let ciphertext = current?.apiKeyCiphertext ?? null;
  let iv = current?.apiKeyIv ?? null;
  let hint = current?.apiKeyHint ?? "";
  if (apiKey) {
    if (apiKey.length < 16) throw new Error("La API key de Tokko no parece valida.");
    const encrypted = await encryptSecret(apiKey);
    ciphertext = encrypted.ciphertext;
    iv = encrypted.iv;
    hint = apiKey.slice(-4);
  }
  if (input.enabled && (!ciphertext || !iv)) throw new Error("Ingresa la API key antes de activar Tokko.");
  await env.DB.prepare(`INSERT INTO tokko_integrations
    (admin_id, enabled, api_key_ciphertext, api_key_iv, api_key_hint, company_id, branch_id, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(admin_id) DO UPDATE SET enabled=excluded.enabled, api_key_ciphertext=excluded.api_key_ciphertext,
    api_key_iv=excluded.api_key_iv, api_key_hint=excluded.api_key_hint, company_id=excluded.company_id,
    branch_id=excluded.branch_id, updated_at=CURRENT_TIMESTAMP`)
    .bind(adminId, input.enabled ? 1 : 0, ciphertext, iv, hint, input.companyId ?? null, input.branchId ?? null).run();
  return getTokkoIntegration(adminId);
}

export async function unlinkTokkoIntegration(adminId: number) {
  await ensureDatabaseSchema();
  const result = await env.DB.prepare("DELETE FROM tokko_integrations WHERE admin_id=?").bind(adminId).run();
  return { disconnected: Number(result.meta?.changes ?? 0) > 0 };
}

async function storedApiKey(adminId: number) {
  const row = await integrationRow(adminId);
  if (!row?.apiKeyCiphertext || !row.apiKeyIv) throw new Error("No hay una API key de Tokko guardada.");
  return decryptSecret(row.apiKeyCiphertext, row.apiKeyIv);
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function text(value: unknown) { const raw = typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim(); if (!/[��]/.test(raw)) return raw; try { return decoder.decode(Uint8Array.from([...raw].map(character => character.charCodeAt(0)))); } catch { return raw; } }
function number(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
function integer(value: unknown) { const parsed = Math.trunc(number(value)); return parsed > 0 ? parsed : null; }

async function fetchTokkoPage(apiKey: string, options: { offset?: number; limit?: number } = {}) {
  const url = new URL(API_URL);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("lang", "es_ar");
  url.searchParams.set("limit", String(options.limit ?? 20));
  url.searchParams.set("offset", String(options.offset ?? 0));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { headers: { accept: "application/json" }, signal: controller.signal });
    if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "Tokko rechazo la API key." : `Tokko respondio con estado ${response.status}.`);
    const data = await response.json() as unknown;
    const root = record(data);
    const meta = record(root.meta);
    if (!Array.isArray(root.objects)) throw new Error("Tokko devolvio una respuesta inesperada.");
    return { meta: { total_count: number(meta.total_count), offset: number(meta.offset), limit: number(meta.limit) }, objects: root.objects } satisfies TokkoResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("Tokko demoro demasiado en responder.");
    throw error;
  } finally { clearTimeout(timer); }
}

export async function testTokkoConnection(input: { apiKey?: string; adminId: number; companyId?: number | null; branchId?: number | null }) {
  const apiKey = String(input.apiKey ?? "").trim() || await storedApiKey(input.adminId);
  const page = await fetchTokkoPage(apiKey, { limit: 1 });
  const first = record(page.objects[0]);
  const branch = record(first.branch);
  return {
    ok: true,
    total: page.meta.total_count,
    companyId: input.companyId ?? null,
    companyName: text(branch.display_name) || text(branch.name),
    branchId: integer(branch.id) ?? input.branchId ?? null,
    branchName: text(branch.display_name) || text(branch.name),
    filterFallbackUsed: false,
  };
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function cleanDescription(value: unknown) {
  return text(value).replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
function tokkoType(value: unknown): "Casa" | "Departamento" | "PH" | "Terreno" {
  const source = text(value).toLowerCase();
  if (source.includes("casa") || source.includes("quinta") || source.includes("chalet")) return "Casa";
  if (source.includes("ph")) return "PH";
  if (source.includes("terreno") || source.includes("lote") || source.includes("campo")) return "Terreno";
  return "Departamento";
}
function tokkoZone(value: string) {
  const source = value.toLowerCase();
  if (source.includes("caba") || source.includes("capital federal") || source.includes("ciudad autonoma")) return "CABA";
  if (["tigre", "san isidro", "vicente lopez", "pilar", "nordelta", "olivos", "martinez", "acassuso", "beccar"].some(item => source.includes(item))) return "Zona Norte";
  if (["moron", "ituzaingo", "castelar", "ramos mejia", "merlo"].some(item => source.includes(item))) return "Zona Oeste";
  if (["lanus", "lomas de zamora", "quilmes", "avellaneda", "banfield"].some(item => source.includes(item))) return "Zona Sur";
  return "Interior";
}
function amenitiesFrom(source: Record<string, unknown>) {
  if (Array.isArray(source.tags)) {
    return [...new Set(source.tags.map(item => text(record(item).name)).filter(Boolean))].slice(0, 24);
  }
  const tags = record(source.tags);
  const values = Object.values(tags).flatMap(value => Array.isArray(value) ? value.map(text) : []);
  return [...new Set(values.filter(Boolean))].slice(0, 24);
}
function photosFrom(source: Record<string, unknown>) {
  if (!Array.isArray(source.photos)) return [];
  return source.photos.map(item => { const photo = record(item); return text(photo.original) || text(photo.image); }).filter(Boolean).slice(0, 30);
}
function mapTokkoProperty(raw: unknown) {
  const source = record(raw);
  const externalId = text(source.id) || text(source.reference_code);
  if (!externalId) return null;
  const title = text(source.publication_title) || text(source.title) || `Propiedad ${externalId}`;
  const locationData = record(source.location);
  const fullLocation = text(locationData.full_location) || text(locationData.short_location);
  const address = text(source.fake_address) || text(source.address);
  const locality = text(locationData.name);
  const location = [address, locality].filter(Boolean).join(", ") || fullLocation || "Ubicacion a consultar";
  const photos = photosFrom(source);
  const totalArea = Math.round(number(source.total_surface) || number(source.total_area) || number(source.surface) || number(source.roofed_surface) || 1);
  const coveredArea = Math.round(number(source.roofed_surface) || number(source.livable_area));
  const operations = Array.isArray(source.operations) ? source.operations.map(record) : [];
  const operationData = operations.find(item => Array.isArray(item.prices) && item.prices.length) ?? operations[0] ?? {};
  const prices = Array.isArray(operationData.prices) ? operationData.prices.map(record) : [];
  const priceData = prices.find(item => !item.is_promotional) ?? prices[0] ?? {};
  const operationText = text(operationData.operation_type).toLowerCase();
  const currencyText = text(priceData.currency).toUpperCase();
  const currency = currencyText === "ARS" ? "ARS" : "USD";
  const age = Math.round(number(source.age));
  const condition = record(source.property_condition);
  const orientation = record(source.orientation);
  const typeData = record(source.type);
  return {
    externalId,
    slug: `tokko-${text(source.id) || slugify(externalId)}-${slugify(title).slice(0, 48)}`,
    title,
    location,
    zone: tokkoZone(fullLocation || location),
    operation: operationText.includes("alquiler") || operationText.includes("rent") ? "Alquiler" : "Venta",
    type: tokkoType(text(typeData.name) || source.operation_category),
    currency,
    price: Math.max(0, Math.round(number(priceData.price))),
    rooms: Math.max(1, Math.round(number(source.room_amount) || number(source.suite_amount) + 1 || 1)),
    bedrooms: Math.max(0, Math.round(number(source.suite_amount))),
    bathrooms: Math.max(0, Math.round(number(source.bathroom_amount) + number(source.toilet_amount))),
    area: Math.max(1, totalArea),
    coveredArea: Math.max(0, coveredArea),
    garages: Math.max(0, Math.round(number(source.parking_lot_amount))),
    age: age === 0 ? "A estrenar" : `${age} anos`,
    condition: text(condition.name) || text(source.property_condition) || "A consultar",
    orientation: text(orientation.name) || text(source.orientation) || "A consultar",
    image: photos[0] ?? "",
    gallery: photos.slice(1),
    description: cleanDescription(source.rich_description || source.description || source.description_only),
    amenities: amenitiesFrom(source),
    externalUpdatedAt: text(source.updated_at) || text(source.created_at) || new Date().toISOString(),
  };
}

async function upsertTokkoProperty(item: NonNullable<ReturnType<typeof mapTokkoProperty>>) {
  await env.DB.prepare(`INSERT INTO properties
    (slug,title,location,zone,operation,type,currency,price,price_prefix,price_suffix,rooms,bedrooms,bathrooms,area,
    covered_area,garages,age,condition,orientation,image,gallery,description,amenities,status,featured,source,external_id,external_updated_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(external_id) WHERE external_id IS NOT NULL DO UPDATE SET
    title=excluded.title,location=excluded.location,zone=excluded.zone,operation=excluded.operation,type=excluded.type,
    currency=excluded.currency,price=excluded.price,rooms=excluded.rooms,bedrooms=excluded.bedrooms,bathrooms=excluded.bathrooms,
    area=excluded.area,covered_area=excluded.covered_area,garages=excluded.garages,age=excluded.age,condition=excluded.condition,
    orientation=excluded.orientation,image=excluded.image,gallery=excluded.gallery,description=excluded.description,
    amenities=excluded.amenities,status='published',source='tokko',external_updated_at=excluded.external_updated_at,updated_at=CURRENT_TIMESTAMP`)
    .bind(item.slug,item.title,item.location,item.zone,item.operation,item.type,item.currency,item.price,"","",item.rooms,item.bedrooms,item.bathrooms,item.area,item.coveredArea,item.garages,item.age,item.condition,item.orientation,item.image,JSON.stringify(item.gallery),item.description,JSON.stringify(item.amenities),"published",0,"tokko",item.externalId,item.externalUpdatedAt).run();
}

async function pagedTokko(apiKey: string) {
  const all: unknown[] = [];
  const limit = 20;
  for (let offset = 0; offset < 1000; offset += limit) {
    const page = await fetchTokkoPage(apiKey, { offset, limit });
    all.push(...page.objects);
    if (offset + page.objects.length >= page.meta.total_count || page.objects.length === 0) break;
  }
  return all;
}

export async function syncTokkoForAdmin(adminId: number, _options: { forceFull?: boolean } = {}) {
  const row = await integrationRow(adminId);
  if (!row?.enabled) throw new Error("Activa Tokko antes de sincronizar.");
  const apiKey = await storedApiKey(adminId);
  const startedAt = new Date().toISOString();
  await env.DB.prepare("UPDATE tokko_integrations SET last_sync_status='syncing', sync_started_at=?, last_sync_error='' WHERE admin_id=?").bind(startedAt, adminId).run();
  try {
    const updated = await pagedTokko(apiKey);
    let imported = 0;
    const activeExternalIds: string[] = [];
    for (const raw of updated) {
      const item = mapTokkoProperty(raw);
      if (!item) continue;
      activeExternalIds.push(item.externalId);
      if (!item.image) continue;
      await upsertTokkoProperty(item);
      imported += 1;
    }

    let removed = 0;
    const existing = await env.DB.prepare("SELECT external_id AS externalId FROM properties WHERE source='tokko' AND external_id IS NOT NULL").all<{ externalId: string }>();
    const active = new Set(activeExternalIds);
    for (const property of existing.results ?? []) {
      if (active.has(String(property.externalId))) continue;
      const result = await env.DB.prepare("DELETE FROM properties WHERE source='tokko' AND external_id=?").bind(property.externalId).run();
      removed += Number(result.meta.changes ?? 0);
    }

    const finishedAt = new Date().toISOString();
    await env.DB.prepare("UPDATE tokko_integrations SET last_sync_at=?, last_sync_status='success', last_sync_count=?, last_sync_error='', sync_started_at=NULL, updated_at=CURRENT_TIMESTAMP WHERE admin_id=?").bind(finishedAt, imported, adminId).run();
    return { imported, removed, totalProcessed: updated.length, lastSyncAt: finishedAt, filterFallbackUsed: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo sincronizar con Tokko.";
    await env.DB.prepare("UPDATE tokko_integrations SET last_sync_status='error', last_sync_error=?, sync_started_at=NULL, updated_at=CURRENT_TIMESTAMP WHERE admin_id=?").bind(message.slice(0, 500), adminId).run();
    throw new Error(message);
  }
}

export async function refreshTokkoIfDue(minutes = 30) {
  await ensureDatabaseSchema();
  const row = await env.DB.prepare("SELECT admin_id AS adminId, last_sync_at AS lastSyncAt, sync_started_at AS syncStartedAt FROM tokko_integrations WHERE enabled=1 ORDER BY admin_id LIMIT 1").first<{adminId:number;lastSyncAt:string|null;syncStartedAt:string|null}>();
  if (!row) return;
  const cutoff = new Date(Date.now() - minutes * 60000).toISOString();
  const lockCutoff = new Date(Date.now() - 10 * 60000).toISOString();
  if (row.lastSyncAt && row.lastSyncAt >= cutoff) return;
  if (row.syncStartedAt && row.syncStartedAt >= lockCutoff) return;
  try { await syncTokkoForAdmin(row.adminId); } catch { /* El catalogo manual sigue disponible si Tokko no responde. */ }
}
