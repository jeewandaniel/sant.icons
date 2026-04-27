import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { IconRecord } from "./types";
import { summariseLibraries } from "./icons";

let cache: { icons: IconRecord[]; byLibrary: Map<string, IconRecord[]> } | null = null;

export async function loadManifestServer() {
  if (cache) return cache;
  const path = resolve(process.cwd(), "public", "icons.json");
  const raw = await readFile(path, "utf8");
  const icons: IconRecord[] = JSON.parse(raw);
  const byLibrary = new Map<string, IconRecord[]>();
  for (const i of icons) {
    let arr = byLibrary.get(i.library);
    if (!arr) {
      arr = [];
      byLibrary.set(i.library, arr);
    }
    arr.push(i);
  }
  cache = { icons, byLibrary };
  return cache;
}

export async function getLibraries() {
  const { icons } = await loadManifestServer();
  return summariseLibraries(icons);
}

export async function getIcon(library: string, name: string): Promise<IconRecord | null> {
  const { byLibrary } = await loadManifestServer();
  const arr = byLibrary.get(library);
  if (!arr) return null;
  return arr.find((i) => i.name === name) ?? null;
}

export async function getIconsByLibrary(library: string): Promise<IconRecord[]> {
  const { byLibrary } = await loadManifestServer();
  return byLibrary.get(library) ?? [];
}

/** Find related icons in the same library that share at least one tag. */
export async function getRelated(icon: IconRecord, limit = 8): Promise<IconRecord[]> {
  const sameLib = await getIconsByLibrary(icon.library);
  // Tabler ships a few numeric tags (e.g. `2` in "a-b-2"). Coerce defensively.
  const norm = (t: unknown) => String(t).toLowerCase();
  const tagSet = new Set(icon.tags.map(norm));
  const scored: { rec: IconRecord; score: number }[] = [];
  for (const r of sameLib) {
    if (r.id === icon.id) continue;
    let score = 0;
    for (const t of r.tags) if (tagSet.has(norm(t))) score++;
    if (score > 0) scored.push({ rec: r, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.rec);
}

/** Same icon name across other libraries (e.g. all libraries that have "heart"). */
export async function getCrossLibrary(icon: IconRecord, limit = 6): Promise<IconRecord[]> {
  const { icons } = await loadManifestServer();
  return icons
    .filter((i) => i.library !== icon.library && i.name === icon.name)
    .slice(0, limit);
}
