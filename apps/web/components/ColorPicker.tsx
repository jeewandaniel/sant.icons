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
const RECENT_MAX = 6;

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
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
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

  return (
    <div className={`space-y-3 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Always-visible HSV picker */}
      <HexColorPicker color={value} onChange={onChange} />

      {/* Hex input + swatch */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-md border border-border-default shrink-0"
          style={{ background: value }}
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
          className="flex-1 bg-bg-base border border-border-default rounded-md px-2 py-1.5 font-mono text-[12px] text-text-primary"
        />
      </div>

      {/* Preset swatches */}
      <div>
        <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-faint mb-2">
          Presets
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {SWATCHES.map((s) => {
            const active = normalized === s.hex.toLowerCase();
            return (
              <button
                key={s.hex}
                onClick={() => onChange(s.hex)}
                className={`aspect-square rounded-md transition-transform hover:scale-110 ${active ? "ring-2 ring-accent ring-offset-2 ring-offset-bg-surface" : ""}`}
                style={{ background: s.hex }}
                title={s.label}
                type="button"
              />
            );
          })}
        </div>
      </div>

      {/* Recents */}
      {recents.length > 0 && (
        <div>
          <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-faint mb-2">
            Recent
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {recents.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => onChange(hex)}
                className="w-6 h-6 rounded transition-transform hover:scale-110"
                style={{ background: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
