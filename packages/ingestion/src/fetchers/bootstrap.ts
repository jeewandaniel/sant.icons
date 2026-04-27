import { readdir, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { normaliseSvg } from "../normalise.js";
import type { IconRecord } from "../types.js";

const require = createRequire(import.meta.url);

function nameToTags(name: string): string[] {
  return name.split("-").filter(Boolean);
}

export async function fetchBootstrap(): Promise<IconRecord[]> {
  const pkgPath = require.resolve("bootstrap-icons/package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8")) as { version: string };
  const root = dirname(pkgPath);
  console.log(`[bootstrap] version: ${pkg.version}`);

  const dir = resolve(root, "icons");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".svg"));
  const records: IconRecord[] = [];
  for (const f of files) {
    const name = f.replace(/\.svg$/, "");
    const raw = await readFile(resolve(dir, f), "utf8");
    const svg = normaliseSvg(raw);
    const isFill = name.endsWith("-fill");
    records.push({
      id: `bootstrap-${name}`,
      name,
      library: "bootstrap",
      libraryLabel: "Bootstrap Icons",
      category: "general",
      style: isFill ? "filled" : "stroke",
      tags: nameToTags(name),
      svg,
      license: "MIT",
      version: pkg.version,
    });
  }
  return records;
}
