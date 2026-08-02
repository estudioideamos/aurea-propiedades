import { env } from "cloudflare:workers";

type MediaBucket = {
  get(key: string): Promise<{ body: ReadableStream; httpEtag: string; httpMetadata?: { contentType?: string; cacheControl?: string } } | null>;
};

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> | { key: string[] } }) {
  const params = await context.params;
  const key = params.key.join("/");
  const bucket = (env as unknown as { MEDIA?: MediaBucket }).MEDIA;
  if (!bucket) return new Response("Media storage unavailable", { status: 503 });
  const object = await bucket.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": object.httpMetadata?.cacheControl ?? "public, max-age=31536000, immutable",
      etag: object.httpEtag,
    },
  });
}
