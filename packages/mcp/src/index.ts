#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { runSearch, searchInputSchema, type SearchInput } from "./tools/search.js";
import { runGet, getInputSchema, type GetInput } from "./tools/get.js";
import { runList, listInputSchema } from "./tools/list.js";

const server = new Server(
  { name: "sant-icons", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

const TOOLS = [
  {
    name: "search_icons",
    description:
      "Search sant.icons for SVG icons by name, keyword, or category across 19,000+ icons spanning Lucide, Heroicons, Tabler, Phosphor, Bootstrap Icons, and Feather. Returns lightweight metadata (no SVG); call get_icon to retrieve the full SVG.",
    inputSchema: searchInputSchema,
  },
  {
    name: "get_icon",
    description:
      "Get the full SVG for a specific icon by ID. Optionally customise size, colour, and stroke width.",
    inputSchema: getInputSchema,
  },
  {
    name: "list_libraries",
    description:
      "List all available icon libraries with counts, styles, and license info.",
    inputSchema: listInputSchema,
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const name = req.params.name;
  const args = (req.params.arguments ?? {}) as Record<string, unknown>;
  try {
    let payload: unknown;
    if (name === "search_icons") payload = await runSearch(args as unknown as SearchInput);
    else if (name === "get_icon") payload = await runGet(args as unknown as GetInput);
    else if (name === "list_libraries") payload = await runList();
    else throw new Error(`Unknown tool: ${name}`);
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isError: true,
      content: [{ type: "text", text: `Error: ${message}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("sant-icons MCP server ready\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
