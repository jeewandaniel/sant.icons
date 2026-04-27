// Loads the small library-spotlight.json once on boot. Used by the Sidebar
// to render a representative icon next to each library name.

export interface SpotlightEntry {
  svg: string;
  name: string;
  style: "stroke" | "solid" | "duotone" | "filled" | "mixed";
}

let cache: Record<string, SpotlightEntry> | null = null;
let pending: Promise<Record<string, SpotlightEntry>> | null = null;

export async function loadSpotlight(): Promise<Record<string, SpotlightEntry>> {
  if (cache) return cache;
  if (pending) return pending;
  pending = (async () => {
    const res = await fetch("/library-spotlight.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load library-spotlight.json: ${res.status}`);
    const data: Record<string, SpotlightEntry> = await res.json();
    cache = data;
    return data;
  })();
  return pending;
}

export function getSpotlight(): Record<string, SpotlightEntry> | null {
  return cache;
}
