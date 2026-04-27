import { loadManifest } from "../manifest.js";
import type { IconRecord } from "../types.js";

export const searchInputSchema = {
  type: "object",
  properties: {
    query: { type: "string", description: "Search term, e.g. 'arrow right'" },
    library: { type: "string", description: "Filter to one library (e.g. lucide, heroicons, tabler, phosphor, bootstrap, feather)" },
    style: { type: "string", description: "Filter by style: stroke | solid | duotone | filled" },
    category: { type: "string", description: "Filter by category" },
    limit: { type: "number", description: "Max results (default 10, max 50)" },
  },
  required: ["query"],
} as const;

export interface SearchInput {
  query: string;
  library?: string;
  style?: string;
  category?: string;
  limit?: number;
}

export async function runSearch(input: SearchInput) {
  const { icons, index } = await loadManifest();
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 50);

  let pool: IconRecord[] = icons;
  if (input.library) pool = pool.filter((i) => i.library === input.library);
  if (input.style) pool = pool.filter((i) => i.style === input.style);
  if (input.category) pool = pool.filter((i) => i.category === input.category);

  let results: IconRecord[];
  if (input.query.trim()) {
    const hits = index.search(input.query.trim()).map((r) => r.item);
    if (input.library || input.style || input.category) {
      const allow = new Set(pool.map((i) => i.id));
      results = hits.filter((h) => allow.has(h.id));
    } else {
      results = hits;
    }
  } else {
    results = pool;
  }

  return results.slice(0, limit).map((i) => ({
    id: i.id,
    name: i.name,
    library: i.library,
    libraryLabel: i.libraryLabel,
    category: i.category,
    tags: i.tags,
    style: i.style,
  }));
}
