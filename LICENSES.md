# Icon library licenses

sant.icons aggregates icons from 18 upstream libraries. Each library retains
its own license. The sant.icons code (site, MCP, CLI, ingestion) is MIT;
the icons themselves are not.

| Library | Slug | License | License URL |
|---|---|---|---|
| Lucide | `lucide` | ISC | <https://github.com/lucide-icons/lucide/blob/main/LICENSE> |
| Heroicons | `heroicons` | MIT | <https://github.com/tailwindlabs/heroicons/blob/master/LICENSE> |
| Tabler Icons | `tabler` | MIT | <https://github.com/tabler/tabler-icons/blob/main/LICENSE> |
| Feather Icons | `feather` | MIT | <https://github.com/feathericons/feather/blob/main/LICENSE> |
| Bootstrap Icons | `bootstrap` | MIT | <https://github.com/twbs/icons/blob/main/LICENSE> |
| Phosphor Icons | `phosphor` | MIT | <https://github.com/phosphor-icons/core/blob/main/LICENSE> |
| Material Design Icons | `material` | Apache-2.0 | <https://github.com/Templarian/MaterialDesign/blob/master/LICENSE> |
| Fluent UI System Icons | `fluent` | MIT | <https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE> |
| Huge Icons | `huge` | MIT | <https://github.com/hugeicons/hugeicons-react/blob/main/LICENSE> |
| Simple Icons | `brand` | CC0-1.0 | <https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md> |
| Mingcute | `mingcute` | Apache-2.0 | <https://github.com/Richard9394/MingCute/blob/main/LICENSE> |
| Carbon Icons | `carbon` | Apache-2.0 | <https://github.com/carbon-design-system/carbon/blob/main/LICENSE> |
| Iconoir | `iconoir` | MIT | <https://github.com/iconoir-icons/iconoir/blob/main/LICENSE> |
| Octicons | `octicon` | MIT | <https://github.com/primer/octicons/blob/main/LICENSE> |
| Pixelarticons | `pixelart` | MIT | <https://github.com/halfmage/pixelarticons/blob/main/LICENSE> |
| Majesticons | `majesticons` | MIT | <https://github.com/halfmage/majesticons/blob/master/LICENSE.md> |
| IconaMoon | `iconamoon` | CC-BY-4.0 | <https://github.com/dharmatype/IconaMoon/blob/main/LICENSE> |
| Devicon | `devicon` | MIT | <https://github.com/devicons/devicon/blob/develop/LICENSE> |

## Attribution

Each icon detail page on icons.sant.co.nz links to the icon's specific upstream
license. The MCP server and CLI both expose `license` and `version` fields on
every icon record so consumers can attribute correctly.

## A note on Devicon

Devicon's brand-logo SVGs ship with hardcoded brand colors as part of their
designs (e.g., the React logo's cyan, Node.js's green). When rendered in the
sant.icons sidebar/spotlight at very small sizes we strip these colors so they
render in the site palette. Inside the grid and detail pages — and in any SVG
copied or downloaded — the original colors are preserved.

## A note on Simple Icons

Simple Icons are brand logos. CC0 means there's no copyright on the icon SVGs
themselves, but the underlying brands and trademarks belong to their owners.
Use brand logos only in contexts that comply with each brand's trademark
policy (typically: don't use a company's logo to imply endorsement, don't
modify it beyond size/color, don't use it as your own brand mark).
