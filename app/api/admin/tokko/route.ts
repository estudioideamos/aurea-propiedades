import { getAdminIdentityFromRequest, isAdminRequestAuthorized } from "../../../admin-auth";
import { getTokkoIntegration, saveTokkoIntegration, syncTokkoForAdmin, testTokkoConnection, unlinkTokkoIntegration } from "../../../tokko-integration";

type Payload = {
  action?: "test" | "sync";
  enabled?: boolean;
  apiKey?: string;
  companyId?: number | null;
  branchId?: number | null;
};

async function identity(request: Request) {
  if (!(await isAdminRequestAuthorized(request))) return null;
  return getAdminIdentityFromRequest(request);
}

function optionalPositiveInteger(value: unknown) {
  if (value === "" || value == null) return null;
  const parsed = Math.trunc(Number(value));
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error("Los identificadores de empresa y sucursal deben ser numeros positivos.");
  return parsed;
}

export async function GET(request: Request) {
  const admin = await identity(request);
  if (!admin) return Response.json({ error: "No autorizado" }, { status: 401 });
  try { return Response.json({ integration: await getTokkoIntegration(admin.id) }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No se pudo cargar Tokko." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  const admin = await identity(request);
  if (!admin) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    const payload = await request.json() as Payload;
    const integration = await saveTokkoIntegration(admin.id, {
      enabled: Boolean(payload.enabled),
      apiKey: String(payload.apiKey ?? "").trim() || undefined,
      companyId: optionalPositiveInteger(payload.companyId),
      branchId: optionalPositiveInteger(payload.branchId),
    });
    return Response.json({ integration });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo guardar Tokko." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const admin = await identity(request);
  if (!admin) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    const payload = await request.json() as Payload;
    if (payload.action === "test") {
      const result = await testTokkoConnection({
        adminId: admin.id,
        apiKey: String(payload.apiKey ?? "").trim() || undefined,
        companyId: optionalPositiveInteger(payload.companyId),
        branchId: optionalPositiveInteger(payload.branchId),
      });
      return Response.json({ result });
    }
    if (payload.action === "sync") {
      const result = await syncTokkoForAdmin(admin.id, { forceFull: true });
      return Response.json({ result, integration: await getTokkoIntegration(admin.id) });
    }
    return Response.json({ error: "Accion no valida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Tokko no respondio correctamente." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const admin = await identity(request);
  if (!admin) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    const result = await unlinkTokkoIntegration(admin.id);
    return Response.json({ result, integration: await getTokkoIntegration(admin.id) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo desvincular Tokko." }, { status: 400 });
  }
}
