export interface IconRecord {
  id: string;
  name: string;
  library: string;
  libraryLabel: string;
  category: string;
  style: "stroke" | "solid" | "duotone" | "filled" | "mixed";
  tags: string[];
  svg: string;
  license: "MIT" | "Apache-2.0" | "CC0" | "ISC" | "CC-BY-4.0";
  version: string;
}

export interface LibrarySummary {
  slug: string;
  label: string;
  count: number;
  styles: IconRecord["style"][];
}

export interface ManifestData {
  icons: IconRecord[];
  libraries: LibrarySummary[];
  total: number;
}
