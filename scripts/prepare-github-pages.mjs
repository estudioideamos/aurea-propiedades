import { readFile, rm, writeFile } from "node:fs/promises";

async function replaceIn(relativePath, replacements) {
  const file = new URL(relativePath, import.meta.url);
  let source = await readFile(file, "utf8");
  for (const [from, to] of replacements) {
    const next = source.replace(from, to);
    if (next === source) throw new Error(`No se encontró la configuración esperada en ${relativePath}.`);
    source = next;
  }
  await writeFile(file, source, "utf8");
}

await replaceIn("../app/admin/page.tsx", [[
  'export const dynamic = "force-dynamic";',
  'export const dynamic = "force-static";',
]]);
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

await rm(new URL("../app/api/admin", import.meta.url), { recursive: true, force: true });