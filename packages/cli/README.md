# @santicons/cli

Search and fetch from **69,000+ open-source SVG icons** across 18 libraries including Lucide, Phosphor, Tabler, Material Design, Fluent UI, Heroicons, and more — without leaving your terminal.

```bash
npx sant-icons search "settings"
```

The full manifest is bundled in the package, so it works offline.

## Commands

### `search`

```bash
npx sant-icons search "arrow"
npx sant-icons search "arrow" --library lucide --limit 5
npx sant-icons search "" --library heroicons --style solid --limit 20
npx sant-icons search "heart" --json
```

**Flags:** `--library` `--style` `--category` `--limit` `--json`

### `get`

```bash
npx sant-icons get lucide/heart                          # raw SVG to stdout
npx sant-icons get lucide/heart --format react           # React component
npx sant-icons get lucide/heart --format vue             # Vue SFC
npx sant-icons get lucide/heart --format datauri         # base64 data URI
npx sant-icons get lucide/heart --color "#ef4444" --size 32 --stroke-width 1.5
npx sant-icons get lucide/heart --output ./src/icons/heart.svg
```

`get` accepts either `lucide/heart` or `lucide-heart` as the icon ID.

**Flags:** `--format svg|react|vue|datauri` `--size` `--color` `--stroke-width` `--output`

### `list`

```bash
npx sant-icons list                          # summary of all libraries
npx sant-icons list --library tabler         # all icon IDs in tabler
npx sant-icons list --json
```

## Libraries

| Library | Count | Styles | License |
|---|---|---|---|
| Phosphor | 9,072 | stroke, duotone, filled | MIT |
| Tabler | 6,092 | stroke, filled | MIT |
| Bootstrap Icons | 2,078 | stroke, filled | MIT |
| Lucide | 1,699 | stroke | ISC |
| Heroicons | 648 | stroke, solid | MIT |
| Feather | 287 | stroke | MIT |

---

Built by [Sant](https://sant.co.nz) — a web agency in Christchurch, New Zealand.
Web: [icons.sant.co.nz](https://icons.sant.co.nz) · MCP: [@santicons/mcp](https://www.npmjs.com/package/@santicons/mcp)
