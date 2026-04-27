import { readdir, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { normaliseSvg } from "../normalise.js";
import type { IconRecord } from "../types.js";

const require = createRequire(import.meta.url);

function nameToTags(name: string): string[] {
  return name.split("-").filter(Boolean);
}

async function readVariant(
  rootDir: string,
  variant: "outline" | "solid",
  version: string,
): Promise<IconRecord[]> {
  const dir = resolve(rootDir, "24", variant);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".svg"));
  const records: IconRecord[] = [];
  for (const f of files) {
    const name = f.replace(/\.svg$/, "");
    const raw = await readFile(resolve(dir, f), "utf8");
    const svg = normaliseSvg(raw);
    const id = variant === "outline" ? `heroicons-${name}` : `heroicons-${name}-solid`;
    records.push({
      id,
      name: variant === "outline" ? name : `${name}-solid`,
      library: "heroicons",
      libraryLabel: "Heroicons",
      category: "general",
      style: variant === "outline" ? "stroke" : "solid",
      tags: [...nameToTags(name), variant === "outline" ? "outline" : "solid"],
      svg,
      license: "MIT",
      version,
    });
  }
  return records;
}

export async function fetchHeroicons(): Promise<IconRecord[]> {
  const pkgPath = require.resolve("heroicons/package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8")) as { version: string };
  const root = dirname(pkgPath);
  console.log(`[heroicons] version: ${pkg.version}`);
  const [outline, solid] = await Promise.all([
    readVariant(root, "outline", pkg.version),
    readVariant(root, "solid", pkg.version),
  ]);
  return [...outline, ...solid];
}
