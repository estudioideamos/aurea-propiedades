import { readFile, rm, writeFile } from "node:fs/promises";

async function replaceIn(relativePath, replacements) {
  const file = new URL(relativePath, import.meta.url);
  let source = await readFile(file, "utf8");
  for (const [from, to] of replacements) {
    const next = source.replace(from, to);
    if (next === source) throw new Error(`No se encontr\u00f3 la configuraci\u00f3n esperada en ${relativePath}.`);
    source = next;
  }
  await writeFile(file, source, "utf8");
}

await replaceIn("../app/page.tsx", [[
  'export const dynamic = "force-dynamic";',
  'export const dynamic = "force-static";',
]]);
await replaceIn("../app/propiedades/page.tsx", [[
  'export const dynamic = "force-dynamic";',
  'export const dynamic = "force-static";',
]]);
await replaceIn("../app/propiedades/[slug]/page.tsx", [
  ['export const dynamic = "force-dynamic";', 'export const dynamic = "force-static";'],
  ['export const dynamicParams = true;', 'export const dynamicParams = false;'],
]);

await replaceIn("../app/emprendimientos/page.tsx", [[
  'export const dynamic = "force-dynamic";',
  'export const dynamic = "force-static";',
]]);
await replaceIn("../app/emprendimientos/[slug]/page.tsx", [
  ['export const dynamic = "force-dynamic";', 'export const dynamic = "force-static";'],
  ['export const dynamicParams = true;', 'export const dynamicParams = false;'],
]);

await writeFile(
  new URL("../app/live-properties.ts", import.meta.url),
  `import { properties, type Property } from "./properties";

export async function getLiveProperties() { return properties; }
export async function getLiveProperty(slug: string): Promise<{ property: Property | null; all: Property[] }> {
  return { property: properties.find((item) => item.slug === slug) ?? null, all: properties };
}
`,
  "utf8",
);

await writeFile(
  new URL("../app/live-developments.ts", import.meta.url),
  `import { developments, type Development } from "./developments";
export async function getLiveDevelopments(): Promise<Development[]> { return developments; }
export async function getLiveDevelopment(slug: string) { return { development: developments.find((item) => item.slug === slug) ?? null, all: developments }; }
`,
  "utf8",
);

await rm(new URL("../app/admin", import.meta.url), { recursive: true, force: true });
await rm(new URL("../app/api/auth", import.meta.url), { recursive: true, force: true });
await rm(new URL("../app/admin-auth.ts", import.meta.url), { force: true });
await rm(new URL("../app/tokko-integration.ts", import.meta.url), { force: true });
await rm(new URL("../app/chatgpt-auth.ts", import.meta.url), { force: true });
await rm(new URL("../db", import.meta.url), { recursive: true, force: true });
await rm(new URL("../app/api/admin", import.meta.url), { recursive: true, force: true });
await rm(new URL("../app/api/settings", import.meta.url), { recursive: true, force: true });
await rm(new URL("../app/api/health", import.meta.url), { recursive: true, force: true });
await rm(new URL("../app/api/leads", import.meta.url), { recursive: true, force: true });
await rm(new URL("../app/api/media", import.meta.url), { recursive: true, force: true });
