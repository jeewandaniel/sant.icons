# @sant/icons-mcp

Search and fetch from **19,000+ open-source SVG icons** across Lucide, Heroicons, Tabler, Phosphor, Bootstrap Icons, and Feather — directly from your AI coding assistant via the [Model Context Protocol](https://modelcontextprotocol.io/).

No browser, no copy-paste, no signup. Manifest is bundled in the package, so it works offline.

## Install

The MCP server is run on demand via `npx` — no global install required.

### Claude Code / Claude Desktop

Add to your MCP config:

```json
{
  "mcpServers": {
    "sant-icons": {
      "command": "npx",
      "args": ["-y", "@sant/icons-mcp"]
    }
  }
}
```

Then ask: *"find me a stroke arrow-right icon from lucide and put it in src/icons/"*.

## Tools

### `search_icons`

Search by name, keyword, or category. Returns lightweight metadata (no SVG body — call `get_icon` for that).

| Param | Type | Description |
|---|---|---|
| `query` | string | required — e.g. `"arrow right"` |
| `library` | string | filter to one library (`lucide`, `heroicons`, `tabler`, `phosphor`, `bootstrap`, `feather`) |
| `style` | string | `stroke` \| `solid` \| `duotone` \| `filled` |
| `category` | string | filter by category |
| `limit` | number | max results, default 10, max 50 |

### `get_icon`

Get the full SVG for one icon by ID, with optional customisation.

| Param | Type | Description |
|---|---|---|
| `id` | string | required — e.g. `"lucide-arrow-right"` |
| `size` | number | default 24 |
| `color` | string | hex colour applied to stroke or fill |
| `strokeWidth` | number | default 2 (stroke icons only) |

### `list_libraries`

Returns all available libraries with counts, supported styles, license, and version.

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
Web: [icons.sant.co.nz](https://icons.sant.co.nz) · CLI: [@sant/icons-cli](https://www.npmjs.com/package/@sant/icons-cli)
