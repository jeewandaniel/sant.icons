import { readdir, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { normaliseSvg } from "../normalise.js";
import type { IconRecord } from "../types.js";

const require = createRequire(import.meta.url);

interface TablerMeta {
  name: string;
  category?: string;
  tags?: (string | number)[];
}

function nameToTags(name: string): string[] {
  return name.split("-").filter(Boolean);
}

async function readVariant(
  rootDir: string,
  variant: "outline" | "filled",
  version: string,
  metaIndex: Map<string, TablerMeta>,
): Promise<IconRecord[]> {
  const dir = resolve(rootDir, "icons", variant);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".svg"));
  const records: IconRecord[] = [];
  for (const f of files) {
    const name = f.replace(/\.svg$/, "");
    const raw = await readFile(resolve(dir, f), "utf8");
    const svg = normaliseSvg(raw);
    const meta = metaIndex.get(name);
    const category = (meta?.category ?? "general").toLowerCase();
    const tagSet = new Set<string>([
      ...nameToTags(name),
      category,
      ...((meta?.tags ?? []).map((t) => String(t).toLowerCase())),
      variant,
    ]);
    const id = variant === "outline" ? `tabler-${name}` : `tabler-${name}-filled`;
    records.push({
      id,
      name: variant === "outline" ? name : `${name}-filled`,
      library: "tabler",
      libraryLabel: "Tabler",
      category,
      style: variant === "outline" ? "stroke" : "filled",
      tags: [...tagSet],
      svg,
      license: "MIT",
      version,
    });
  }
  return records;
}

export async function fetchTabler(): Promise<IconRecord[]> {
  // @tabler/icons exports map remaps "./*" -> "./icons/*" which blocks
  // package.json resolution. Resolve a known SVG and walk up instead.
  const sample = require.resolve("@tabler/icons/outline/heart.svg");
  const root = resolve(dirname(sample), "..", "..");
  const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8")) as { version: string };
  console.log(`[tabler] version: ${pkg.version}`);

  const metaRaw = JSON.parse(await readFile(resolve(root, "icons.json"), "utf8")) as Record<string, TablerMeta>;
  const metaIndex = new Map<string, TablerMeta>();
  for (const [key, value] of Object.entries(metaRaw)) {
    metaIndex.set(value.name ?? key, value);
  }

  const [outline, filled] = await Promise.all([
    readVariant(root, "outline", pkg.version, metaIndex),
    readVariant(root, "filled", pkg.version, metaIndex),
  ]);
  return [...outline, ...filled];
}
