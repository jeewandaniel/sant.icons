import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Fuse from "fuse.js";

export interface IconRecord {
  id: string;
  name: string;
  library: string;
  libraryLabel: string;
  category: string;
  style: "stroke" | "solid" | "duotone" | "filled" | "mixed";
  tags: string[];
  svg: string;
  license: "MIT" | "Apache-2.0" | "CC0" | "ISC";
  version: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

let cached: { icons: IconRecord[]; index: Fuse<IconRecord> } | null = null;

export async function loadManifest() {
  if (cached) return cached;
  const path = resolve(__dirname, "..", "data", "icons.json");
  const raw = await readFile(path, "utf8");
  const icons: IconRecord[] = JSON.parse(raw);
  const index = new Fuse(icons, {
    keys: [
      { name: "name", weight: 3 },
      { name: "tags", weight: 2 },
      { name: "category", weight: 1 },
      { name: "library", weight: 0.5 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 1,
  });
  cached = { icons, index };
  return cached;
}
