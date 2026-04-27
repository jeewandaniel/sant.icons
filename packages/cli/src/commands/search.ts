import { loadManifest, type IconRecord } from "../manifest.js";

interface Opts {
  library?: string;
  style?: string;
  category?: string;
  limit?: string;
  json?: boolean;
}

export async function searchCommand(query: string, opts: Opts) {
  const { icons, index } = await loadManifest();
  const limit = Math.min(Math.max(parseInt(opts.limit ?? "20", 10) || 20, 1), 100);

  let pool: IconRecord[] = icons;
  if (opts.library) pool = pool.filter((i) => i.library === opts.library);
  if (opts.style) pool = pool.filter((i) => i.style === opts.style);
  if (opts.category) pool = pool.filter((i) => i.category === opts.category);

  let results: IconRecord[];
  if (query && query.trim()) {
    const hits = index.search(query.trim()).map((r) => r.item);
    if (opts.library || opts.style || opts.category) {
      const allow = new Set(pool.map((i) => i.id));
      results = hits.filter((h) => allow.has(h.id));
    } else {
      results = hits;
    }
  } else {
    results = pool;
  }

  const out = results.slice(0, limit).map((i) => ({
    id: i.id,
    name: i.name,
    library: i.library,
    style: i.style,
    category: i.category,
  }));

  if (opts.json) {
    process.stdout.write(JSON.stringify(out, null, 2) + "\n");
    return;
  }

  if (out.length === 0) {
    process.stderr.write("no results\n");
    return;
  }

  const widthId = Math.max(...out.map((r) => r.id.length), 4);
  process.stdout.write(`${"id".padEnd(widthId)}  style    category\n`);
  for (const r of out) {
    process.stdout.write(`${r.id.padEnd(widthId)}  ${r.style.padEnd(7)}  ${r.category}\n`);
  }
  process.stderr.write(`\n${results.length} results, showing ${out.length}\n`);
}
