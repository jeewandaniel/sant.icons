# sant.icons

> 69,000+ free open-source SVG icons across 18 libraries — one search bar, one URL.

[icons.sant.co.nz](https://icons.sant.co.nz) · [Docs](https://icons.sant.co.nz/docs) · [MCP server](https://www.npmjs.com/package/@santicons/mcp) · [CLI](https://www.npmjs.com/package/@santicons/cli)

Three surfaces for the same data:

- **Web** — search and customise icons in the browser.
- **MCP** — give your AI coding assistant (Claude Code, Claude Desktop, etc.) the ability to fetch icons directly into your codebase.
- **CLI** — `npx sant-icons get lucide/heart` from your terminal.

100% static, hosted on Vercel free tier. Zero login. Zero paywall.

---

## Coverage

| Library | Count | License |
|---|---:|---|
| Fluent UI | 19,649 | MIT |
| Phosphor | 9,072 | MIT |
| Material Design | 7,638 | Apache-2.0 |
| Tabler | 6,092 | MIT |
| Huge Icons | 5,088 | MIT |
| Simple Icons | 3,698 | CC0-1.0 |
| Mingcute | 3,324 | Apache-2.0 |
| Carbon | 2,634 | Apache-2.0 |
| Bootstrap Icons | 2,078 | MIT |
| IconaMoon | 1,781 | CC-BY-4.0 |
| Lucide | 1,699 | ISC |
| Iconoir | 1,682 | MIT |
| Pixel Art | 1,096 | MIT |
| Majesticons | 1,045 | MIT |
| Devicon | 1,042 | MIT |
| Octicons | 907 | MIT |
| Heroicons | 648 | MIT |
| Feather | 287 | MIT |

Each library retains its upstream license. See [`LICENSES.md`](./LICENSES.md).

---

## Repository layout

```
sant-icons/
├── apps/web/                  Next.js 14 site, statically exported
├── packages/
│   ├── ingestion/             Builds the manifest from npm/GitHub upstream sources
│   ├── mcp/                   @santicons/mcp — Model Context Protocol server
│   └── cli/                   @santicons/cli — Terminal CLI
└── .github/workflows/         Weekly auto-update + release automation
```

Monorepo, pnpm workspaces.

---

## Local development

Requires Node 20+ and pnpm 10+.

```bash
git clone https://github.com/jeewandaniel/sant.icons
cd sant.icons
pnpm install

# Set GitHub token (used only by the Lucide fetcher to avoid rate limits)
cp .env.example .env
echo "GITHUB_TOKEN=ghp_..." >> .env

# Build the manifest (~5 sec, produces ~70k records)
pnpm --filter @sant/ingestion run build
node packages/ingestion/dist/index.js

# Start the dev server
pnpm --filter @sant/web dev
# → http://localhost:3000
```

The ingestion step writes:

- `apps/web/public/icons.json` — full manifest with SVGs
- `apps/web/public/index.json` — slim metadata, no SVG body
- `apps/web/public/svgs/*.json` — per-library SVG chunks (lazy-loaded by the web client)
- `apps/web/public/library-spotlight.json` — sidebar previews
- `apps/web/public/sitemap.xml` + `sitemap-*.xml` — SEO sitemap split for 70k URLs
- `apps/web/public/og/*.png` — Open Graph cards for the home + each library

These files are gitignored — fresh on every clone or weekly auto-update.

---

## Adding a new library

Two paths depending on the upstream's distribution:

**Iconify-distributed** (most are): add an entry to `ICONIFY_SOURCES` in `packages/ingestion/src/index.ts`. One line.

**Custom layout** (e.g., Lucide ships rich JSON metadata alongside SVGs that's worth using): write a fetcher in `packages/ingestion/src/fetchers/`, following the existing pattern. ~50 lines.

Then `pnpm --filter @sant/ingestion run build && node packages/ingestion/dist/index.js` and check the diff.

---

## MCP

```json
{
  "mcpServers": {
    "sant-icons": {
      "command": "npx",
      "args": ["-y", "@santicons/mcp"]
    }
  }
}
```

Three tools exposed: `search_icons`, `get_icon`, `list_libraries`. See [packages/mcp/README.md](./packages/mcp/README.md).

## CLI

```bash
npx sant-icons search "settings"
npx sant-icons get lucide/heart --format react --color "#ef4444"
npx sant-icons list --library tabler --json
```

See [packages/cli/README.md](./packages/cli/README.md).

## Manifest API

For automation, code-gen, or building your own tools — fetch the JSON files directly:

```bash
curl https://icons.sant.co.nz/index.json   # slim metadata, ~16 MB
curl https://icons.sant.co.nz/svgs/lucide.json   # per-library SVGs
```

Full schema documented at [icons.sant.co.nz/docs](https://icons.sant.co.nz/docs#manifest).

---

## License

MIT for the code itself. Each icon library retains its upstream license — see [`LICENSES.md`](./LICENSES.md). Every icon detail page on the site links to its specific license.

---

Built by [Sant](https://sant.co.nz) — Christchurch, New Zealand.
