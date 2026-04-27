import { loadManifest, type IconRecord } from "../manifest.js";

interface Opts {
  library?: string;
  json?: boolean;
}

export async function listCommand(opts: Opts) {
  const { icons } = await loadManifest();

  if (opts.library) {
    const filtered = icons.filter((i) => i.library === opts.library);
    if (filtered.length === 0) {
      process.stderr.write(`Library not found: ${opts.library}\n`);
      process.exit(1);
    }
    if (opts.json) {
      process.stdout.write(
        JSON.stringify(
          filtered.map((i) => ({ id: i.id, name: i.name, style: i.style })),
          null,
          2,
        ) + "\n",
      );
      return;
    }
    for (const i of filtered) process.stdout.write(`${i.id}\n`);
    process.stderr.write(`\n${filtered.length} icons in ${opts.library}\n`);
    return;
  }

  const map = new Map<
    string,
    { slug: string; label: string; count: number; styles: Set<IconRecord["style"]>; license: string; version: string }
  >();
  for (const i of icons) {
    let entry = map.get(i.library);
    if (!entry) {
      entry = { slug: i.library, label: i.libraryLabel, count: 0, styles: new Set(), license: i.license, version: i.version };
      map.set(i.library, entry);
    }
    entry.count++;
    entry.styles.add(i.style);
  }
  const summary = [...map.values()].sort((a, b) => b.count - a.count);

  if (opts.json) {
    process.stdout.write(
      JSON.stringify(
        summary.map((s) => ({
          slug: s.slug,
          label: s.label,
          count: s.count,
          styles: [...s.styles],
          license: s.license,
          version: s.version,
        })),
        null,
        2,
      ) + "\n",
    );
    return;
  }

  process.stdout.write(`slug         label             count    styles\n`);
  for (const s of summary) {
    process.stdout.write(
      `${s.slug.padEnd(12)} ${s.label.padEnd(17)} ${String(s.count).padStart(5)}    ${[...s.styles].join(",")}\n`,
    );
  }
  process.stderr.write(`\n${icons.length.toLocaleString()} total icons across ${summary.length} libraries\n`);
}
