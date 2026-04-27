import type { IconRecord } from "./manifest.js";

export type Format = "svg" | "react" | "vue" | "datauri";

function pascal(s: string): string {
  return s
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export interface CustomiseOpts {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function customiseSvg(icon: IconRecord, opts: CustomiseOpts = {}): string {
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
    if (/fill=/.test(svg)) {
      svg = svg.replace(/fill="[^"]*"/g, `fill="${color}"`);
    } else {
      svg = svg.replace(/<svg([^>]*)>/, `<svg$1 fill="${color}">`);
    }
  }
  return svg;
}

export function format(icon: IconRecord, kind: Format, opts: CustomiseOpts = {}): string {
  const svg = customiseSvg(icon, opts);
  if (kind === "svg") return svg;
  if (kind === "datauri") {
    const cleaned = svg.replace(/\n/g, "").replace(/\s+/g, " ").trim();
    return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
  }
  if (kind === "react") {
    const componentName = pascal(icon.library) + pascal(icon.name);
    const jsx = svg
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
    ${jsx.trim()}
  );
}
`;
  }
  // vue
  return `<template>
  ${svg.trim()}
</template>

<script setup lang="ts">
</script>
`;
}
