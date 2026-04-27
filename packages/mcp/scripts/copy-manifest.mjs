// Copies icons.json from apps/web/public into the package's data/ dir
// so the published npm tarball ships with a bundled manifest.
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, "..", "..", "..", "apps", "web", "public", "icons.json");
const dst = resolve(__dirname, "..", "data", "icons.json");

await mkdir(dirname(dst), { recursive: true });
await copyFile(src, dst);
console.log(`copied manifest → ${dst}`);
