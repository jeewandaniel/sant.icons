export type Theme = "auto" | "dark" | "light";
export type ResolvedTheme = "dark" | "light";

const STORAGE_KEY = "sant-icons:theme";

/**
 * The boot script (inline in layout.tsx) runs this same logic before React
 * hydrates so there's no flash of the wrong theme.
 */
export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "dark" || theme === "light") return theme;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "auto";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light" || v === "auto") return v;
  } catch {}
  return "auto";
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
  applyTheme(theme);
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolveTheme(theme);
}

/** Inline boot script — keep it tiny and self-contained. Pasted into <head>. */
export const BOOT_SCRIPT = `
(function() {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}') || 'auto';
    var resolved = (t === 'dark' || t === 'light') ? t :
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.dataset.theme = resolved;
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;
