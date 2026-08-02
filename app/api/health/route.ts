import { ensureDatabaseSchema } from "../../../db/ensure-schema";

export async function GET() {
  try {
    await ensureDatabaseSchema();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[database-health]", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
