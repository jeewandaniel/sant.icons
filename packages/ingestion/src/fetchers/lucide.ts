import AdmZip from "adm-zip";
import type { IconRecord } from "../types.js";

const REPO = "lucide-icons/lucide";
const LIBRARY_SLUG = "lucide";
const LIBRARY_LABEL = "Lucide";

interface LucideIconJson {
  $schema?: string;
  contributors?: unknown[];
  // Lucide's tags can be plain strings or objects with deprecation metadata.
  tags?: unknown[];
  categories?: unknown[];
  aliases?: unknown[];
}

async function getLatestTag(): Promise<string> {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "sant-icons-ingestion",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers });
  if (!res.ok) throw new Error(`GitHub API failed: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as { tag_name: string };
  return json.tag_name;
}

async function downloadSourceZip(tag: string): Promise<Buffer> {
  const url = `https://codeload.github.com/${REPO}/zip/refs/tags/${tag}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Source zip download failed: ${res.status}`);
  const arr = await res.arrayBuffer();
  return Buffer.from(arr);
}

function nameToTags(name: string): string[] {
  return name.split("-").filter(Boolean);
}

export async function fetchLucide(): Promise<IconRecord[]> {
  const tag = await getLatestTag();
  console.log(`[lucide] latest tag: ${tag}`);

  const buf = await downloadSourceZip(tag);
  const zip = new AdmZip(buf);
  const entries = zip.getEntries();

  const svgEntries = new Map<string, string>();
  const jsonEntries = new Map<string, LucideIconJson>();

  for (const e of entries) {
    if (e.isDirectory) continue;
    const m = e.entryName.match(/(?:^|\/)icons\/([^/]+)\.(svg|json)$/);
    if (!m) continue;
    const [, name, ext] = m;
    const text = e.getData().toString("utf8");
    if (ext === "svg") {
      svgEntries.set(name, text);
    } else {
      try {
        jsonEntries.set(name, JSON.parse(text) as LucideIconJson);
      } catch {
        // skip malformed metadata
      }
    }
  }

  console.log(`[lucide] found ${svgEntries.size} svg files, ${jsonEntries.size} metadata files`);

  const records: IconRecord[] = [];
  for (const [name, svg] of svgEntries) {
    const meta = jsonEntries.get(name);
    // Lucide's `tags` array sometimes contains objects (deprecation metadata
    // like { name, deprecated, deprecationReason, toBeRemovedInVersion }).
    // Coerce everything to strings so downstream consumers can safely render.
    const stringifyTag = (t: unknown): string | null => {
      if (typeof t === "string") return t;
      if (t && typeof t === "object" && "name" in t) {
        const name = (t as { name: unknown }).name;
        return typeof name === "string" ? name : null;
      }
      return null;
    };
    const cleanTags = (arr: unknown[] | undefined) =>
      (arr ?? []).map(stringifyTag).filter((t): t is string => t !== null);
    const cleanCategories = cleanTags(meta?.categories);
    const category = cleanCategories[0] ?? "general";
    const tagSet = new Set<string>([
      ...nameToTags(name),
      category,
      ...cleanTags(meta?.tags),
      ...cleanTags(meta?.aliases),
      ...cleanCategories,
    ]);
    records.push({
      id: `${LIBRARY_SLUG}-${name}`,
      name,
      library: LIBRARY_SLUG,
      libraryLabel: LIBRARY_LABEL,
      category,
      style: "stroke",
      tags: [...tagSet],
      svg: svg.trim(),
      license: "ISC",
      version: tag,
    });
  }

  return records;
}
