import { desc, eq } from "drizzle-orm";
import { isAdminRequestAuthorized } from "../../../admin-auth";
import { getDb } from "../../../../db";
import { leads } from "../../../../db/schema";
import { ensureDatabaseSchema } from "../../../../db/ensure-schema";

const validStatuses = new Set(["new", "contacted", "closed"]);

async function authorized(request: Request) {
  return isAdminRequestAuthorized(request);
}

export async function GET(request: Request) {
  if (!(await authorized(request))) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    await ensureDatabaseSchema();
    const rows = await getDb().select().from(leads).orderBy(desc(leads.createdAt), desc(leads.id));
    return Response.json({ leads: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudieron cargar las consultas." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await authorized(request))) return Response.json({ error: "No autorizado" }, { status: 401 });
  await ensureDatabaseSchema();
  const payload = await request.json() as { id?: number; status?: string };
  if (!payload.id || !validStatuses.has(String(payload.status))) return Response.json({ error: "Datos inválidos." }, { status: 400 });
  const [updated] = await getDb().update(leads).set({ status: String(payload.status) }).where(eq(leads.id, payload.id)).returning();
  if (!updated) return Response.json({ error: "Consulta no encontrada." }, { status: 404 });
  return Response.json({ lead: updated });
}

export async function DELETE(request: Request) {
  if (!(await authorized(request))) return Response.json({ error: "No autorizado" }, { status: 401 });
  await ensureDatabaseSchema();
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Falta el identificador." }, { status: 400 });
  await getDb().delete(leads).where(eq(leads.id, id));
  return Response.json({ ok: true });
}
