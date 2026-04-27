import { loadManifest } from "../manifest.js";
import type { IconRecord } from "../types.js";

export const listInputSchema = {
  type: "object",
  properties: {},
} as const;

export async function runList() {
  const { icons } = await loadManifest();
  const map = new Map<
    string,
    {
      slug: string;
      label: string;
      count: number;
      styles: Set<IconRecord["style"]>;
      license: string;
      version: string;
    }
  >();
  for (const i of icons) {
    let entry = map.get(i.library);
    if (!entry) {
      entry = {
        slug: i.library,
        label: i.libraryLabel,
        count: 0,
        styles: new Set(),
        license: i.license,
        version: i.version,
      };
      map.set(i.library, entry);
    }
    entry.count++;
    entry.styles.add(i.style);
  }
  return [...map.values()]
    .map((e) => ({
      slug: e.slug,
      label: e.label,
      count: e.count,
      styles: [...e.styles],
      license: e.license,
      version: e.version,
    }))
    .sort((a, b) => b.count - a.count);
}
