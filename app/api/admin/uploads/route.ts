import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../chatgpt-auth";

const ADMIN_EMAIL = "r.lavega@ideamos.com.ar";
const MAX_FILES = 12;
const MAX_BYTES = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

type MediaBucket = {
  put(key: string, value: ReadableStream, options?: { httpMetadata?: { contentType: string; cacheControl: string }; customMetadata?: Record<string, string> }): Promise<unknown>;
  delete(key: string): Promise<void>;
};

async function authorized() {
  const user = await getChatGPTUser();
  return Boolean(user && user.email.toLowerCase() === ADMIN_EMAIL);
}

function bucket() {
  const media = (env as unknown as { MEDIA?: MediaBucket }).MEDIA;
  if (!media) throw new Error("El almacenamiento de imágenes no está disponible.");
  return media;
}

function safeName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "imagen";
}

export async function POST(request: Request) {
  if (!(await authorized())) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    const data = await request.formData();
    const files = data.getAll("files").filter((entry): entry is File => entry instanceof File);
    if (!files.length) return Response.json({ error: "Seleccioná al menos una imagen." }, { status: 400 });
    if (files.length > MAX_FILES) return Response.json({ error: `Podés cargar hasta ${MAX_FILES} imágenes por vez.` }, { status: 400 });
    for (const file of files) {
      if (!allowedTypes.has(file.type)) return Response.json({ error: `${file.name}: formato no admitido.` }, { status: 400 });
      if (file.size > MAX_BYTES) return Response.json({ error: `${file.name}: supera los 10 MB.` }, { status: 400 });
    }
    const media = bucket();
    const urls: string[] = [];
    for (const file of files) {
      const key = `properties/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName(file.name)}`;
      await media.put(key, file.stream(), {
        httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
        customMetadata: { originalName: file.name },
      });
      urls.push(`/api/media/${key}`);
    }
    return Response.json({ urls }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudieron cargar las imágenes." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await authorized())) return Response.json({ error: "No autorizado" }, { status: 401 });
  const url = new URL(request.url).searchParams.get("url") ?? "";
  const marker = "/api/media/";
  if (!url.includes(marker)) return Response.json({ error: "La imagen no pertenece al almacenamiento administrado." }, { status: 400 });
  await bucket().delete(decodeURIComponent(url.split(marker)[1]));
  return Response.json({ ok: true });
}
