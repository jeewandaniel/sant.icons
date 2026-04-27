import type { Metadata } from "next";
import Link from "next/link";
import { getLibraries } from "@/lib/manifest-server";

export const metadata: Metadata = {
  title: "Docs — sant.icons",
  description:
    "Install the sant.icons MCP server, CLI, or use the static JSON manifest directly. 69,000+ free SVG icons across 18 libraries.",
  alternates: { canonical: "https://icons.sant.co.nz/docs" },
  openGraph: {
    title: "Docs — sant.icons",
    description: "MCP server, CLI, and manifest API for 69,000+ free SVG icons.",
    url: "https://icons.sant.co.nz/docs",
    type: "article",
    images: [{ url: "/og/home.png", width: 1200, height: 630 }],
  },
};

const SECTIONS = [
  { id: "quick-start", label: "Quick start" },
  { id: "mcp", label: "MCP server" },
  { id: "cli", label: "CLI" },
  { id: "manifest", label: "JSON manifest API" },
  { id: "libraries", label: "Library coverage" },
  { id: "contributing", label: "Contributing" },
  { id: "license", label: "License" },
];

export default async function DocsPage() {
  const libraries = await getLibraries();
  const total = libraries.reduce((s, l) => s + l.count, 0);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* Top nav */}
      <header className="border-b border-border-subtle px-7 py-4 flex items-center justify-between">
        <Link href="/" className="font-mono font-bold text-[15px] tracking-tight">
          <span className="text-accent">sant</span>
          <span className="text-text-muted">.icons</span>
        </Link>
        <nav className="flex items-center gap-1 text-[13px] text-text-secondary">
          <Link
            className="px-2.5 py-1.5 rounded-md text-text-primary bg-bg-hover"
            href="/docs"
          >
            Docs
          </Link>
          <a
            className="px-2.5 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-hover transition-colors"
            href="https://www.npmjs.com/package/@sant/icons-cli"
            target="_blank"
            rel="noreferrer"
          >
            CLI
          </a>
          <a
            className="px-2.5 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-hover transition-colors"
            href="https://github.com/jeewandaniel/sant.icons"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            className="ml-1 px-2.5 py-1.5 rounded-md text-accent border border-border-accent bg-bg-accent hover:bg-bg-hover transition-colors text-[12px] font-medium"
            href="https://www.npmjs.com/package/@sant/icons-mcp"
            target="_blank"
            rel="noreferrer"
          >
            MCP
          </a>
        </nav>
      </header>

      <main className="max-w-[820px] mx-auto px-6 py-14">
        {/* Hero */}
        <h1 className="text-[40px] font-semibold tracking-tight">Docs</h1>
        <p className="mt-3 text-[16px] text-text-secondary leading-relaxed">
          Three ways to use sant.icons in your work — the web browser at{" "}
          <Link href="/" className="text-text-primary underline decoration-text-faint underline-offset-4 hover:text-accent transition-colors">
            icons.sant.co.nz
          </Link>{" "}
          for designers, the MCP server for AI coding assistants, and the CLI for terminal use.
          All free, all open source.
        </p>

        {/* TOC */}
        <nav className="mt-8 border-y border-border-subtle py-4">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-text-muted">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="hover:text-text-primary transition-colors"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick start */}
        <Section id="quick-start" title="Quick start">
          <p>
            Pick the surface that fits your workflow. They all read the same{" "}
            <span className="font-mono text-text-primary">{total.toLocaleString()}</span> icons across{" "}
            <span className="font-mono text-text-primary">{libraries.length}</span> libraries.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-5">
            <QuickCard
              label="Browser"
              command="icons.sant.co.nz"
              detail="Search, customise, copy / download. No login."
              href="/"
              external={false}
            />
            <QuickCard
              label="MCP server"
              command="npx -y @sant/icons-mcp"
              detail="For Claude Code and other MCP-aware AI tools."
              href="https://www.npmjs.com/package/@sant/icons-mcp"
              external
            />
            <QuickCard
              label="CLI"
              command="npx sant-icons search arrow"
              detail="Terminal-first. Scriptable. Offline-capable."
              href="https://www.npmjs.com/package/@sant/icons-cli"
              external
            />
          </div>
        </Section>

        {/* MCP */}
        <Section id="mcp" title="MCP server">
          <p>
            The MCP server lets your AI coding assistant fetch icons directly into your codebase
            without context-switching. The package bundles the full {total.toLocaleString()}-icon
            manifest, so it works offline.
          </p>
          <h3 className="mt-6 mb-2 text-[14px] font-semibold tracking-wide">Install in Claude Code or Claude Desktop</h3>
          <p className="text-[14px]">Add to your MCP config:</p>
          <Code lang="json">{`{
  "mcpServers": {
    "sant-icons": {
      "command": "npx",
      "args": ["-y", "@sant/icons-mcp"]
    }
  }
}`}</Code>
          <p className="text-[14px] mt-4">Then ask the model:</p>
          <Code lang="text">{`> find me a stroke arrow-right icon and put the SVG in src/icons/`}</Code>

          <h3 className="mt-6 mb-2 text-[14px] font-semibold tracking-wide">Tools exposed</h3>
          <Definition term="search_icons" def="Search by name, keyword, or category. Returns lightweight metadata. Filters: library, style, category, limit." />
          <Definition term="get_icon" def="Get the full SVG for an icon ID with optional size/colour/strokeWidth customisation." />
          <Definition term="list_libraries" def="List all 18 libraries with counts, supported styles, license, and version." />
        </Section>

        {/* CLI */}
        <Section id="cli" title="CLI">
          <p>The CLI gives you terminal access to the same data. No browser needed.</p>

          <h3 className="mt-6 mb-2 text-[14px] font-semibold tracking-wide">Search</h3>
          <Code lang="bash">{`npx sant-icons search "arrow"
npx sant-icons search "arrow" --library lucide --limit 5
npx sant-icons search "" --library heroicons --style solid
npx sant-icons search "heart" --json`}</Code>

          <h3 className="mt-6 mb-2 text-[14px] font-semibold tracking-wide">Get an icon</h3>
          <Code lang="bash">{`npx sant-icons get lucide/heart                          # raw SVG to stdout
npx sant-icons get lucide/heart --format react           # React component
npx sant-icons get lucide/heart --format vue             # Vue SFC
npx sant-icons get lucide/heart --format datauri         # base64 data URI
npx sant-icons get lucide/heart --color "#ef4444" --size 32 --stroke-width 1.5
npx sant-icons get lucide/heart --output ./src/icons/heart.svg`}</Code>

          <h3 className="mt-6 mb-2 text-[14px] font-semibold tracking-wide">List</h3>
          <Code lang="bash">{`npx sant-icons list                          # summary of all libraries
npx sant-icons list --library tabler         # all icon IDs in tabler
npx sant-icons list --json                   # JSON output for scripting`}</Code>
        </Section>

        {/* Manifest API */}
        <Section id="manifest" title="JSON manifest API">
          <p>
            For automation, fetchers, or code-gen — read the manifest directly. The site is 100%
            static, so these are CDN-cached JSON files served from the icons.sant.co.nz origin.
          </p>

          <h3 className="mt-6 mb-2 text-[14px] font-semibold tracking-wide">Endpoints</h3>
          <dl className="space-y-3">
            <Endpoint
              path="/index.json"
              size="≈ 16 MB raw / ≈ 4 MB gzip"
              desc="Slim metadata for every icon. Excludes SVG body. Use for search, filtering, or building your own UI."
            />
            <Endpoint
              path="/icons.json"
              size="≈ 62 MB raw / ≈ 14 MB gzip"
              desc="Full manifest including the SVG string for every icon. Use when you need everything in one round-trip."
            />
            <Endpoint
              path="/svgs/{library}.json"
              size="80 KB – 13 MB"
              desc="Per-library SVG chunks keyed by icon name. Lazy-load on demand."
            />
            <Endpoint
              path="/library-spotlight.json"
              size="≈ 11 KB"
              desc="One representative icon per library — used by the site's sidebar."
            />
            <Endpoint
              path="/sitemap.xml"
              size="≈ 1 KB index"
              desc="Sitemap index pointing to chunked sitemaps with all 70k icon URLs."
            />
          </dl>

          <h3 className="mt-6 mb-2 text-[14px] font-semibold tracking-wide">Record shape</h3>
          <Code lang="ts">{`interface IconRecord {
  id: string;             // e.g. "lucide-arrow-right"
  name: string;           // e.g. "arrow-right"
  library: string;        // e.g. "lucide"
  libraryLabel: string;   // e.g. "Lucide"
  category: string;       // e.g. "arrows", "general"
  style: "stroke" | "solid" | "duotone" | "filled" | "mixed";
  tags: string[];         // search + categorisation terms
  svg: string;            // full SVG string, viewBox normalised to "0 0 24 24"
  license: "MIT" | "Apache-2.0" | "CC0" | "ISC" | "CC-BY-4.0";
  version: string;        // upstream library version
}`}</Code>
        </Section>

        {/* Library coverage */}
        <Section id="libraries" title="Library coverage">
          <p>
            All {libraries.length} libraries shipped on every release. Counts and versions update
            weekly via GitHub Actions.
          </p>
          <div className="mt-5 border border-border-subtle rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-bg-surface text-text-muted text-[11px] tracking-[0.12em] uppercase">
                  <th className="text-left font-medium px-4 py-2.5">Library</th>
                  <th className="text-right font-medium px-4 py-2.5 tabular-nums">Count</th>
                  <th className="text-left font-medium px-4 py-2.5">Styles</th>
                </tr>
              </thead>
              <tbody>
                {libraries.map((l) => (
                  <tr key={l.slug} className="border-t border-border-subtle">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/${l.slug}`}
                        className="text-text-primary hover:text-accent transition-colors"
                      >
                        {l.label}
                      </Link>
                      <span className="ml-2 font-mono text-[11px] text-text-faint">/{l.slug}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                      {l.count.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-text-muted">{l.styles.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[12px] text-text-muted">
            Each library retains its upstream license. See the{" "}
            <a
              href="https://github.com/jeewandaniel/sant.icons/blob/main/LICENSES.md"
              target="_blank"
              rel="noreferrer"
              className="text-text-primary underline decoration-text-faint underline-offset-4 hover:text-accent transition-colors"
            >
              LICENSES file
            </a>{" "}
            for attribution and license URLs.
          </p>
        </Section>

        {/* Contributing */}
        <Section id="contributing" title="Contributing">
          <p>
            Source on{" "}
            <a
              href="https://github.com/jeewandaniel/sant.icons"
              target="_blank"
              rel="noreferrer"
              className="text-text-primary underline decoration-text-faint underline-offset-4 hover:text-accent transition-colors"
            >
              github.com/jeewandaniel/sant.icons
            </a>
            . Issues and PRs welcome.
          </p>
          <h3 className="mt-6 mb-2 text-[14px] font-semibold tracking-wide">Adding a library</h3>
          <ol className="list-decimal list-inside space-y-2 text-[14px]">
            <li>
              For libraries available via{" "}
              <a
                href="https://iconify.design"
                target="_blank"
                rel="noreferrer"
                className="text-text-primary underline decoration-text-faint underline-offset-4 hover:text-accent transition-colors"
              >
                Iconify
              </a>
              : add an entry to{" "}
              <span className="font-mono text-[13px] text-text-primary">ICONIFY_SOURCES</span> in{" "}
              <span className="font-mono text-[13px] text-text-primary">
                packages/ingestion/src/index.ts
              </span>
              .
            </li>
            <li>
              For libraries with custom source layouts (raw SVG files, weight variants, custom
              metadata): write a fetcher in{" "}
              <span className="font-mono text-[13px] text-text-primary">
                packages/ingestion/src/fetchers/
              </span>
              .
            </li>
            <li>
              Run <span className="font-mono text-[13px] text-text-primary">pnpm --filter @sant/ingestion run build && node packages/ingestion/dist/index.js</span> to
              rebuild the manifest.
            </li>
            <li>
              Open a PR. The weekly GitHub Action keeps everything fresh after merge.
            </li>
          </ol>
        </Section>

        {/* License */}
        <Section id="license" title="License">
          <p>
            sant.icons (the site, MCP server, CLI, and ingestion code) is released under the MIT
            license.
          </p>
          <p>
            Each icon library retains its own upstream license — Lucide (ISC), Tabler &amp;
            Phosphor &amp; Heroicons &amp; Bootstrap &amp; Feather &amp; Iconoir &amp; Mingcute
            &amp; Octicons &amp; Pixel Art &amp; Majesticons &amp; Devicon &amp; Huge Icons &amp;
            Fluent UI (MIT), Material Design &amp; Carbon (Apache-2.0), Simple Icons (CC0-1.0),
            IconaMoon (CC-BY-4.0). Every icon detail page links to its license.
          </p>
        </Section>
      </main>

      <footer className="px-6 py-8 border-t border-border-subtle text-[12px] text-text-faint flex items-center justify-between">
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
          {" "}— Christchurch, New Zealand
        </span>
        <Link href="/" className="hover:text-text-secondary transition-colors">
          ← back to icons
        </Link>
      </footer>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-14 scroll-mt-8">
      <h2 className="text-[24px] font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-3 text-[15px] text-text-secondary leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Code({ children, lang }: { children: string; lang: string }) {
  return (
    <pre className="bg-bg-surface border border-border-subtle rounded-lg p-4 text-[12px] font-mono text-text-secondary overflow-x-auto whitespace-pre">
      {children}
      {lang ? null : null}
    </pre>
  );
}

function QuickCard({
  label,
  command,
  detail,
  href,
  external,
}: {
  label: string;
  command: string;
  detail: string;
  href: string;
  external: boolean;
}) {
  const Inner = (
    <div className="bg-bg-surface border border-border-subtle hover:border-text-faint rounded-lg p-4 transition-colors h-full flex flex-col">
      <div className="text-[10px] font-medium tracking-[0.14em] uppercase text-text-faint">
        {label}
      </div>
      <code className="mt-2 font-mono text-[13px] text-text-primary block break-all">{command}</code>
      <div className="mt-2 text-[12px] text-text-muted flex-1">{detail}</div>
    </div>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {Inner}
      </a>
    );
  }
  return <Link href={href}>{Inner}</Link>;
}

function Definition({ term, def }: { term: string; def: string }) {
  return (
    <div className="border-l-2 border-border-default pl-4 mt-3">
      <code className="font-mono text-[13px] text-text-primary">{term}</code>
      <div className="text-[14px] text-text-secondary mt-1">{def}</div>
    </div>
  );
}

function Endpoint({ path, size, desc }: { path: string; size: string; desc: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-x-4 gap-y-1">
      <code className="font-mono text-[13px] text-text-primary shrink-0">{path}</code>
      <span className="text-[11px] text-text-faint shrink-0">{size}</span>
      <dd className="text-[14px] text-text-secondary">{desc}</dd>
    </div>
  );
}
