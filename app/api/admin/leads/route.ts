import { desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { getDb } from "../../../../db";
import { leads } from "../../../../db/schema";

const ADMIN_EMAIL = "r.lavega@ideamos.com.ar";
const validStatuses = new Set(["new", "contacted", "closed"]);

async function authorized() {
  const user = await getChatGPTUser();
  return Boolean(user && user.email.toLowerCase() === ADMIN_EMAIL);
}

export async function GET() {
  if (!(await authorized())) return Response.json({ error: "No autorizado" }, { status: 401 });
  const rows = await getDb().select().from(leads).orderBy(desc(leads.createdAt), desc(leads.id));
  return Response.json({ leads: rows });
}

export async function PATCH(request: Request) {
  if (!(await authorized())) return Response.json({ error: "No autorizado" }, { status: 401 });
  const payload = await request.json() as { id?: number; status?: string };
  if (!payload.id || !validStatuses.has(String(payload.status))) return Response.json({ error: "Datos inválidos." }, { status: 400 });
  const [updated] = await getDb().update(leads).set({ status: String(payload.status) }).where(eq(leads.id, payload.id)).returning();
  if (!updated) return Response.json({ error: "Consulta no encontrada." }, { status: 404 });
  return Response.json({ lead: updated });
}

export async function DELETE(request: Request) {
  if (!(await authorized())) return Response.json({ error: "No autorizado" }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Falta el identificador." }, { status: 400 });
  await getDb().delete(leads).where(eq(leads.id, id));
  return Response.json({ ok: true });
}
