"use client";

interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}

export function Slider({ label, value, onChange, min, max, step = 1, unit = "", disabled }: SliderProps) {
  return (
    <div className={`space-y-2 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-text-muted">{label}</span>
        <span className="font-mono text-[12px] text-text-primary tabular-nums">
          {step < 1 ? value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "") : value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        className="sant-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      />
    </div>
  );
}
