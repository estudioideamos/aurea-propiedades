import { getLiveDevelopments } from "../live-developments";
import { getLiveProperties } from "../live-properties";
import { absoluteUrl } from "../seo";

export const dynamic = "force-dynamic";

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
function validDate(value?: string) {
  if (!value || Number.isNaN(Date.parse(value))) return undefined;
  return new Date(value).toISOString();
}

export async function GET() {
  const [properties, developments] = await Promise.all([getLiveProperties(), getLiveDevelopments()]);
  const pages = [
    { path: "/", priority: "1.0", frequency: "daily" },
    { path: "/propiedades", priority: "0.9", frequency: "daily" },
    { path: "/emprendimientos", priority: "0.9", frequency: "daily" },
    { path: "/nosotros", priority: "0.7", frequency: "monthly" },
    { path: "/servicios", priority: "0.8", frequency: "monthly" },
    { path: "/tasacion", priority: "0.8", frequency: "monthly" },
    { path: "/contacto", priority: "0.7", frequency: "monthly" },
  ];
  const entries = [
    ...pages.map((page) => ({ loc: absoluteUrl(page.path), changefreq: page.frequency, priority: page.priority, lastmod: undefined as string | undefined })),
    ...properties.map((property) => ({ loc: absoluteUrl(`/propiedades/${property.slug}`), changefreq: "weekly", priority: "0.8", lastmod: validDate(property.updatedAt) })),
    ...developments.map((development) => ({ loc: absoluteUrl(`/emprendimientos/${development.slug}`), changefreq: "weekly", priority: "0.8", lastmod: validDate(development.updatedAt) })),
  ];
  const urls = entries.map((entry) => [
    "  <url>", `    <loc>${escapeXml(entry.loc)}</loc>`,
    ...(entry.lastmod ? [`    <lastmod>${entry.lastmod}</lastmod>`] : []),
    `    <changefreq>${entry.changefreq}</changefreq>`, `    <priority>${entry.priority}</priority>`, "  </url>",
  ].join("\n")).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=900",
    },
  });
}
