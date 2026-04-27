"use client";

import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";

const SWATCHES = [
  { hex: "#fafafa", label: "white" },
  { hex: "#c8f07a", label: "lime" },
  { hex: "#ef4444", label: "red" },
  { hex: "#f59e0b", label: "amber" },
  { hex: "#10b981", label: "green" },
  { hex: "#06b6d4", label: "cyan" },
  { hex: "#3b82f6", label: "blue" },
  { hex: "#a855f7", label: "violet" },
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
  const spacing = compact ? "space-y-2.5" : "space-y-3";
  const pickerStyle: React.CSSProperties = compact ? { height: 110 } : { height: 168 };

  return (
    <div className={`${spacing} ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Header row: section label + inline hex input */}
      <div className="flex items-center justify-between gap-2">
        <span className={SECTION_LABEL}>Colour</span>
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
          className="bg-bg-base border border-border-default rounded px-2 py-0.5 font-mono text-[11px] text-text-primary w-[88px] text-center"
        />
      </div>

      {/* HSV picker — compact height when in tight panel */}
      <div style={pickerStyle}>
        <HexColorPicker color={value} onChange={onChange} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Preset swatches — taller chips so they're easy to hit */}
      <div>
        <div className="text-[9px] tracking-[0.14em] uppercase text-text-faint mb-1.5">Presets</div>
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

      {/* Recent — always visible. Empty slots make the row obvious so users
          notice they have a colour history available. */}
      <div>
        <div className="text-[9px] tracking-[0.14em] uppercase text-text-faint mb-1.5">Recent</div>
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
