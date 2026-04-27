import { ImageResponse } from "@vercel/og";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import type { IconRecord } from "./types.js";

const SIZE = { width: 1200, height: 630 };

interface LibraryStat {
  slug: string;
  label: string;
  count: number;
  license: string;
}

const PALETTE = {
  bg: "#0a0a0a",
  surface: "#111113",
  border: "#27272a",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textFaint: "#71717a",
  accent: "#c8f07a",
};

/** Bake an explicit colour into the SVG (since Satori-rendered <img> can't
 *  inherit currentColor from its parent), ensuring stroke icons stay stroked
 *  and fill icons stay filled. */
function bakeColor(svg: string, color: string, isStroke: boolean): string {
  let out = svg.replace(/\sstyle="[^"]*"/gi, "");
  // Replace any literal colour values
  out = out
    .replace(/\sfill="(?!none|currentColor)[^"]*"/gi, ` fill="${isStroke ? "none" : color}"`)
    .replace(/\sstroke="(?!none|currentColor)[^"]*"/gi, ` stroke="${isStroke ? color : "none"}"`)
    .replace(/="currentColor"/g, `="${color}"`);
  // If the SVG didn't declare fill/stroke at all, the renderer falls back to
  // black. Force a sensible default on the outer <svg>.
  if (!/<svg[^>]*\sfill=/.test(out) && !isStroke) {
    out = out.replace(/<svg([^>]*)>/, `<svg$1 fill="${color}">`);
  }
  if (!/<svg[^>]*\sstroke=/.test(out) && isStroke) {
    out = out.replace(/<svg([^>]*)>/, `<svg$1 stroke="${color}" fill="none">`);
  }
  return out;
}

function svgToDataUri(svg: string): string {
  const compact = svg.replace(/\n/g, "").replace(/\s+/g, " ").trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(compact)}`;
}

function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", fontSize: 28, gap: 0 }}>
      <span style={{ color: PALETTE.accent, fontWeight: 700, letterSpacing: "-0.02em" }}>sant</span>
      <span style={{ color: PALETTE.textFaint }}>.icons</span>
    </div>
  );
}

function IconChip({ svg, style, size = 80 }: { svg: string; style: string; size?: number }) {
  const isStroke = style === "stroke";
  const baked = bakeColor(svg, PALETTE.textMuted, isStroke);
  const inner = Math.round(size * 0.5);
  return (
    <div
      style={{
        width: size,
        height: size,
        background: PALETTE.surface,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img src={svgToDataUri(baked)} width={inner} height={inner} />
    </div>
  );
}

export async function generateLibraryOg(lib: LibraryStat, samples: IconRecord[]): Promise<Buffer> {
  const heroIcons = samples.slice(0, 8);
  const tree = (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: PALETTE.bg,
        color: PALETTE.text,
        display: "flex",
        flexDirection: "column",
        padding: 64,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Header />

      <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 12 }}>
        <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: "-0.025em", color: PALETTE.text }}>
          {lib.label}
        </div>
        <div style={{ fontSize: 26, color: PALETTE.textMuted, display: "flex", gap: 12 }}>
          <span style={{ color: PALETTE.text, fontWeight: 600 }}>{lib.count.toLocaleString()}</span>
          <span>free SVG icons</span>
          <span style={{ color: PALETTE.textFaint }}>·</span>
          <span>{lib.license}</span>
          <span style={{ color: PALETTE.textFaint }}>licensed</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 40,
          paddingTop: 28,
          borderTop: `1px solid ${PALETTE.border}`,
        }}
      >
        {heroIcons.map((i) => (
          <IconChip key={i.id} svg={i.svg} style={i.style} />
        ))}
      </div>
    </div>
  );

  const img = new ImageResponse(tree, { ...SIZE });
  return Buffer.from(await img.arrayBuffer());
}

export async function generateHomeOg(
  totalIcons: number,
  libraryCount: number,
  samples: IconRecord[],
): Promise<Buffer> {
  const heroIcons = samples.slice(0, 12);
  const tree = (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: PALETTE.bg,
        color: PALETTE.text,
        display: "flex",
        flexDirection: "column",
        padding: 72,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Header />

      <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 16 }}>
        <div
          style={{
            fontSize: 84,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            color: PALETTE.text,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>{totalIcons.toLocaleString()} free SVG icons,</span>
          <span style={{ color: PALETTE.textMuted }}>one search bar.</span>
        </div>
        <div style={{ fontSize: 26, color: PALETTE.textMuted, display: "flex", gap: 12 }}>
          <span>
            <span style={{ color: PALETTE.text, fontWeight: 600 }}>{libraryCount}</span>
            {" "}libraries
          </span>
          <span style={{ color: PALETTE.textFaint }}>·</span>
          <span>MCP + CLI</span>
          <span style={{ color: PALETTE.textFaint }}>·</span>
          <span>zero login</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 48,
          paddingTop: 28,
          borderTop: `1px solid ${PALETTE.border}`,
        }}
      >
        {heroIcons.map((i) => (
          <IconChip key={i.id} svg={i.svg} style={i.style} />
        ))}
      </div>
    </div>
  );

  const img = new ImageResponse(tree, { ...SIZE });
  return Buffer.from(await img.arrayBuffer());
}

export async function writeAllOg(
  outDir: string,
  records: IconRecord[],
  libraries: LibraryStat[],
): Promise<{ count: number; bytes: number }> {
  await mkdir(outDir, { recursive: true });
  let bytes = 0;

  // Per-library OGs — 1 per library
  for (const lib of libraries) {
    const sampleStrokes = records.filter(
      (r) => r.library === lib.slug && r.style === "stroke",
    );
    const samples = sampleStrokes.length > 0 ? sampleStrokes : records.filter((r) => r.library === lib.slug);
    const buf = await generateLibraryOg(lib, samples);
    const target = resolve(outDir, `${lib.slug}.png`);
    await writeFile(target, buf);
    bytes += buf.length;
  }

  // Home OG — pull a stroke icon from each library so the strip is varied.
  const homeSamples: IconRecord[] = [];
  for (const lib of libraries) {
    const pick = records.find((r) => r.library === lib.slug && r.style === "stroke");
    if (pick) homeSamples.push(pick);
  }
  const homeBuf = await generateHomeOg(records.length, libraries.length, homeSamples);
  await writeFile(resolve(outDir, "home.png"), homeBuf);
  bytes += homeBuf.length;

  return { count: libraries.length + 1, bytes };
}
