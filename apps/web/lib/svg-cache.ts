// Lazy per-library SVG cache. Boot-time we have only metadata; SVG strings are
// fetched per library on first need, cached, and broadcast to subscribers.

type LibraryChunk = Record<string, string>; // { iconName: svgString }

const chunks = new Map<string, LibraryChunk>();
const inflight = new Map<string, Promise<LibraryChunk>>();
const listeners = new Set<() => void>();
let version = 0;

function notify() {
  version++;
  for (const l of listeners) l();
}

export function getSvg(library: string, name: string): string | null {
  const chunk = chunks.get(library);
  if (!chunk) return null;
  return chunk[name] ?? null;
}

export async function loadLibrary(library: string): Promise<LibraryChunk> {
  const cached = chunks.get(library);
  if (cached) return cached;
  const pending = inflight.get(library);
  if (pending) return pending;

  const promise = (async () => {
    const res = await fetch(`/svgs/${library}.json`, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load svgs/${library}.json: ${res.status}`);
    const chunk: LibraryChunk = await res.json();
    chunks.set(library, chunk);
    inflight.delete(library);
    notify();
    return chunk;
  })();

  inflight.set(library, promise);
  return promise;
}

export function loadAllLibraries(slugs: string[]): void {
  // Fire all in parallel. They populate the cache as they complete.
  for (const slug of slugs) {
    if (!chunks.has(slug) && !inflight.has(slug)) {
      void loadLibrary(slug).catch((err) => {
        console.error(`[svg-cache] failed to load ${slug}:`, err);
      });
    }
  }
}

// React subscription primitive
export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getVersion(): number {
  return version;
}

export function getServerVersion(): number {
  return 0;
}
