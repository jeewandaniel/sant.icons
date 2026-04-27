import { readdir, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { normaliseSvg } from "../normalise.js";
import type { IconRecord } from "../types.js";

const require = createRequire(import.meta.url);

function nameToTags(name: string): string[] {
  return name.split("-").filter(Boolean);
}

export async function fetchFeather(): Promise<IconRecord[]> {
  const pkgPath = require.resolve("feather-icons/package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8")) as { version: string };
  const root = dirname(pkgPath);
  console.log(`[feather] version: ${pkg.version}`);

  const dir = resolve(root, "dist", "icons");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".svg"));
  const records: IconRecord[] = [];
  for (const f of files) {
    const name = f.replace(/\.svg$/, "");
    const raw = await readFile(resolve(dir, f), "utf8");
    const svg = normaliseSvg(raw);
    records.push({
      id: `feather-${name}`,
      name,
      library: "feather",
      libraryLabel: "Feather",
      category: "general",
      style: "stroke",
      tags: nameToTags(name),
      svg,
      license: "MIT",
      version: pkg.version,
    });
  }
  return records;
}
