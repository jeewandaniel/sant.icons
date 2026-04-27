import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { icons as phosphorMeta } from "@phosphor-icons/core";
import { normaliseSvg } from "../normalise.js";
import type { IconRecord } from "../types.js";

const require = createRequire(import.meta.url);

type Weight = "regular" | "bold" | "duotone" | "fill" | "light" | "thin";
const WEIGHTS: Weight[] = ["regular", "bold", "duotone", "fill", "light", "thin"];

function nameToTags(name: string): string[] {
  return name.split("-").filter(Boolean);
}

function styleForWeight(w: Weight): IconRecord["style"] {
  if (w === "duotone") return "duotone";
  if (w === "fill") return "filled";
  return "stroke";
}

export async function fetchPhosphor(): Promise<IconRecord[]> {
  // package.json is not in @phosphor-icons/core's exports map.
  // Resolve a known asset and walk up two dirs to package root.
  const sample = require.resolve("@phosphor-icons/core/assets/regular/heart.svg");
  const root = resolve(dirname(sample), "..", "..");
  const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8")) as { version: string };
  console.log(`[phosphor] version: ${pkg.version}, ${phosphorMeta.length} unique icons × ${WEIGHTS.length} weights`);

  const records: IconRecord[] = [];
  for (const meta of phosphorMeta) {
    const baseName = meta.name;
    const cleanTags = (meta.tags as readonly string[]).filter((t) => t !== "*new*");
    for (const weight of WEIGHTS) {
      const filename = weight === "regular" ? `${baseName}.svg` : `${baseName}-${weight}.svg`;
      const path = resolve(root, "assets", weight, filename);
      let raw: string;
      try {
        raw = await readFile(path, "utf8");
      } catch {
        continue;
      }
      const svg = normaliseSvg(raw);
      const id = weight === "regular" ? `phosphor-${baseName}` : `phosphor-${baseName}-${weight}`;
      const name = weight === "regular" ? baseName : `${baseName}-${weight}`;
      const category = (meta.categories[0] ?? "general").toString().toLowerCase();
      const tagSet = new Set<string>([
        ...nameToTags(baseName),
        category,
        ...cleanTags.map((t) => t.toLowerCase()),
        ...(meta.categories as readonly string[]).map((c) => c.toLowerCase()),
        weight,
      ]);
      records.push({
        id,
        name,
        library: "phosphor",
        libraryLabel: "Phosphor",
        category,
        style: styleForWeight(weight),
        tags: [...tagSet],
        svg,
        license: "MIT",
        version: pkg.version,
      });
    }
  }
  return records;
}
