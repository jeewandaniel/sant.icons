import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Fuse from "fuse.js";
import type { IconRecord } from "./types.js";

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

export function customiseSvg(
  icon: IconRecord,
  opts: { size?: number; color?: string; strokeWidth?: number },
): string {
  const size = opts.size ?? 24;
  const color = opts.color ?? "currentColor";
  const strokeWidth = opts.strokeWidth ?? 2;
  const isStroke = icon.style === "stroke";

  let svg = icon.svg
    .replace(/width="[^"]*"/, `width="${size}"`)
    .replace(/height="[^"]*"/, `height="${size}"`);

  if (isStroke) {
    if (/stroke=/.test(svg)) {
      svg = svg.replace(/stroke="[^"]*"/g, `stroke="${color}"`);
    } else {
      svg = svg.replace(/<svg([^>]*)>/, `<svg$1 stroke="${color}">`);
    }
    if (/stroke-width=/.test(svg)) {
      svg = svg.replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`);
    } else {
      svg = svg.replace(/<svg([^>]*)>/, `<svg$1 stroke-width="${strokeWidth}">`);
    }
    if (!/fill=/.test(svg)) {
      svg = svg.replace(/<svg([^>]*)>/, `<svg$1 fill="none">`);
    }
  } else {
    if (/fill=/.test(svg)) {
      svg = svg.replace(/fill="[^"]*"/g, `fill="${color}"`);
    } else {
      svg = svg.replace(/<svg([^>]*)>/, `<svg$1 fill="${color}">`);
    }
  }
  return svg;
}
