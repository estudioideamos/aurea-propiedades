import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { ensureDatabaseSchema } from "../../../../db/ensure-schema";

const ADMIN_EMAIL = "r.lavega@ideamos.com.ar";

type SettingsPayload = {
  agencyName?: string;
  contactName?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  schedule?: string;
};

async function authorized() {
  const user = await getChatGPTUser();
  return Boolean(user && user.email.toLowerCase() === ADMIN_EMAIL);
}

async function readSettings() {
  await ensureDatabaseSchema();
  return env.DB.prepare(`SELECT
    agency_name AS agencyName,
    contact_name AS contactName,
    contact_email AS contactEmail,
    phone,
    address,
    schedule,
    updated_at AS updatedAt
    FROM site_settings WHERE id = 1`).first();
}

export async function GET() {
  if (!(await authorized())) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    return Response.json({ settings: await readSettings() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudieron cargar los ajustes." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await authorized())) return Response.json({ error: "No autorizado" }, { status: 401 });
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
      return Response.json({ error: "Completa todos los datos de contacto." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) {
      return Response.json({ error: "Ingresa un correo valido." }, { status: 400 });
    }
    await ensureDatabaseSchema();
    await env.DB.prepare(`UPDATE site_settings SET
      agency_name = ?, contact_name = ?, contact_email = ?, phone = ?, address = ?, schedule = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1`)
      .bind(values.agencyName, values.contactName, values.contactEmail, values.phone, values.address, values.schedule)
      .run();
    return Response.json({ settings: await readSettings() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudieron guardar los ajustes." }, { status: 500 });
  }
}