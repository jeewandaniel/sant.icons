"use client";

import { useEffect, useState } from "react";
import {
  getStoredTheme,
  resolveTheme,
  setStoredTheme,
  type ResolvedTheme,
} from "@/lib/theme";

/**
 * Three-state cycle: auto → dark → light → auto.
 * Tooltip shows the current state ("System / Dark / Light"). The icon shown
 * reflects the *resolved* theme (sun if currently light, moon if currently
 * dark) regardless of stored preference, so the user always sees what they're
 * looking at.
 */
export function ThemeToggle() {
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");
  const [stored, setStored] = useState<"auto" | "dark" | "light">("auto");

  useEffect(() => {
    const t = getStoredTheme();
    setStored(t);
    setResolved(resolveTheme(t));

    // Track system preference changes when in 'auto' mode
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (getStoredTheme() === "auto") {
        const next = mq.matches ? "light" : "dark";
        setResolved(next);
        document.documentElement.dataset.theme = next;
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const cycle = () => {
    const order: ("auto" | "dark" | "light")[] = ["auto", "dark", "light"];
    const next = order[(order.indexOf(stored) + 1) % order.length];
    setStored(next);
    setStoredTheme(next);
    setResolved(resolveTheme(next));
  };

  const label =
    stored === "auto" ? "System" : stored === "dark" ? "Dark" : "Light";

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Theme: ${label} (click to cycle)`}
      aria-label={`Theme: ${label}. Click to cycle.`}
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
    >
      {resolved === "dark" ? <MoonIcon /> : <SunIcon />}
      {stored === "auto" && (
        <span
          aria-hidden
          className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent"
        />
      )}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}
