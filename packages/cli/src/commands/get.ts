import { writeFile } from "node:fs/promises";
import { loadManifest } from "../manifest.js";
import { format, type Format } from "../formatters.js";

interface Opts {
  format?: string;
  size?: string;
  color?: string;
  strokeWidth?: string;
  output?: string;
}

const VALID: Format[] = ["svg", "react", "vue", "datauri"];

function parseId(arg: string): string {
  // Accept either "lucide/arrow-right" or "lucide-arrow-right"
  if (arg.includes("/")) {
    const [lib, ...rest] = arg.split("/");
    return `${lib}-${rest.join("/")}`;
  }
  return arg;
}

export async function getCommand(idOrPath: string, opts: Opts) {
  const { icons } = await loadManifest();
  const id = parseId(idOrPath);
  const icon = icons.find((i) => i.id === id);
  if (!icon) {
    process.stderr.write(`Icon not found: ${id}\n`);
    process.exit(1);
  }

  const fmt = (opts.format ?? "svg") as Format;
  if (!VALID.includes(fmt)) {
    process.stderr.write(`Invalid format: ${fmt}. Use one of: ${VALID.join(", ")}\n`);
    process.exit(1);
  }

  const text = format(icon, fmt, {
    size: opts.size ? Number(opts.size) : undefined,
    color: opts.color,
    strokeWidth: opts.strokeWidth ? Number(opts.strokeWidth) : undefined,
  });

  if (opts.output) {
    await writeFile(opts.output, text, "utf8");
    process.stderr.write(`wrote ${opts.output}\n`);
    return;
  }

  process.stdout.write(text);
  if (!text.endsWith("\n")) process.stdout.write("\n");
}
