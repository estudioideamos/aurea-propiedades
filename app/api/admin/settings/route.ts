import { env } from "cloudflare:workers";
import { isAdminRequestAuthorized } from "../../../admin-auth";
import { ensureDatabaseSchema } from "../../../../db/ensure-schema";


type SettingsPayload = {
  agencyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactRecipients?: string[] | string;
  valuationRecipients?: string[] | string;
  phone?: string;
  address?: string;
  schedule?: string;
};

type SettingsRow = {
  agencyName: string;
  contactName: string;
  contactEmail: string;
  contactRecipients: string;
  valuationRecipients: string;
  phone: string;
  address: string;
  schedule: string;
  updatedAt: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeRecipients(input: string[] | string | undefined, fallback: string) {
  const source = Array.isArray(input) ? input : String(input ?? "").split(/[,;\n]/);
  const recipients = [...new Set(source.map(value => value.trim().toLowerCase()).filter(Boolean))];
  const normalized = recipients.length ? recipients : [fallback];
  if (normalized.length > 5) throw new Error("Podés configurar hasta 5 destinatarios por formulario.");
  if (normalized.some(email => !emailPattern.test(email))) throw new Error("Revisá los correos destinatarios ingresados.");
  return normalized;
}

function parseStoredRecipients(value: string, fallback: string) {
  try { return normalizeRecipients(JSON.parse(value) as string[], fallback); } catch { return [fallback]; }
}

async function authorized(request: Request) {
  return isAdminRequestAuthorized(request);
}

async function readSettings() {
  await ensureDatabaseSchema();
  const row = await env.DB.prepare(`SELECT
    agency_name AS agencyName,
    contact_name AS contactName,
    contact_email AS contactEmail,
    contact_recipients AS contactRecipients,
    valuation_recipients AS valuationRecipients,
    phone,
    address,
    schedule,
    updated_at AS updatedAt
    FROM site_settings WHERE id = 1`).first<SettingsRow>();
  if (!row) return null;
  return {
    ...row,
    contactRecipients: parseStoredRecipients(row.contactRecipients, row.contactEmail).join(", "),
    valuationRecipients: parseStoredRecipients(row.valuationRecipients, row.contactEmail).join(", "),
  };
}

export async function GET(request: Request) {
  if (!(await authorized(request))) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    return Response.json({ settings: await readSettings() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudieron cargar los ajustes." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await authorized(request))) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    const payload = await request.json() as SettingsPayload;
    const values = {
      agencyName: String(payload.agencyName ?? "").trim(),
      contactName: String(payload.contactName ?? "").trim(),
      contactEmail: String(payload.contactEmail ?? "").trim().toLowerCase(),
      phone: String(payload.phone ?? "").trim(),
      address: String(payload.address ?? "").trim(),
      schedule: String(payload.schedule ?? "").trim(),
    };
    if (Object.values(values).some(value => !value)) {
      return Response.json({ error: "Completá todos los datos de contacto." }, { status: 400 });
    }
    if (!emailPattern.test(values.contactEmail)) {
      return Response.json({ error: "Ingresá un correo válido." }, { status: 400 });
    }
    const contactRecipients = normalizeRecipients(payload.contactRecipients, values.contactEmail);
    const valuationRecipients = normalizeRecipients(payload.valuationRecipients, values.contactEmail);
    await ensureDatabaseSchema();
    await env.DB.prepare(`UPDATE site_settings SET
      agency_name = ?, contact_name = ?, contact_email = ?, contact_recipients = ?, valuation_recipients = ?, phone = ?, address = ?, schedule = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1`)
      .bind(values.agencyName, values.contactName, values.contactEmail, JSON.stringify(contactRecipients), JSON.stringify(valuationRecipients), values.phone, values.address, values.schedule)
      .run();
    return Response.json({ settings: await readSettings() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudieron guardar los ajustes." }, { status: 500 });
  }
}