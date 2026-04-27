import "dotenv/config";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchLucide } from "./fetchers/lucide.js";
import { fetchHeroicons } from "./fetchers/heroicons.js";
import { fetchTabler } from "./fetchers/tabler.js";
import { fetchFeather } from "./fetchers/feather.js";
import { fetchBootstrap } from "./fetchers/bootstrap.js";
import { fetchPhosphor } from "./fetchers/phosphor.js";
import { fetchIconify, type IconifySource } from "./fetchers/iconify.js";
import { writeAllOg } from "./og.js";
import type { IconRecord } from "./types.js";

const ICONIFY_SOURCES: IconifySource[] = [
  { iconifySlug: "mdi", slug: "material", label: "Material Design", defaultStyle: "filled" },
  { iconifySlug: "fluent", slug: "fluent", label: "Fluent UI", defaultStyle: "stroke" },
  { iconifySlug: "hugeicons", slug: "huge", label: "Huge Icons", defaultStyle: "stroke" },
  { iconifySlug: "simple-icons", slug: "brand", label: "Simple Icons", defaultStyle: "filled" },
  { iconifySlug: "mingcute", slug: "mingcute", label: "Mingcute", defaultStyle: "stroke" },
  { iconifySlug: "carbon", slug: "carbon", label: "Carbon", defaultStyle: "stroke" },
  { iconifySlug: "iconoir", slug: "iconoir", label: "Iconoir", defaultStyle: "stroke" },
  { iconifySlug: "octicon", slug: "octicon", label: "Octicons", defaultStyle: "filled" },
  { iconifySlug: "pixelarticons", slug: "pixelart", label: "Pixel Art", defaultStyle: "stroke" },
  { iconifySlug: "majesticons", slug: "majesticons", label: "Majesticons", defaultStyle: "stroke" },
  { iconifySlug: "iconamoon", slug: "iconamoon", label: "IconaMoon", defaultStyle: "stroke" },
  { iconifySlug: "devicon", slug: "devicon", label: "Devicon", defaultStyle: "filled" },
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, "../../../apps/web/public");
const OUTPUT_FULL = resolve(PUBLIC_DIR, "icons.json");
const OUTPUT_INDEX = resolve(PUBLIC_DIR, "index.json");
const OUTPUT_SVG_DIR = resolve(PUBLIC_DIR, "svgs");
const OUTPUT_SPOTLIGHT = resolve(PUBLIC_DIR, "library-spotlight.json");

// Hand-picked representative icon names per library, tried in order.
// First match in the library wins. Falls back to first alphabetical name.
const SPOTLIGHT_PREFERENCES: Record<string, string[]> = {
  lucide: ["pen-tool"],
  heroicons: ["bolt"],
  tabler: ["compass"],
  phosphor: ["atom"],
  bootstrap: ["bootstrap"],
  feather: ["feather"],
  material: ["circle"],
  fluent: ["cube-24-regular"],
  huge: ["sparkles"],
  brand: ["tailwindcss", "vercel", "nextdotjs"],
  mingcute: ["cookie-line"],
  carbon: ["sun"],
  iconoir: ["sparks"],
  octicon: ["mark-github-24", "mark-github-16"],
  pixelart: ["command"],
  majesticons: ["crown-line"],
  iconamoon: ["star-light", "star-fill"],
  devicon: ["nodejs", "typescript", "javascript"],
};

/**
 * Strip embedded fill/stroke colours from an SVG so it inherits currentColor.
 * Used only for sidebar spotlight previews — leaves the actual library chunks
 * untouched so e.g. Devicon's branded React logo still renders in colour
 * when the user picks it from the grid.
 */
function monochromeSvg(svg: string): string {
  let out = svg;
  out = out.replace(/\sfill="(?!none|currentColor)[^"]*"/gi, ' fill="currentColor"');
  out = out.replace(/\sstroke="(?!none|currentColor)[^"]*"/gi, ' stroke="currentColor"');
  out = out.replace(/\sstyle="[^"]*"/gi, "");
  return out;
}

const FETCHERS: { label: string; run: () => Promise<IconRecord[]> }[] = [
  { label: "lucide", run: fetchLucide },
  { label: "heroicons", run: fetchHeroicons },
  { label: "tabler", run: fetchTabler },
  { label: "feather", run: fetchFeather },
  { label: "bootstrap", run: fetchBootstrap },
  { label: "phosphor", run: fetchPhosphor },
  ...ICONIFY_SOURCES.map((s) => ({
    label: s.slug,
    run: () => fetchIconify(s),
  })),
];

const SITE_URL = "https://icons.sant.co.nz";
const SITEMAP_CHUNK = 40_000;

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return (
    `  <url>` +
    `<loc>${escapeXml(loc)}</loc>` +
    `<lastmod>${lastmod}</lastmod>` +
    `<changefreq>${changefreq}</changefreq>` +
    `<priority>${priority}</priority>` +
    `</url>`
  );
}

async function writeSitemaps(records: IconRecord[]): Promise<string[]> {
  const today = new Date().toISOString().slice(0, 10);

  const baseEntries: string[] = [
    urlEntry(SITE_URL, today, "daily", "1.0"),
  ];

  // Library overview pages
  const seenLibs = new Set<string>();
  for (const r of records) {
    if (seenLibs.has(r.library)) continue;
    seenLibs.add(r.library);
    baseEntries.push(urlEntry(`${SITE_URL}/${r.library}`, today, "weekly", "0.8"));
  }

  // Icon detail pages — chunked
  const iconUrls = records.map((r) =>
    urlEntry(`${SITE_URL}/${r.library}/${r.name}`, today, "monthly", "0.6"),
  );
  const allEntries = [...baseEntries, ...iconUrls];

  const chunkFiles: string[] = [];
  const chunkCount = Math.ceil(allEntries.length / SITEMAP_CHUNK);
  for (let i = 0; i < chunkCount; i++) {
    const slice = allEntries.slice(i * SITEMAP_CHUNK, (i + 1) * SITEMAP_CHUNK);
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      slice.join("\n") +
      `\n</urlset>\n`;
    const filename = `sitemap-${i}.xml`;
    await writeFile(resolve(PUBLIC_DIR, filename), xml);
    chunkFiles.push(filename);
  }

  // Sitemap index pointing at each chunk
  const indexXml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    chunkFiles
      .map(
        (f) =>
          `  <sitemap><loc>${SITE_URL}/${f}</loc><lastmod>${today}</lastmod></sitemap>`,
      )
      .join("\n") +
    `\n</sitemapindex>\n`;
  await writeFile(resolve(PUBLIC_DIR, "sitemap.xml"), indexXml);
  return chunkFiles;
}

async function main(): Promise<void> {
  const start = Date.now();
  const all: IconRecord[] = [];
  const summary: { library: string; count: number }[] = [];

  for (const f of FETCHERS) {
    const t0 = Date.now();
    try {
      const records = await f.run();
      all.push(...records);
      summary.push({ library: f.label, count: records.length });
      console.log(`[${f.label}] +${records.length} records in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    } catch (err) {
      console.error(`[${f.label}] FAILED:`, err);
      throw err;
    }
  }

  await mkdir(PUBLIC_DIR, { recursive: true });
  await mkdir(OUTPUT_SVG_DIR, { recursive: true });

  // 1) Full manifest with SVGs (used by MCP, CLI, server-rendered Next pages)
  await writeFile(OUTPUT_FULL, JSON.stringify(all));

  // 2) Slim metadata index (no svg) — what the web client fetches on boot
  const slim = all.map(({ svg, ...rest }) => rest);
  await writeFile(OUTPUT_INDEX, JSON.stringify(slim));

  // 3) Per-library SVG chunks — { [iconName]: svgString }, lazy-loaded by client
  const byLibrary = new Map<string, Record<string, string>>();
  for (const r of all) {
    let chunk = byLibrary.get(r.library);
    if (!chunk) {
      chunk = {};
      byLibrary.set(r.library, chunk);
    }
    chunk[r.name] = r.svg;
  }
  for (const [slug, chunk] of byLibrary) {
    await writeFile(resolve(OUTPUT_SVG_DIR, `${slug}.json`), JSON.stringify(chunk));
  }

  // 4) Library spotlight — small map of `{ slug: svgString }` for sidebar previews
  const spotlight: Record<string, { svg: string; name: string; style: string }> = {};
  for (const [slug, chunk] of byLibrary) {
    const prefs = SPOTLIGHT_PREFERENCES[slug] ?? [];
    let chosen = prefs.find((n) => n in chunk);
    if (!chosen) chosen = Object.keys(chunk).sort()[0];
    if (chosen) {
      const rec = all.find((r) => r.library === slug && r.name === chosen);
      spotlight[slug] = {
        svg: monochromeSvg(chunk[chosen]),
        name: chosen,
        style: rec?.style ?? "stroke",
      };
    }
  }
  await writeFile(OUTPUT_SPOTLIGHT, JSON.stringify(spotlight));

  // 5) Sitemap index + chunked sitemaps for ~70k URLs
  const sitemapFiles = await writeSitemaps(all);

  // 6) OG images — 1 per library + 1 for home, written as static PNGs
  const libraryStats = [...byLibrary.entries()].map(([slug, chunk]) => {
    const rec = all.find((r) => r.library === slug)!;
    return { slug, label: rec.libraryLabel, count: Object.keys(chunk).length, license: rec.license };
  });
  const ogStats = await writeAllOg(resolve(PUBLIC_DIR, "og"), all, libraryStats);

  const seconds = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n=== Summary ===");
  for (const s of summary) console.log(`  ${s.library.padEnd(14)} ${s.count}`);
  console.log(`  ${"TOTAL".padEnd(14)} ${all.length}`);
  console.log(`\nWrote in ${seconds}s:`);
  console.log(`  full manifest  → ${OUTPUT_FULL}`);
  console.log(`  slim index     → ${OUTPUT_INDEX}`);
  console.log(`  ${byLibrary.size} svg chunks  → ${OUTPUT_SVG_DIR}/<library>.json`);
  console.log(`  spotlight     → ${OUTPUT_SPOTLIGHT}`);
  console.log(`  sitemap.xml   → ${PUBLIC_DIR}/sitemap.xml (+ ${sitemapFiles.length} chunk(s))`);
  console.log(`  ${ogStats.count} og.png       → ${PUBLIC_DIR}/og/ (${(ogStats.bytes / 1024).toFixed(0)} KB total)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
