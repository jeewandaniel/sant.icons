import type { IconRecord } from "./types";

function pascalCase(s: string): string {
  return s
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export interface ExportOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function customiseSvg(icon: IconRecord, opts: ExportOptions = {}): string {
  const size = opts.size ?? 24;
  const color = opts.color ?? "currentColor";
  const strokeWidth = opts.strokeWidth ?? 2;
  const isStroke = icon.style === "stroke";

  let svg = icon.svg
    .replace(/width="[^"]*"/, `width="${size}"`)
    .replace(/height="[^"]*"/, `height="${size}"`);

  if (isStroke) {
    if (/stroke=/.test(svg)) {
      svg = svg.replace(/stroke="[^"]*"/g, `stroke="${color}"`);
    } else {
      svg = svg.replace(/<svg([^>]*)>/, `<svg$1 stroke="${color}">`);
    }
    if (/stroke-width=/.test(svg)) {
      svg = svg.replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`);
    } else {
      svg = svg.replace(/<svg([^>]*)>/, `<svg$1 stroke-width="${strokeWidth}">`);
    }
    if (!/fill=/.test(svg)) {
      svg = svg.replace(/<svg([^>]*)>/, `<svg$1 fill="none">`);
    }
  } else {
    if (/fill="currentColor"/.test(svg) || /fill=/.test(svg)) {
      svg = svg.replace(/fill="[^"]*"/g, `fill="${color}"`);
    } else {
      svg = svg.replace(/<svg([^>]*)>/, `<svg$1 fill="${color}">`);
    }
  }
  return svg;
}

export function toReact(icon: IconRecord, opts: ExportOptions = {}): string {
  const componentName = pascalCase(icon.library) + pascalCase(icon.name);
  const svg = customiseSvg(icon, opts)
    .replace(/stroke-width=/g, "strokeWidth=")
    .replace(/stroke-linecap=/g, "strokeLinecap=")
    .replace(/stroke-linejoin=/g, "strokeLinejoin=")
    .replace(/clip-path=/g, "clipPath=")
    .replace(/fill-rule=/g, "fillRule=")
    .replace(/clip-rule=/g, "clipRule=")
    .replace(/<svg([^>]*)>/, "<svg$1 {...props}>");
  return `import * as React from "react";

export function ${componentName}(props: React.SVGProps<SVGSVGElement>) {
  return (
    ${svg.trim()}
  );
}
`;
}

export function toVue(icon: IconRecord, opts: ExportOptions = {}): string {
  const svg = customiseSvg(icon, opts);
  return `<template>
  ${svg.trim()}
</template>

<script setup lang="ts">
</script>
`;
}

export function toDataUri(svg: string): string {
  const cleaned = svg.replace(/\n/g, "").replace(/\s+/g, " ").trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

export async function svgToPngBlob(svg: string, size = 256): Promise<Blob> {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2d not available");
    ctx.drawImage(img, 0, 0, size, size);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
