import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { normaliseSvg } from "../normalise.js";
import type { IconRecord } from "../types.js";

const require = createRequire(import.meta.url);

interface IconifyIcon {
  body: string;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
}

interface IconifyJson {
  prefix: string;
  icons: Record<string, IconifyIcon>;
  width?: number;
  height?: number;
}

interface IconifyInfo {
  name: string;
  total?: number;
  license?: { spdx?: string; title?: string };
}

export interface IconifySource {
  /** Iconify package slug (e.g. "mdi"). Loaded from @iconify-json/{slug}. */
  iconifySlug: string;
  /** sant.icons internal library slug. */
  slug: string;
  /** Display label. */
  label: string;
  /** Default style if name suffix doesn't determine it. */
  defaultStyle: IconRecord["style"];
}

function nameToTags(name: string): string[] {
  return name.split("-").filter(Boolean);
}

function inferStyle(name: string, body: string, fallback: IconRecord["style"]): IconRecord["style"] {
  if (/(?:^|-)(fill|filled|solid|bold)(?:-|$)/i.test(name)) return "filled";
  if (/(?:^|-)(line|outline|stroke|regular|thin|light)(?:-|$)/i.test(name)) return "stroke";
  if (/(?:^|-)duotone(?:-|$)/i.test(name)) return "duotone";
  // Fallback to body inspection
  const hasStroke = /\sstroke=/.test(body);
  const hasFill = /\sfill=/.test(body) && !/\sfill="none"/i.test(body);
  if (hasStroke && !hasFill) return "stroke";
  if (hasFill && !hasStroke) return "filled";
  return fallback;
}

function normaliseLicense(spdx: string | undefined): IconRecord["license"] {
  if (!spdx) return "MIT";
  if (spdx === "CC0-1.0") return "CC0";
  if (spdx === "Apache-2.0" || spdx === "MIT" || spdx === "ISC" || spdx === "CC0" || spdx === "CC-BY-4.0") {
    return spdx as IconRecord["license"];
  }
  // Unknown SPDX — best-effort coercion
  if (spdx.startsWith("Apache")) return "Apache-2.0";
  if (spdx.startsWith("CC-BY")) return "CC-BY-4.0";
  return "MIT";
}

export async function fetchIconify(src: IconifySource): Promise<IconRecord[]> {
  const pkgRoot = dirname(require.resolve(`@iconify-json/${src.iconifySlug}/info.json`));
  const [info, data] = await Promise.all([
    readFile(resolve(pkgRoot, "info.json"), "utf8").then((s) => JSON.parse(s) as IconifyInfo),
    readFile(resolve(pkgRoot, "icons.json"), "utf8").then((s) => JSON.parse(s) as IconifyJson),
  ]);
  const pkg = JSON.parse(await readFile(resolve(pkgRoot, "package.json"), "utf8")) as { version: string };

  const setW = data.width ?? 24;
  const setH = data.height ?? 24;
  const license = normaliseLicense(info.license?.spdx);

  console.log(`[${src.slug}] iconify=${src.iconifySlug} v${pkg.version}, ${Object.keys(data.icons).length} icons, license=${license}`);

  const records: IconRecord[] = [];
  for (const [name, icon] of Object.entries(data.icons)) {
    const w = icon.width ?? setW;
    const h = icon.height ?? setH;
    const left = icon.left ?? 0;
    const top = icon.top ?? 0;
    const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${w} ${h}" width="${w}" height="${h}">${icon.body}</svg>`;
    const svg = normaliseSvg(rawSvg);
    const style = inferStyle(name, icon.body, src.defaultStyle);
    records.push({
      id: `${src.slug}-${name}`,
      name,
      library: src.slug,
      libraryLabel: src.label,
      category: "general",
      style,
      tags: nameToTags(name),
      svg,
      license,
      version: pkg.version,
    });
  }
  return records;
}
