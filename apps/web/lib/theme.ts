export type Theme = "dark" | "light";

const STORAGE_KEY = "sant-icons:theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {}
  return "dark";
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
  document.documentElement.dataset.theme = theme;
}

/** Inline boot script — runs in <head> before React hydrates so there's no
 *  flash of the wrong theme. Defaults to dark on first visit (no system
 *  preference following). */
export const BOOT_SCRIPT = `
(function() {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    document.documentElement.dataset.theme = (t === 'light' ? 'light' : 'dark');
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;
