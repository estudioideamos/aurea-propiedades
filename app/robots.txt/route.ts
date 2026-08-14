import { SITE_URL } from "../seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = [
    "User-agent: *", "Allow: /", "Disallow: /admin", "Disallow: /api/", "",
    "User-agent: OAI-SearchBot", "Allow: /", "Disallow: /admin", "Disallow: /api/", "",
    "User-agent: ChatGPT-User", "Allow: /", "Disallow: /admin", "Disallow: /api/", "",
    "User-agent: GPTBot", "Allow: /", "Disallow: /admin", "Disallow: /api/", "",
    `Sitemap: ${SITE_URL}/sitemap.xml`, "",
  ].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
