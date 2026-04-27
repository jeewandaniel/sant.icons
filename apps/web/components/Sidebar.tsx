"use client";

import { useEffect, useState } from "react";
import type { LibrarySummary } from "@/lib/types";
import type { Filters } from "@/lib/search";
import { loadSpotlight, type SpotlightEntry } from "@/lib/spotlight";

interface SidebarProps {
  libraries: LibrarySummary[];
  styles: { name: string; count: number }[];
  filters: Filters;
  onFilters: (next: Filters) => void;
}

const SECTION_LABEL = "text-[13px] font-semibold tracking-[0.14em] uppercase text-text-faint mb-4 mt-9 first:mt-0";

export function Sidebar({ libraries, styles, filters, onFilters }: SidebarProps) {
  const [spotlight, setSpotlight] = useState<Record<string, SpotlightEntry>>({});

  useEffect(() => {
    loadSpotlight().then(setSpotlight).catch(() => {});
  }, []);

  const total = libraries.reduce((s, l) => s + l.count, 0);

  return (
    <aside className="w-[285px] shrink-0 border-r border-border-subtle bg-bg-base px-5 py-7 overflow-y-auto">
      {/* Libraries */}
      <div className={SECTION_LABEL}>Libraries</div>
      <SidebarRow
        label="All libraries"
        count={total}
        active={!filters.library}
        onClick={() => onFilters({ ...filters, library: undefined })}
        glyph={<AllGlyph />}
      />
      {libraries.map((lib) => {
        const sp = spotlight[lib.slug];
        return (
          <SidebarRow
            key={lib.slug}
            label={lib.label}
            count={lib.count}
            active={filters.library === lib.slug}
            onClick={() =>
              onFilters({
                ...filters,
                library: filters.library === lib.slug ? undefined : lib.slug,
              })
            }
            glyph={
              sp ? (
                <span
                  className={`icon-svg ${sp.style} flex items-center justify-center`}
                  style={{ width: 20, height: 20, ["--icon-svg-size" as string]: "20px" }}
                  dangerouslySetInnerHTML={{ __html: sp.svg }}
                />
              ) : (
                <span className="w-[20px] h-[20px] rounded bg-bg-hover" />
              )
            }
          />
        );
      })}

      {/* Style */}
      <div className={SECTION_LABEL}>Style</div>
      <SidebarRow
        label="All"
        active={!filters.style}
        onClick={() => onFilters({ ...filters, style: undefined })}
        glyph={<AllStylesGlyph />}
      />
      {styles.map((s) => (
        <SidebarRow
          key={s.name}
          label={cap(s.name)}
          count={s.count}
          active={filters.style === s.name}
          onClick={() =>
            onFilters({ ...filters, style: filters.style === s.name ? undefined : s.name })
          }
          glyph={<StyleGlyph style={s.name} />}
        />
      ))}
    </aside>
  );
}

function SidebarRow({
  label,
  count,
  active,
  onClick,
  glyph,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  glyph?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex items-center gap-3 rounded-md px-2.5 py-2.5 my-0.5 text-[16px] font-medium transition-colors ${
        active
          ? "bg-bg-accent text-accent"
          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
      }`}
    >
      {glyph !== undefined && (
        <span
          className={`shrink-0 inline-flex items-center justify-center w-[20px] h-[20px] ${
            active ? "text-accent" : "text-text-muted group-hover:text-text-secondary"
          }`}
        >
          {glyph}
        </span>
      )}
      <span className="flex-1 text-left truncate">{label}</span>
      {typeof count === "number" && (
        <span
          className={`text-[13px] font-normal tabular-nums ${
            active ? "text-accent/70" : "text-text-faint group-hover:text-text-muted"
          }`}
        >
          {count.toLocaleString()}
        </span>
      )}
    </button>
  );
}

function AllGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function AllStylesGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <circle cx="8" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="12" r="4.5" fill="currentColor" />
    </svg>
  );
}

function StyleGlyph({ style }: { style: string }) {
  if (style === "stroke") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (style === "filled" || style === "solid") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="8" fill="currentColor" />
      </svg>
    );
  }
  if (style === "duotone") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.3" />
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    );
  }
  // mixed / unknown
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 4 A8 8 0 0 1 12 20 Z" fill="currentColor" />
      <path d="M12 4 A8 8 0 0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
