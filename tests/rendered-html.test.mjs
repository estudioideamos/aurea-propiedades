import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("keeps patched framework and build dependencies pinned", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  assert.equal(packageJson.dependencies.next, "16.3.0");
  assert.equal(packageJson.dependencies.react, "19.2.8");
  assert.equal(packageJson.dependencies["react-dom"], "19.2.8");
  assert.equal(packageJson.devDependencies["react-server-dom-webpack"], "19.2.8");
  assert.equal(packageJson.devDependencies.vite, "8.2.1");
  assert.equal(packageJson.devDependencies.vinext, "0.0.45");
  assert.equal(packageJson.devDependencies["drizzle-kit"], undefined);
});

test("applies browser security headers and prevents private caching", async () => {
  const worker = await read("worker/index.ts");
  assert.match(worker, /X-Content-Type-Options.+nosniff/);
  assert.match(worker, /X-Frame-Options.+SAMEORIGIN/);
  assert.match(worker, /Strict-Transport-Security/);
  assert.match(worker, /Permissions-Policy/);
  assert.match(worker, /\/api\/admin\//);
  assert.match(worker, /\/api\/auth\//);
  assert.match(worker, /no-store, max-age=0/);
});

test("protects admin mutations and public lead intake", async () => {
  const [auth, leads, gitignore] = await Promise.all([
    read("app/admin-auth.ts"),
    read("app/api/leads/route.ts"),
    read(".gitignore"),
  ]);
  assert.match(auth, /request\.headers\.get\("origin"\)/);
  assert.match(auth, /new URL\(origin\)\.origin===new URL\(request\.url\)\.origin/);
  assert.match(auth, /HttpOnly; SameSite=Lax/);
  assert.match(auth, /ATTEMPT_LIMIT = 5/);
  assert.match(leads, /MAX_REQUEST_BYTES = 16 \* 1024/);
  assert.match(leads, /content-type/);
  assert.match(leads, /TextEncoder\(\)\.encode\(rawPayload\)\.byteLength/);
  assert.match(leads, /MAX_ATTEMPTS = 5/);
  assert.match(leads, /lead_submission_attempts/);
  assert.match(gitignore, /\.env\*/);
});
