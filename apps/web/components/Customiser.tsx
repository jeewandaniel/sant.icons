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
}

const SECTION = "text-[10px] font-medium tracking-[0.12em] uppercase text-text-faint";

export function Customiser({
  icon,
  size,
  setSize,
  strokeWidth,
  setStrokeWidth,
  color,
  setColor,
  onReset,
}: CustomiserProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className={SECTION}>Customise</div>
        <div className="flex items-center gap-3 text-[10px]">
          {!icon && <span className="text-text-faint">live preview</span>}
          <button
            type="button"
            onClick={onReset}
            className="text-text-faint hover:text-accent transition-colors"
          >
            reset
          </button>
        </div>
      </div>
      <div className="space-y-4">
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
      <div className="space-y-3">
        <div className={SECTION}>Colour</div>
        <ColorPicker value={color} onChange={setColor} />
      </div>
    </div>
  );
}
