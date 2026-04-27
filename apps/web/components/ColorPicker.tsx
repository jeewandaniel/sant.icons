"use client";

import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";

// 16 swatches in 2 rows of 8 — generous quick-pick palette.
const SWATCHES = [
  // Row 1 — lights → warms
  { hex: "#fafafa", label: "white" },
  { hex: "#c8f07a", label: "lime" },
  { hex: "#ef4444", label: "red" },
  { hex: "#f97316", label: "orange" },
  { hex: "#f59e0b", label: "amber" },
  { hex: "#eab308", label: "yellow" },
  { hex: "#22c55e", label: "green" },
  { hex: "#14b8a6", label: "teal" },
  // Row 2 — cools → darks
  { hex: "#06b6d4", label: "cyan" },
  { hex: "#3b82f6", label: "blue" },
  { hex: "#6366f1", label: "indigo" },
  { hex: "#8b5cf6", label: "violet" },
  { hex: "#ec4899", label: "pink" },
  { hex: "#a1a1aa", label: "grey" },
  { hex: "#52525b", label: "slate" },
  { hex: "#18181b", label: "black" },
];

const RECENT_KEY = "sant-icons:recent-colors";
const RECENT_MAX = 8;

function loadRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === "string");
  } catch {}
  return [];
}

function saveRecents(list: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {}
}

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  /** Compact mode — shorter HSV picker, tighter spacing, no Presets label. */
  compact?: boolean;
}

export function ColorPicker({ value, onChange, disabled, compact = false }: ColorPickerProps) {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  // Persist any custom (non-preset) colour to recents whenever the user
  // settles on a value — debounced so we only commit when they stop dragging.
  useEffect(() => {
    if (!/^#[0-9a-fA-F]{6}$/.test(value)) return;
    const lower = value.toLowerCase();
    if (SWATCHES.some((s) => s.hex.toLowerCase() === lower)) return;
    const t = setTimeout(() => {
      setRecents((prev) => {
        if (prev[0]?.toLowerCase() === lower) return prev;
        const next = [lower, ...prev.filter((c) => c.toLowerCase() !== lower)].slice(0, RECENT_MAX);
        saveRecents(next);
        return next;
      });
    }, 600);
    return () => clearTimeout(t);
  }, [value]);

  const normalized = value.toLowerCase();

  const SECTION_LABEL = "text-[10px] font-medium tracking-[0.12em] uppercase text-text-faint";
  const SUB_LABEL = "text-[10px] font-medium tracking-[0.12em] uppercase text-text-faint mb-2";
  const pickerStyle: React.CSSProperties = compact ? { height: 110 } : { height: 168 };

  return (
    <div className={`space-y-3 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Section label */}
      <div className={SECTION_LABEL}>Colour</div>

      {/* HSV picker (gradient + hue slider, both built into react-colorful) */}
      <div style={pickerStyle}>
        <HexColorPicker color={value} onChange={onChange} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Live colour swatch + hex input — paint chip + code */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-md border border-border-default shrink-0"
          style={{ background: value }}
          aria-label={`Current colour ${value}`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#?[0-9a-fA-F]{0,6}$/.test(v)) {
              const normalized = v.startsWith("#") ? v : `#${v}`;
              if (/^#[0-9a-fA-F]{6}$/.test(normalized)) onChange(normalized);
              else onChange(v);
            }
          }}
          spellCheck={false}
          className="flex-1 bg-bg-base border border-border-default rounded-md px-3 py-2 font-mono text-[12.5px] text-text-primary"
        />
      </div>

      {/* Preset swatches — 16 colours, two rows. Top divider keeps it visually
          distinct from the picker above. */}
      <div className="pt-3 border-t border-border-subtle">
        <div className={SUB_LABEL}>Presets</div>
        <div className="grid grid-cols-8 gap-1.5">
          {SWATCHES.map((s) => {
            const active = normalized === s.hex.toLowerCase();
            return (
              <button
                key={s.hex}
                onClick={() => onChange(s.hex)}
                className={`h-7 rounded transition-transform hover:scale-110 ${active ? "ring-2 ring-accent ring-offset-2 ring-offset-bg-surface" : ""}`}
                style={{ background: s.hex }}
                title={s.label}
                type="button"
              />
            );
          })}
        </div>
      </div>

      {/* Recent — own block with divider above to match Presets, so the colour
          section reads as: picker / paint-chip / presets / recent. */}
      <div className="pt-3 border-t border-border-subtle">
        <div className={SUB_LABEL}>Recent</div>
        <div className="grid grid-cols-8 gap-1.5">
          {Array.from({ length: RECENT_MAX }).map((_, i) => {
            const hex = recents[i];
            if (!hex) {
              return (
                <div
                  key={`slot-${i}`}
                  className="h-7 rounded border border-dashed border-border-default opacity-40"
                  aria-hidden
                />
              );
            }
            const active = normalized === hex.toLowerCase();
            return (
              <button
                key={hex}
                type="button"
                onClick={() => onChange(hex)}
                className={`h-7 rounded transition-transform hover:scale-110 ${active ? "ring-2 ring-accent ring-offset-2 ring-offset-bg-surface" : ""}`}
                style={{ background: hex }}
                title={hex}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
