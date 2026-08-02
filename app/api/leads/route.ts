import { getDb } from "../../../db";
import { leads } from "../../../db/schema";
import { ensureDatabaseSchema } from "../../../db/ensure-schema";

type LeadPayload = { propertyId?: number; name?: string; email?: string; phone?: string; message?: string; website?: string };

export async function POST(request: Request) {
  await ensureDatabaseSchema();
  try {
    const payload = await request.json() as LeadPayload;
    if (payload.website) return Response.json({ ok: true }, { status: 201 });
    const name = String(payload.name ?? "").trim();
    const email = String(payload.email ?? "").trim();
    const phone = String(payload.phone ?? "").trim();
    const message = String(payload.message ?? "").trim();
    if (!name || !message || (!email && !phone)) return Response.json({ error: "Completá tu nombre, un medio de contacto y el mensaje." }, { status: 400 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Ingresá un email válido." }, { status: 400 });
    const [created] = await getDb().insert(leads).values({ propertyId: payload.propertyId || null, name, email: email || null, phone: phone || null, message }).returning({ id: leads.id });
    return Response.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo enviar la consulta." }, { status: 500 });
  }
}
