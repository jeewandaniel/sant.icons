#!/usr/bin/env node
import { Command } from "commander";
import { searchCommand } from "./commands/search.js";
import { getCommand } from "./commands/get.js";
import { listCommand } from "./commands/list.js";

const program = new Command();

program
  .name("sant-icons")
  .description("Search and fetch icons from sant.icons (19,000+ open-source SVG icons).")
  .version("0.1.0");

program
  .command("search")
  .description("Search icons by name, keyword, or category")
  .argument("<query>", "search term")
  .option("--library <slug>", "filter by library (lucide, heroicons, tabler, phosphor, bootstrap, feather)")
  .option("--style <style>", "filter by style (stroke, solid, duotone, filled)")
  .option("--category <category>", "filter by category")
  .option("--limit <n>", "max results (default 20, max 100)", "20")
  .option("--json", "output JSON")
  .action(searchCommand);

program
  .command("get")
  .description("Get an icon by ID. Accepts 'lucide/arrow-right' or 'lucide-arrow-right'.")
  .argument("<id>", "icon id")
  .option("--format <kind>", "output format: svg | react | vue | datauri", "svg")
  .option("--size <px>", "size (default 24)")
  .option("--color <hex>", "colour (default currentColor)")
  .option("--stroke-width <n>", "stroke width for stroke icons (default 2)")
  .option("--output <path>", "write to file instead of stdout")
  .action(getCommand);

program
  .command("list")
  .description("List libraries (no args) or all icons in one library (--library)")
  .option("--library <slug>", "list all icons in this library")
  .option("--json", "output JSON")
  .action(listCommand);

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
