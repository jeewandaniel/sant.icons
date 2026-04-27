# CLAUDE.md — sant.icons

> Read this file completely before writing a single line of code.
> This file is the source of truth for every decision in this project.

---

## Knowledge Graph (Graphify)

If `graphify-out/GRAPH_REPORT.md` exists, read it before answering any architecture or codebase question.
If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
After modifying code files in a session, run `graphify update .` to keep the graph current (AST only, no API cost).

---

## The Four Operating Principles (Karpathy)

These apply to every task in this project without exception.

### 1 — Think Before Coding

Do not assume. Do not hide confusion. Surface tradeoffs before touching code.

- State assumptions explicitly. If uncertain about intent, ask rather than guess.
- Present multiple interpretations when ambiguity exists. Never pick silently.
- Push back when a simpler approach exists. Say so before proceeding.
- Stop when confused. Name what is unclear and ask for clarification.
- Never implement a guess and present it as a decision.

### 2 — Simplicity First

Minimum code that solves the problem. Nothing speculative. Nothing extra.

- No features beyond what was explicitly requested.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that was not requested.
- No error handling for impossible scenarios.
- If 200 lines could be 50, rewrite it.
- Test: would a senior engineer say this is overcomplicated? If yes, simplify.

### 3 — Surgical Changes

Touch only what you must. Clean up only your own mess.

- Do not improve adjacent code, comments, or formatting that was not part of the request.
- Do not refactor things that are not broken.
- Match existing style even if you would do it differently.
- If you notice unrelated dead code, mention it in a comment — do not delete it.
- When your changes create orphaned imports or unused variables, remove those. Nothing else.
- Test: every changed line should trace directly back to the user's request.

### 4 — Goal-Driven Execution

Define success criteria. Loop until verified. Do not stop at "I think it works."

For each task, state the plan before coding:

```
1. [step] → verify: [specific check]
2. [step] → verify: [specific check]
3. [step] → verify: [specific check]
```

Transform imperative tasks into verifiable goals:
- "Add search" → "Fuse.js returns correct results for these 5 queries, verified in browser"
- "Build ingestion" → "icons.json contains 60,000+ records with name/svg/library/tags fields, verified with wc -l"
- "Ship MCP server" → "Claude Code resolves `search_icons arrow` and returns Lucide arrow-right, verified in terminal"

---

## Project Overview

**sant.icons** is a free, zero-backend icon browser aggregating 60,000+ open source SVG icons across 15+ libraries. It is built and maintained by Sant (sant.co.nz) as a developer community tool and brand-building asset.

The primary differentiator versus every existing icon site (Iconstack, Tabler, Heroicons, Phosphor) is the AI terminal layer: an MCP server and CLI that let developers search and fetch icons without leaving their coding environment.

**Domain:** icons.sant.co.nz (or sant.icons TLD)
**Hosting:** Vercel free tier — $0/month
**Design aesthetic:** Terminal-first, monospace-dominant, dark by default (see Design System below)

---

## Architecture Decision Record

These decisions are locked. Do not relitigate them.

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | Static generation, best-in-class pSEO, Vercel-native |
| Search | Fuse.js client-side | Zero backend, instant results, works offline |
| Styling | Tailwind CSS + CSS variables | Utility-first, JetBrains Mono via Google Fonts |
| Icon data | Flat JSON manifest (`icons.json`) | Single file, prebuilt at ingestion time, no DB needed |
| Ingestion | Node.js script + GitHub Actions | Pulls from GitHub API, runs weekly, zero cost |
| MCP server | Node.js + @modelcontextprotocol/sdk | Local process, bundled manifest, no hosting |
| CLI | Node.js, published as @sant/icons-cli | npx-friendly, reads bundled manifest |
| npm package | @sant/icons, React + TypeScript | Tree-shakeable components, generated from manifest |
| Hosting | Vercel free tier | Static site, CDN global, zero ops |
| PNG export | Canvas API in browser | No server, no third-party, works at any size |

---

## Repository Structure

```
sant-icons/
├── CLAUDE.md                    ← this file
├── graphify-out/                ← populated by graphify after first run
│
├── apps/
│   └── web/                     ← Next.js site (the main product)
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx         ← home: search + grid + detail panel
│       │   ├── [library]/
│       │   │   └── page.tsx     ← library overview page (pSEO)
│       │   └── [library]/[icon]/
│       │       └── page.tsx     ← icon detail page (pSEO, 60k pages)
│       ├── components/
│       │   ├── SearchBar.tsx    ← terminal prompt input
│       │   ├── IconGrid.tsx     ← virtualised grid
│       │   ├── IconCell.tsx     ← single grid cell
│       │   ├── DetailPanel.tsx  ← right-hand panel: customise + copy/download
│       │   ├── Sidebar.tsx      ← category + style filters
│       │   ├── TopBar.tsx       ← logo + stats + nav
│       │   └── StatusBar.tsx    ← keyboard shortcut hints
│       ├── lib/
│       │   ├── search.ts        ← Fuse.js setup and query helpers
│       │   ├── icons.ts         ← icon manifest loader + type definitions
│       │   └── export.ts        ← SVG/PNG/JSX/Vue export helpers
│       ├── public/
│       │   └── icons.json       ← the pre-built icon manifest (60k+ records)
│       └── next.config.ts
│
├── packages/
│   ├── ingestion/               ← Node.js script to build icons.json
│   │   ├── src/
│   │   │   ├── index.ts         ← entry: fetches all libraries, writes manifest
│   │   │   ├── fetchers/        ← one file per icon library
│   │   │   │   ├── lucide.ts
│   │   │   │   ├── heroicons.ts
│   │   │   │   ├── tabler.ts
│   │   │   │   └── ... (one per library)
│   │   │   ├── normalise.ts     ← maps raw data into IconRecord shape
│   │   │   └── tags.ts          ← tag augmentation (synonyms, categories)
│   │   └── package.json
│   │
│   ├── mcp/                     ← @sant/icons-mcp
│   │   ├── src/
│   │   │   ├── index.ts         ← MCP server entry, registers tools
│   │   │   ├── tools/
│   │   │   │   ├── search.ts    ← search_icons tool
│   │   │   │   ├── get.ts       ← get_icon tool
│   │   │   │   └── list.ts      ← list_libraries tool
│   │   │   └── manifest.ts      ← loads bundled icons.json
│   │   └── package.json
│   │
│   ├── cli/                     ← @sant/icons-cli
│   │   ├── src/
│   │   │   ├── index.ts         ← CLI entry, uses commander.js
│   │   │   ├── commands/
│   │   │   │   ├── search.ts
│   │   │   │   ├── get.ts
│   │   │   │   └── list.ts
│   │   │   └── formatters.ts    ← SVG, JSX, Vue, PNG output formatters
│   │   └── package.json
│   │
│   └── react/                   ← @sant/icons (npm package)
│       ├── src/
│       │   ├── index.ts         ← re-exports all generated components
│       │   └── generated/       ← auto-generated from manifest (do not edit)
│       │       └── LucideArrowRight.tsx
│       │       └── ... (one file per icon)
│       └── package.json
│
├── .github/
│   └── workflows/
│       └── update-icons.yml     ← weekly ingestion run
│
└── package.json                 ← pnpm workspace root
```

---

## Icon Manifest Schema

Every icon in `icons.json` follows this exact shape. Do not deviate.

```typescript
interface IconRecord {
  id: string           // "{library}-{name}" e.g. "lucide-arrow-right"
  name: string         // kebab-case icon name e.g. "arrow-right"
  library: string      // library slug e.g. "lucide"
  libraryLabel: string // display name e.g. "Lucide"
  category: string     // e.g. "arrows", "actions", "media"
  style: "stroke" | "solid" | "duotone" | "filled" | "mixed"
  tags: string[]       // searchable terms including synonyms
  svg: string          // full SVG string, viewBox normalised to "0 0 24 24"
  license: "MIT" | "Apache-2.0" | "CC0"
  version: string      // library version this was pulled from
}
```

The `tags` array is what makes search good. Every record must have at minimum: the icon name split on hyphens, the category name, and any synonyms from the tags augmentation file. Example for `lucide-arrow-right`: `["arrow", "right", "direction", "forward", "next", "navigate", "chevron"]`.

---

## Libraries to Ingest (Phase 1 MVP)

| Library | Slug | Style | Approx Count | GitHub |
|---|---|---|---|---|
| Lucide | lucide | stroke | 1,400 | lucide-icons/lucide |
| Heroicons | heroicons | stroke + solid | 300 | tailwindlabs/heroicons |
| Tabler | tabler | stroke | 5,000 | tabler/tabler-icons |
| Bootstrap Icons | bootstrap | stroke + solid | 2,000 | twbs/icons |
| Feather | feather | stroke | 280 | feathericons/feather |
| Phosphor | phosphor | stroke + solid + duotone | 9,000 | phosphor-icons/phosphor-icons |
| Radix Icons | radix | stroke | 320 | radix-ui/icons |
| Remix Icon | remix | stroke + filled | 2,800 | Remix-Design/RemixIcon |
| Ionicons | ionicons | stroke + solid | 1,300 | ionic-team/ionicons |
| Material Symbols | material | stroke + solid | 3,000 | google/material-design-icons |
| css.gg | cssgg | stroke | 700 | astrit/css.gg |
| Boxicons | boxicons | stroke + solid | 1,600 | atisajanyan/boxicons |
| Solar Icons | solar | stroke + bold | 7,500 | 480-Design/solar-icon-set |
| Majesticons | majesticons | stroke + solid | 1,200 | halfmage/majesticons |
| Ant Design Icons | antd | filled + outline | 900 | ant-design/icons |

---

## Design System

All visual decisions follow the terminal-first aesthetic locked in the mockup. Do not deviate without explicit instruction.

### Colour Tokens

```css
--color-bg-base: #0c0c0b;          /* page background */
--color-bg-surface: #111110;       /* search input, preview panel */
--color-bg-hover: #141412;         /* icon cell hover */
--color-bg-accent: #1a2410;        /* MCP badge, active filter */
--color-border-subtle: #1a1a18;    /* dividers, grid lines */
--color-border-default: #2a2a28;   /* filter buttons, inputs */
--color-border-accent: #3a5020;    /* active filter border, MCP badge border */
--color-text-primary: #e8e6df;     /* primary text */
--color-text-secondary: #8a8a80;   /* icon names on hover, stats */
--color-text-muted: #5a5a55;       /* sidebar labels, nav links */
--color-text-faint: #3a3a38;       /* section labels, inactive icon names */
--color-accent: #c8f07a;           /* electric lime — cursor, active states, primary button */
```

### Typography

Font: JetBrains Mono for everything. No exceptions. Load via Google Fonts.
Weights used: 300 (labels), 400 (body), 500 (icon names, headings), 700 (logo, primary button).

```
Logo:           700, 13px, letter-spacing: -0.02em
Top bar stats:  400, 11px, letter-spacing: 0.04em
Search input:   400, 15px
Filter buttons: 400, 11px, letter-spacing: 0.03em
Section labels: 400, 9px, letter-spacing: 0.12em, UPPERCASE
Icon names:     400, 9px, letter-spacing: 0.02em
Status bar:     400, 10px, letter-spacing: 0.04em
Primary button: 700, 11px, letter-spacing: 0.03em
```

### Layout

Three-column layout at 1200px+: sidebar (160px fixed) | main grid (flex 1) | detail panel (220px fixed).
At tablet: hide detail panel, show on icon click as modal.
At mobile: single column, sidebar becomes a bottom sheet.

The grid uses CSS grid with `repeat(auto-fill, minmax(72px, 1fr))` and 1px gaps on a background-colour surface so gaps appear as grid lines.

### Icon Cell Anatomy

```
┌─────────────────┐  ← background: #0c0c0b, hover: #141412
│  [copy]         │  ← copy hint: top-right, 8px, accent colour, opacity 0 → 1 on hover
│                 │
│     [SVG]       │  ← 22×22px, color: #8a8a80, hover: #c8f07a (transition 0.12s)
│                 │
│  icon-name      │  ← 9px, faint, hover: muted, truncated
└─────────────────┘
```

### Search Bar

```
┌─────────────────────────────────────────────────────┐
│ >  search 60,421 icons...          ↵ copy · esc clr │
└─────────────────────────────────────────────────────┘
```

The `>` symbol is a non-interactive span in accent colour. The input uses `caret-color: #c8f07a`. Border transitions from `#2e2e2c` to `#c8f07a` on focus. No border-radius beyond 4px.

---

## MCP Server Specification

Package name: `@sant/icons-mcp`
Published to npm. Runs locally via `npx @sant/icons-mcp`.

### Claude Code Config

```json
{
  "mcpServers": {
    "sant-icons": {
      "command": "npx",
      "args": ["@sant/icons-mcp"]
    }
  }
}
```

### Tools

**search_icons**
```typescript
{
  name: "search_icons",
  description: "Search sant.icons for SVG icons by name, keyword, or category",
  inputSchema: {
    query: string,           // required: search term e.g. "arrow right"
    library?: string,        // optional: filter to one library e.g. "lucide"
    style?: string,          // optional: "stroke" | "solid" | "duotone"
    category?: string,       // optional: "arrows" | "actions" | "media" etc
    limit?: number           // optional: default 10, max 50
  }
}
// Returns: Array of { id, name, library, category, tags, style }
// Does NOT return SVG in search results — use get_icon for that
```

**get_icon**
```typescript
{
  name: "get_icon",
  description: "Get the full SVG for a specific icon by ID",
  inputSchema: {
    id: string,              // required: icon ID e.g. "lucide-arrow-right"
    size?: number,           // optional: default 24
    color?: string,          // optional: hex colour e.g. "#000000"
    strokeWidth?: number     // optional: for stroke icons, default 1.5
  }
}
// Returns: { id, name, library, svg: string (modified per params), license }
```

**list_libraries**
```typescript
{
  name: "list_libraries",
  description: "List all available icon libraries with counts and license info",
  inputSchema: {}
}
// Returns: Array of { slug, label, count, styles, license }
```

---

## CLI Specification

Package name: `@sant/icons-cli`

```bash
npx sant-icons search "settings"
npx sant-icons search "arrow" --library lucide --style stroke --limit 20
npx sant-icons get lucide/settings
npx sant-icons get lucide/settings --format react --color "#6b7280" --size 24
npx sant-icons get heroicons/heart --output ./src/icons/heart.svg
npx sant-icons list
npx sant-icons list --library tabler
```

Output formats for `get`:
- `svg` (default) — raw SVG string
- `react` — functional React component with TypeScript props
- `vue` — Vue SFC script setup component
- `datauri` — base64 data URI for CSS backgrounds

---

## SEO Architecture

Every icon gets a static page at `/[library]/[icon-name]`. Page metadata follows this pattern:

```typescript
// For lucide/arrow-right:
title: "arrow-right — Lucide Icons | Sant Icons"
description: "Free SVG arrow-right icon from Lucide. Copy SVG, JSX, or Vue. Download PNG. Zero login."
og:image: generated SVG preview at 1200×630
```

The `/[library]` pages target searches like "lucide icons svg" and "tabler icons free download".
The `/[library]/[icon]` pages target searches like "lucide arrow-right icon svg" and "heroicons heart download".

Generate all 60,000+ pages at build time. `next.config.ts` must set `output: 'export'` for full static generation.

---

## Build Phases

### Phase 1 — Ingestion Pipeline (Week 1)

**Goal:** `icons.json` exists in `public/` with 60,000+ valid records.

Tasks:
1. Set up pnpm workspace with the folder structure above.
2. Build `packages/ingestion/src/fetchers/` — one file per library. Each fetcher downloads the library's GitHub release zip, extracts SVGs, and returns `IconRecord[]`.
3. Build `packages/ingestion/src/normalise.ts` — normalises viewBox, strips comments, ensures consistent SVG structure.
4. Build `packages/ingestion/src/tags.ts` — augments each record with synonyms and related terms.
5. Wire everything in `packages/ingestion/src/index.ts` — runs all fetchers, merges results, writes `apps/web/public/icons.json`.
6. Run and verify: `node dist/index.js` produces a valid JSON file. Check with `wc -l` and spot-check 10 random records.

Success criteria: `icons.json` has 60,000+ records. Every record has `id`, `name`, `library`, `category`, `style`, `tags`, `svg`, `license`, `version`. No record has an empty `svg` field.

### Phase 2 — Next.js Site (Week 2)

**Goal:** Deployed to Vercel. Search works. Grid renders. Detail panel works. Copy and download work.

Tasks:
1. Scaffold Next.js 14 app with TypeScript, Tailwind, JetBrains Mono via Google Fonts.
2. `lib/icons.ts` — loads and parses `icons.json` at build time. Exports typed helpers.
3. `lib/search.ts` — initialises Fuse.js with the manifest on first load. Exposes `search(query, filters)` returning `IconRecord[]`.
4. Build components in this order: TopBar, SearchBar, Sidebar, IconGrid (virtualised with react-window), IconCell, DetailPanel, StatusBar.
5. Wire the home page: search state, filter state, selected icon state. All client-side.
6. Build `lib/export.ts` — SVG copy, JSX copy, Vue copy, PNG download (Canvas API), SVG download.
7. Implement keyboard shortcuts: `/` focuses search, `Escape` clears, `Enter` copies selected icon SVG, `Space` toggles multi-select.
8. Build static pages: `app/[library]/page.tsx` and `app/[library]/[icon]/page.tsx`. Use `generateStaticParams` to pre-render all 60,000+ icon pages.
9. Deploy to Vercel. Verify build completes and all routes resolve.

Success criteria: Site loads in under 1 second. Search returns results for "arrow", "settings", "heart" instantly. Copy SVG puts valid SVG on clipboard. Download PNG produces a valid PNG. All icon detail pages resolve. Lighthouse performance score above 90.

### Phase 3 — MCP Server and CLI (Week 3)

**Goal:** A developer can install the MCP and ask Claude Code to find icons. The CLI works via npx.

Tasks:
1. Build `packages/mcp/` — install `@modelcontextprotocol/sdk`, register the three tools, bundle `icons.json` into the package.
2. Build `packages/cli/` — install `commander`, implement `search`, `get`, `list` commands with all formatters.
3. Write proper `README.md` for both packages — these are SEO surfaces on npmjs.com.
4. Publish both to npm as `@sant/icons-mcp` and `@sant/icons-cli`.
5. Test MCP: add to Claude Code config, run a session, verify `search_icons arrow` returns results.
6. Test CLI: `npx sant-icons search "settings"` returns results. `npx sant-icons get lucide/settings --format react` outputs a valid component.

Success criteria: Claude Code can search and retrieve an icon SVG in a single session without touching a browser. CLI produces valid output for all three formats.

### Phase 4 — React Package (Week 4)

**Goal:** `@sant/icons` is on npm and tree-shakeable.

Tasks:
1. Write a code-generation script in `packages/ingestion` that reads `icons.json` and writes one `{LibraryName}{IconName}.tsx` file per icon into `packages/react/src/generated/`.
2. Each generated component accepts `size`, `color`, `strokeWidth`, `className` props with sensible defaults.
3. `packages/react/src/index.ts` re-exports all generated components.
4. Bundle with tsup, publish as `@sant/icons`.
5. Verify tree-shaking: a project importing one icon should not bundle the rest.

Success criteria: `import { LucideArrowRight } from '@sant/icons/react'` works in a fresh Next.js project. Bundle analysis shows only the imported icon is included.

### Phase 5 — GitHub Action (Week 4, alongside Phase 4)

**Goal:** Icons stay current without manual effort.

A weekly GitHub Action runs the ingestion pipeline, commits an updated `icons.json` if it changed, and triggers a Vercel redeploy.

```yaml
# .github/workflows/update-icons.yml
name: Update icons
on:
  schedule:
    - cron: '0 3 * * 1'  # Mondays 3am UTC
  workflow_dispatch:       # allow manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm --filter ingestion run build
      - run: node packages/ingestion/dist/index.js
      - name: Commit if changed
        run: |
          git config user.name "sant-icons-bot"
          git config user.email "bot@sant.co.nz"
          git add apps/web/public/icons.json
          git diff --staged --quiet || git commit -m "chore: update icon manifest $(date +%Y-%m-%d)"
          git push
```

---

## Environment Variables

None required for the web app. The site is 100% static.

The ingestion script needs `GITHUB_TOKEN` to avoid GitHub API rate limits when fetching library releases. Set this as a GitHub Actions secret and locally in `.env`.

```
GITHUB_TOKEN=ghp_...    # GitHub personal access token, read-only scope
```

---

## Common Pitfalls — Do Not Make These Mistakes

**Virtualisation is not optional.** Rendering 60,000 icon cells without virtualisation will crash the browser. Use `react-window` or `@tanstack/virtual` from day one. Do not defer this.

**Fuse.js index must be built once.** Build it outside the React render cycle, on module load. Rebuilding it on every search call will cause a 2-3 second lag on first keystroke.

**SVG normalisation must be consistent.** Every SVG in the manifest must have a `viewBox="0 0 24 24"`. Some libraries use 20×20 or 32×32. Normalise in the ingestion step, not at render time.

**Static export means no server components with dynamic data.** `output: 'export'` disables all dynamic routes. Every page is HTML generated at build time. Do not use `fetch` at request time anywhere.

**The MCP server reads a bundled copy of the manifest.** It does not call the live site. Bundle `icons.json` into the npm package at publish time. A developer with no internet connection should still be able to use the MCP.

**Do not put the gram of colour into the detail panel.** The accent colour is reserved for interactive and feedback states. Icon previews in the detail panel should show the icon in `#e8e6df` (primary text colour) by default, only switching to accent when the user selects it.

---

## Sant Brand Integration

The site is a Sant product. Brand presence should be confident but not loud.

- Logo: `sant.icons` in JetBrains Mono 700. `sant` in accent colour, `.icons` in muted colour. No other logo treatment.
- Footer: `sant.co.nz — free, forever`. Single line. No marketing copy.
- Every icon detail page includes `built by sant.co.nz` in the page footer in faint text.
- The MCP server README includes a single line: `Built by Sant — a web agency in Auckland, New Zealand. sant.co.nz`

That is the total extent of sant branding. The tool earns attention by being excellent, not by advertising.

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/sant-co-nz/sant-icons
cd sant-icons

# 2. Install pnpm if you do not have it
npm install -g pnpm

# 3. Install all workspace dependencies
pnpm install

# 4. Install graphify (optional but recommended)
npm install -g graphify
graphify init .
graphify update .

# 5. Install the Karpathy Claude Code skill (do this once globally)
# In Claude Code:
# /plugin marketplace add forrestchang/andrej-karpathy-skills
# /plugin install andrej-karpathy-skills@karpathy-skills

# 6. Copy your GitHub token for ingestion
cp .env.example .env
# Edit .env and add GITHUB_TOKEN=...

# 7. Run the ingestion pipeline
pnpm --filter ingestion run build
node packages/ingestion/dist/index.js
# Expected: apps/web/public/icons.json created with 60,000+ records

# 8. Start the Next.js dev server
pnpm --filter web run dev
# Visit http://localhost:3000

# 9. Verify search works
# Type "arrow" in the search bar — expect 200+ results instantly
# Type "settings" — expect 100+ results
# Click an icon — detail panel should populate
```

---

## Session Checklist

At the start of every Claude Code session working on this project:

- [ ] Read `graphify-out/GRAPH_REPORT.md` if it exists
- [ ] Confirm which phase you are working on
- [ ] State your plan with success criteria before writing code
- [ ] Confirm you will not touch code outside the scope of the task

At the end of every session:

- [ ] Run `graphify update .` to keep the knowledge graph current
- [ ] Verify success criteria were met before closing

---

*sant.icons — built by Sant, Auckland, New Zealand*
*CLAUDE.md v1.0 — April 2026*
