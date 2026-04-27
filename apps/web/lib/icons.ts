import type { IconRecord, LibrarySummary, ManifestData } from "./types";

// Slim record: every IconRecord field except `svg`.
export type IconMeta = Omit<IconRecord, "svg">;

let cache: ManifestData | null = null;
let pending: Promise<ManifestData> | null = null;

export async function loadManifest(): Promise<ManifestData> {
  if (cache) return cache;
  if (pending) return pending;
  pending = (async () => {
    const res = await fetch("/index.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load index.json: ${res.status}`);
    const meta: IconMeta[] = await res.json();
    // Keep IconRecord shape with svg as empty string — actual SVG resolved via svg-cache
    const icons = meta as unknown as IconRecord[];
    cache = { icons, libraries: summariseLibraries(icons), total: icons.length };
    return cache;
  })();
  return pending;
}

export function summariseLibraries(icons: IconRecord[]): LibrarySummary[] {
  const map = new Map<string, LibrarySummary>();
  for (const i of icons) {
    let entry = map.get(i.library);
    if (!entry) {
      entry = { slug: i.library, label: i.libraryLabel, count: 0, styles: [] };
      map.set(i.library, entry);
    }
    entry.count++;
    if (!entry.styles.includes(i.style)) entry.styles.push(i.style);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function summariseCategories(icons: IconRecord[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const i of icons) map.set(i.category, (map.get(i.category) ?? 0) + 1);
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function summariseStyles(icons: IconRecord[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const i of icons) map.set(i.style, (map.get(i.style) ?? 0) + 1);
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
