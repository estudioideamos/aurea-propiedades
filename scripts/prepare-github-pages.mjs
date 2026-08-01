import { readFile, writeFile } from "node:fs/promises";

const adminPage = new URL("../app/admin/page.tsx", import.meta.url);
const source = await readFile(adminPage, "utf8");
const prepared = source.replace(
  'export const dynamic = "force-dynamic";',
  'export const dynamic = "force-static";',
);
if (prepared === source) throw new Error("No se encontro la configuracion dinamica del panel.");
await writeFile(adminPage, prepared, "utf8");