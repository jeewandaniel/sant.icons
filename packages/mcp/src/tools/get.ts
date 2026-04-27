import { customiseSvg, loadManifest } from "../manifest.js";

export const getInputSchema = {
  type: "object",
  properties: {
    id: { type: "string", description: "Icon ID, e.g. 'lucide-arrow-right'" },
    size: { type: "number", description: "Default 24" },
    color: { type: "string", description: "Hex colour for stroke or fill" },
    strokeWidth: { type: "number", description: "Stroke width for stroke icons (default 2)" },
  },
  required: ["id"],
} as const;

export interface GetInput {
  id: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export async function runGet(input: GetInput) {
  const { icons } = await loadManifest();
  const icon = icons.find((i) => i.id === input.id);
  if (!icon) throw new Error(`Icon not found: ${input.id}`);
  const svg = customiseSvg(icon, {
    size: input.size,
    color: input.color,
    strokeWidth: input.strokeWidth,
  });
  return {
    id: icon.id,
    name: icon.name,
    library: icon.library,
    libraryLabel: icon.libraryLabel,
    style: icon.style,
    license: icon.license,
    version: icon.version,
    svg,
  };
}
