import { env } from "cloudflare:workers";
import { ensureDatabaseSchema } from "../../../db/ensure-schema";
import { handleLeadPayload, type LeadPayload } from "../../lead-handler";

const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 10;

function clientIp(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return Response.json({ error: "Formato de solicitud no admitido." }, { status: 415 });
  }
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_REQUEST_BYTES) return Response.json({ error: "La consulta es demasiado extensa." }, { status: 413 });

  try {
    await ensureDatabaseSchema();
    const rawPayload = await request.text();
    if (new TextEncoder().encode(rawPayload).byteLength > MAX_REQUEST_BYTES) {
      return Response.json({ error: "La consulta es demasiado extensa." }, { status: 413 });
    }
    const payload = JSON.parse(rawPayload) as LeadPayload;
    if (payload.website) return Response.json({ ok: true }, { status: 201 });

    const ip = clientIp(request).slice(0, 64);
    const cutoff = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
    await env.DB.prepare("DELETE FROM lead_submission_attempts WHERE attempted_at < ?").bind(cutoff).run();
    const attempts = await env.DB.prepare("SELECT COUNT(*) AS total FROM lead_submission_attempts WHERE ip = ? AND attempted_at >= ?").bind(ip, cutoff).first<{ total: number }>();
    if (Number(attempts?.total ?? 0) >= MAX_ATTEMPTS) {
      return Response.json({ error: "Recibimos varias consultas seguidas. Esperá unos minutos y volvé a intentar." }, { status: 429, headers: { "Retry-After": String(WINDOW_MINUTES * 60) } });
    }
    await env.DB.prepare("INSERT INTO lead_submission_attempts(ip, attempted_at) VALUES(?, ?)").bind(ip, new Date().toISOString()).run();

    return handleLeadPayload(request, payload);
  } catch {
    return Response.json({ error: "No se pudo enviar la consulta. Intentá nuevamente." }, { status: 500 });
  }
}