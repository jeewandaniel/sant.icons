import Fuse from "fuse.js";
import type { IconRecord } from "./types";

let fuse: Fuse<IconRecord> | null = null;

export function buildIndex(icons: IconRecord[]): Fuse<IconRecord> {
  if (fuse) return fuse;
  fuse = new Fuse(icons, {
    keys: [
      { name: "name", weight: 3 },
      { name: "tags", weight: 2 },
      { name: "category", weight: 1 },
      { name: "library", weight: 0.5 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 1,
    includeScore: false,
  });
  return fuse;
}

export interface Filters {
  library?: string;
  style?: string;
  category?: string;
}

export function search(icons: IconRecord[], query: string, filters: Filters): IconRecord[] {
  let pool = icons;
  if (filters.library) pool = pool.filter((i) => i.library === filters.library);
  if (filters.style) pool = pool.filter((i) => i.style === filters.style);
  if (filters.category) pool = pool.filter((i) => i.category === filters.category);

  if (!query.trim()) return pool;

  // Fuse on the whole library is faster than filter-then-search for our size.
  const idx = buildIndex(icons);
  const hits = idx.search(query.trim()).map((r) => r.item);
  if (filters.library || filters.style || filters.category) {
    const allow = new Set(pool.map((i) => i.id));
    return hits.filter((h) => allow.has(h.id));
  }
  return hits;
}
