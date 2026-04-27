import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  loadManifestServer,
  getIcon,
  getRelated,
  getCrossLibrary,
} from "@/lib/manifest-server";
import type { IconRecord } from "@/lib/types";

interface Props {
  params: { library: string; icon: string };
}

const SITE = "https://icons.sant.co.nz";

const LICENSE_URLS: Record<string, string> = {
  MIT: "https://opensource.org/licenses/MIT",
  "Apache-2.0": "https://www.apache.org/licenses/LICENSE-2.0",
  ISC: "https://opensource.org/licenses/ISC",
  CC0: "https://creativecommons.org/publicdomain/zero/1.0/",
  "CC-BY-4.0": "https://creativecommons.org/licenses/by/4.0/",
};

export async function generateStaticParams() {
  const { icons } = await loadManifestServer();
  return icons.map((i) => ({ library: i.library, icon: i.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const icon = await getIcon(params.library, params.icon);
  if (!icon) return { title: "Not found" };
  const tagText = icon.tags.slice(0, 6).join(", ");
  return {
    title: `${icon.name} icon — ${icon.libraryLabel} SVG | sant.icons`,
    description: `Free ${icon.name} SVG icon from ${icon.libraryLabel} (${icon.style} style, ${icon.license} licensed). Copy as SVG, JSX, or Vue. Download PNG. Tags: ${tagText}.`,
    keywords: [
      icon.name,
      `${icon.name} icon`,
      `${icon.name} svg`,
      `${icon.libraryLabel.toLowerCase()} ${icon.name}`,
      `${icon.libraryLabel.toLowerCase()} icon`,
      ...icon.tags.slice(0, 8),
    ],
    alternates: { canonical: `${SITE}/${icon.library}/${icon.name}` },
    openGraph: {
      title: `${icon.name} — ${icon.libraryLabel}`,
      description: `Free SVG ${icon.name} icon from ${icon.libraryLabel}.`,
      type: "article",
      url: `${SITE}/${icon.library}/${icon.name}`,
      images: [
        {
          url: `/og/${icon.library}.png`,
          width: 1200,
          height: 630,
          alt: `${icon.name} from ${icon.libraryLabel}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${icon.name} — ${icon.libraryLabel}`,
      description: `Free SVG ${icon.name} icon from ${icon.libraryLabel}.`,
      images: [`/og/${icon.library}.png`],
    },
  };
}

function pascalCase(s: string): string {
  return s
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function buildJsonLd(icon: IconRecord) {
  const url = `${SITE}/${icon.library}/${icon.name}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      name: `${icon.name} icon`,
      description: `${icon.name} SVG icon from ${icon.libraryLabel}`,
      contentUrl: url,
      url,
      encodingFormat: "image/svg+xml",
      license: LICENSE_URLS[icon.license],
      acquireLicensePage: LICENSE_URLS[icon.license],
      creditText: icon.libraryLabel,
      keywords: icon.tags.join(", "),
      inLanguage: "en",
      isAccessibleForFree: true,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "sant.icons", item: SITE },
        {
          "@type": "ListItem",
          position: 2,
          name: icon.libraryLabel,
          item: `${SITE}/${icon.library}`,
        },
        { "@type": "ListItem", position: 3, name: icon.name, item: url },
      ],
    },
  ];
}

/** Inserts <title> + <desc> into the SVG body for a11y + extra SEO signal. */
function annotateSvg(icon: IconRecord): string {
  const titleEl = `<title>${icon.name} icon — ${icon.libraryLabel}</title>`;
  const descEl = `<desc>Free ${icon.name} SVG icon from ${icon.libraryLabel}, ${icon.style} style, ${icon.license} licensed.</desc>`;
  return icon.svg.replace(/<svg([^>]*)>/, `<svg$1 role="img" aria-label="${icon.name} icon">${titleEl}${descEl}`);
}

function buildReactSnippet(icon: IconRecord): string {
  const Comp = pascalCase(icon.library) + pascalCase(icon.name);
  // Generate a self-contained component (matches `npx sant-icons get … --format react`)
  // so users can paste it directly without depending on a separate package.
  return `// Run: npx sant-icons get ${icon.id} --format react
export function ${Comp}(props) {
  return (
    ${icon.svg.replace(/\n\s+/g, " ").replace(/<svg([^>]*)>/, "<svg$1 {...props}>").trim()}
  );
}`;
}

function buildHtmlSnippet(icon: IconRecord): string {
  return icon.svg.replace(/\n\s+/g, " ").replace(/\s+/g, " ").trim();
}

export default async function IconPage({ params }: Props) {
  const icon = await getIcon(params.library, params.icon);
  if (!icon) notFound();
  const [related, crossLibrary] = await Promise.all([
    getRelated(icon, 8),
    getCrossLibrary(icon, 8),
  ]);
  const jsonLd = buildJsonLd(icon);
  const annotated = annotateSvg(icon);
  const licenseUrl = LICENSE_URLS[icon.license];
  const tagText = icon.tags.slice(0, 6).join(", ");

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top nav */}
      <header className="border-b border-border-subtle px-6 py-3 flex items-center gap-3 text-[13px]">
        <Link href="/" className="font-mono font-bold text-[14px] tracking-tight">
          <span className="text-accent">sant</span>
          <span className="text-text-muted">.icons</span>
        </Link>
        <span className="text-text-faint">/</span>
        <Link
          href={`/${icon.library}`}
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          {icon.libraryLabel}
        </Link>
        <span className="text-text-faint">/</span>
        <span className="text-text-secondary font-mono">{icon.name}</span>
        <Link
          href={`/?focus=${icon.id}`}
          className="ml-auto px-3 py-1.5 rounded-md text-accent border border-border-accent bg-bg-accent hover:bg-bg-hover transition-colors text-[12px] font-medium"
        >
          Open in browser →
        </Link>
      </header>

      <main className="flex-1 max-w-[860px] w-full mx-auto px-6 py-12 space-y-10">
        {/* Hero */}
        <section>
          <h1 className="text-[36px] font-semibold text-text-primary tracking-tight">
            <span className="font-mono">{icon.name}</span>
            <span className="text-text-muted font-normal"> · {icon.libraryLabel}</span>
          </h1>
          <p className="mt-3 text-[15px] text-text-secondary leading-relaxed">
            Free SVG <span className="font-mono text-text-primary">{icon.name}</span> icon from{" "}
            <Link
              href={`/${icon.library}`}
              className="text-text-primary hover:text-accent transition-colors underline decoration-text-faint underline-offset-4"
            >
              {icon.libraryLabel}
            </Link>
            . Rendered at <span className="text-text-primary">24×24</span> in the {icon.style} style and licensed
            under{" "}
            {licenseUrl ? (
              <a
                href={licenseUrl}
                target="_blank"
                rel="noreferrer"
                className="text-text-primary hover:text-accent transition-colors underline decoration-text-faint underline-offset-4"
              >
                {icon.license}
              </a>
            ) : (
              <span className="text-text-primary">{icon.license}</span>
            )}
            . Copy directly as SVG, React (JSX), or Vue. Download as SVG or PNG. No login, no
            attribution required for {icon.license} licensed icons.
          </p>
        </section>

        {/* Big preview */}
        <section className="bg-bg-surface border border-border-subtle rounded-xl p-12 flex items-center justify-center">
          <div
            className={`icon-svg ${icon.style}`}
            style={{ ["--icon-svg-size" as string]: "200px", color: "#fafafa" }}
            dangerouslySetInnerHTML={{ __html: annotated }}
          />
        </section>

        {/* Tags */}
        {icon.tags.length > 0 && (
          <section>
            <h2 className="text-[12px] font-semibold tracking-[0.14em] uppercase text-text-faint mb-3">
              Tags
            </h2>
            <ul className="flex flex-wrap gap-2">
              {icon.tags.map((tag) => (
                <li
                  key={tag}
                  className="font-mono text-[12px] text-text-secondary bg-bg-surface border border-border-subtle rounded-md px-2.5 py-1"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Code snippets */}
        <section>
          <h2 className="text-[12px] font-semibold tracking-[0.14em] uppercase text-text-faint mb-3">
            Code
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-[11px] text-text-muted mb-1.5">HTML / SVG</div>
              <pre className="bg-bg-surface border border-border-subtle rounded-lg p-4 text-[11px] font-mono text-text-secondary overflow-x-auto">
                {buildHtmlSnippet(icon)}
              </pre>
            </div>
            <div>
              <div className="text-[11px] text-text-muted mb-1.5">React (with @sant/icons)</div>
              <pre className="bg-bg-surface border border-border-subtle rounded-lg p-4 text-[11px] font-mono text-text-secondary overflow-x-auto">
                {buildReactSnippet(icon)}
              </pre>
            </div>
            <div>
              <div className="text-[11px] text-text-muted mb-1.5">CLI</div>
              <pre className="bg-bg-surface border border-border-subtle rounded-lg p-4 text-[11px] font-mono text-text-secondary">
                npx sant-icons get {icon.id}
              </pre>
            </div>
          </div>
        </section>

        {/* Properties */}
        <section>
          <h2 className="text-[12px] font-semibold tracking-[0.14em] uppercase text-text-faint mb-3">
            Properties
          </h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3 text-[13px]">
            <Property label="Name" value={icon.name} mono />
            <Property label="Library" value={icon.libraryLabel} link={`/${icon.library}`} />
            <Property label="Style" value={icon.style} />
            <Property label="License" value={icon.license} link={licenseUrl} external />
            <Property label="Version" value={icon.version} mono />
            <Property label="Identifier" value={icon.id} mono />
          </dl>
        </section>

        {/* Cross-library — same name in other libraries */}
        {crossLibrary.length > 0 && (
          <section>
            <h2 className="text-[12px] font-semibold tracking-[0.14em] uppercase text-text-faint mb-3">
              <span className="font-mono">{icon.name}</span> in other libraries
            </h2>
            <IconRow icons={crossLibrary} />
          </section>
        )}

        {/* Related from same library */}
        {related.length > 0 && (
          <section>
            <h2 className="text-[12px] font-semibold tracking-[0.14em] uppercase text-text-faint mb-3">
              Related from {icon.libraryLabel}
            </h2>
            <IconRow icons={related} />
          </section>
        )}

        {/* Long-form context */}
        <section className="text-[14px] text-text-secondary leading-relaxed space-y-3 border-t border-border-subtle pt-8">
          <p>
            The <span className="font-mono text-text-primary">{icon.name}</span> icon ships with{" "}
            {icon.libraryLabel}, an open-source icon set licensed under {icon.license}. Search for
            it as &quot;{icon.libraryLabel.toLowerCase()} {icon.name}&quot;, &quot;{icon.name}{" "}
            svg&quot;, or any of its tagged terms ({tagText}). The SVG is normalised to a 24×24
            viewBox so you can drop it into any UI framework alongside other sant.icons icons
            without scaling concerns.
          </p>
          <p>
            Need this icon in your codebase fast? Install the{" "}
            <a
              href="https://www.npmjs.com/package/@santicons/mcp"
              target="_blank"
              rel="noreferrer"
              className="text-text-primary hover:text-accent transition-colors underline decoration-text-faint underline-offset-4"
            >
              MCP server
            </a>{" "}
            for Claude Code (or any MCP-aware AI tool) and ask the model to fetch{" "}
            <span className="font-mono text-text-primary">{icon.id}</span> directly into your
            project. No browser context-switch.
          </p>
        </section>
      </main>

      <footer className="px-6 py-6 border-t border-border-subtle text-[12px] text-text-faint flex items-center justify-between">
        <span>
          built by{" "}
          <a
            href="https://sant.co.nz"
            target="_blank"
            rel="noreferrer"
            className="hover:text-text-secondary transition-colors"
          >
            sant.co.nz
          </a>
          {" "}— free, forever
        </span>
        <span className="font-mono">{icon.id}</span>
      </footer>
    </div>
  );
}

function Property({
  label,
  value,
  mono,
  link,
  external,
}: {
  label: string;
  value: string;
  mono?: boolean;
  link?: string;
  external?: boolean;
}) {
  const valueClass = mono ? "font-mono text-text-primary" : "text-text-primary";
  const valueEl = link ? (
    <a
      href={link}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`${valueClass} hover:text-accent transition-colors underline decoration-text-faint underline-offset-4`}
    >
      {value}
    </a>
  ) : (
    <span className={valueClass}>{value}</span>
  );
  return (
    <div>
      <dt className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-faint mb-0.5">
        {label}
      </dt>
      <dd>{valueEl}</dd>
    </div>
  );
}

function IconRow({ icons }: { icons: IconRecord[] }) {
  return (
    <ul className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
      {icons.map((r) => (
        <li key={r.id}>
          <Link
            href={`/${r.library}/${r.name}`}
            className="block bg-bg-surface border border-border-subtle hover:border-text-faint rounded-lg p-3 transition-colors text-center group"
            title={`${r.name} — ${r.libraryLabel}`}
          >
            <div
              className={`icon-svg ${r.style} text-text-secondary group-hover:text-text-primary mx-auto`}
              style={{ ["--icon-svg-size" as string]: "32px" }}
              dangerouslySetInnerHTML={{ __html: r.svg }}
            />
            <div className="mt-2 font-mono text-[10px] text-text-muted truncate">{r.name}</div>
            <div className="font-mono text-[9px] text-text-faint truncate">{r.libraryLabel}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
