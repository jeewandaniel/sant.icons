"use client";

import type { IconRecord } from "@/lib/types";
import { ColorPicker } from "./ColorPicker";
import { Slider } from "./Slider";

interface CustomiserProps {
  icon: IconRecord | null;
  size: number;
  setSize: (n: number) => void;
  strokeWidth: number;
  setStrokeWidth: (n: number) => void;
  color: string;
  setColor: (hex: string) => void;
  onReset: () => void;
  /** Compact mode — tighter spacing, side-by-side sliders, smaller HSV. */
  compact?: boolean;
}

const SECTION = "text-[10px] font-medium tracking-[0.12em] uppercase text-text-secondary";

export function Customiser({
  icon,
  size,
  setSize,
  strokeWidth,
  setStrokeWidth,
  color,
  setColor,
  onReset,
  compact = false,
}: CustomiserProps) {
  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <div className="flex items-center justify-between">
        <div className={SECTION}>Customise</div>
        <div className="flex items-center gap-3 text-[10px]">
          {!icon && <span className="text-text-muted">live preview</span>}
          <button
            type="button"
            onClick={onReset}
            className="text-text-muted hover:text-accent transition-colors"
          >
            reset
          </button>
        </div>
      </div>
      {/* Side-by-side sliders save ~40px vertical */}
      <div className="grid grid-cols-2 gap-3">
        <Slider label="size" value={size} onChange={setSize} min={12} max={96} step={1} unit="px" />
        <Slider
          label="stroke"
          value={strokeWidth}
          onChange={setStrokeWidth}
          min={0.5}
          max={3}
          step={0.25}
        />
      </div>
      <ColorPicker value={color} onChange={setColor} compact={compact} />
    </div>
  );
}
