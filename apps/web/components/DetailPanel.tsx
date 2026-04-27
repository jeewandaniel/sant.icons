"use client";

import { useSyncExternalStore } from "react";
import type { IconRecord } from "@/lib/types";
import { customiseSvg } from "@/lib/export";
import { getServerVersion, getSvg, getVersion, loadLibrary, subscribe } from "@/lib/svg-cache";
import { Customiser } from "./Customiser";

export type Format = "svg" | "jsx" | "vue" | "png";

interface DetailPanelProps {
  icon: IconRecord | null;
  size: number;
  setSize: (n: number) => void;
  color: string;
  setColor: (hex: string) => void;
  strokeWidth: number;
  setStrokeWidth: (n: number) => void;
  onReset: () => void;
  feedback: string | null;
  onAction: (kind: Format, action: "copy" | "download") => void | Promise<void>;
}

function withSvg(icon: IconRecord, svg: string): IconRecord {
  return { ...icon, svg };
}

const SECTION = "text-[10px] font-medium tracking-[0.12em] uppercase text-text-faint";

const FORMATS: { kind: Format; label: string; defaultAction: "copy" | "download" }[] = [
  { kind: "svg", label: "SVG", defaultAction: "copy" },
  { kind: "jsx", label: "JSX", defaultAction: "copy" },
  { kind: "vue", label: "Vue", defaultAction: "copy" },
  { kind: "png", label: "PNG", defaultAction: "download" },
];

export function DetailPanel({
  icon,
  size,
  setSize,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  onReset,
  feedback,
  onAction,
}: DetailPanelProps) {
  useSyncExternalStore(subscribe, getVersion, getServerVersion);

  const cachedSvg = icon ? getSvg(icon.library, icon.name) : null;
  if (icon && !cachedSvg) {
    void loadLibrary(icon.library);
  }
  const fullIcon = icon && cachedSvg ? withSvg(icon, cachedSvg) : null;

  return (
    <aside className="w-[300px] shrink-0 border-l border-border-subtle bg-bg-surface flex flex-col h-full overflow-y-auto">
      {/* Sections stack naturally — chips sit flush below the customiser
          rather than pinned to the panel bottom. On tight viewports the
          whole panel scrolls. */}
      {/* Preview — only when an icon is selected. */}
      {icon && (
          <div className="px-6 pt-6 pb-4 border-b border-border-subtle">
            <div className="flex items-center justify-center h-[140px] bg-bg-base border border-border-subtle rounded-lg">
              {fullIcon ? (
                <div
                  className={`icon-svg ${icon.style}`}
                  style={{
                    color,
                    ["--icon-svg-size" as string]: `${size}px`,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: customiseSvg(fullIcon, { size, color, strokeWidth }),
                  }}
                />
              ) : (
                <span className="text-text-faint text-[12px]">loading…</span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-[13px] font-medium text-text-primary truncate">
                {icon.name}
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                {icon.libraryLabel} · {icon.style} · {icon.license}
              </div>
            </div>
          </div>
        )}

        {/* Empty-state hint at top */}
        {!icon && (
          <div className="px-6 pt-6 pb-2">
            <div className="text-[13px] text-text-muted">No icon selected</div>
            <div className="text-[11px] text-text-faint mt-1 leading-relaxed">
              Adjust here to set the global preview. Click any icon in the grid to copy it
              and customise it locally.
            </div>
          </div>
        )}

      <div className="px-6 py-5">
        <Customiser
          icon={icon}
          size={size}
          setSize={setSize}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          color={color}
          setColor={setColor}
          onReset={onReset}
          compact
        />
      </div>

      {/* Action bar — only when something is selected. Sits flush below
          the customiser. */}
      {icon && (
        <div className="border-t border-border-subtle bg-bg-surface">
          <div className="px-6 pt-4 pb-3 grid grid-cols-2 gap-2">
            {FORMATS.map((f) => (
              <FormatChip
                key={f.kind}
                label={f.label}
                disabled={!fullIcon}
                defaultAction={f.defaultAction}
                onCopy={() => onAction(f.kind, "copy")}
                onDownload={() => onAction(f.kind, "download")}
              />
            ))}
          </div>
          <div className="px-6 pb-3 min-h-[20px] text-[11px] text-accent">
            {feedback ?? <span className="text-text-faint">&nbsp;</span>}
          </div>
        </div>
      )}
    </aside>
  );
}

function FormatChip({
  label,
  disabled,
  defaultAction,
  onCopy,
  onDownload,
}: {
  label: string;
  disabled: boolean;
  defaultAction: "copy" | "download";
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <div
      className={`group flex items-stretch border border-border-default rounded-md overflow-hidden ${
        disabled ? "opacity-40 pointer-events-none" : "hover:border-text-muted"
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          if (e.shiftKey) onDownload();
          else if (defaultAction === "copy") onCopy();
          else onDownload();
        }}
        className="flex-1 px-3 py-2 text-[12px] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
      >
        {label}
      </button>
      <button
        type="button"
        onClick={onDownload}
        title={`Download .${label.toLowerCase()}`}
        className="px-2.5 py-2 border-l border-border-default text-text-faint hover:text-accent hover:bg-bg-hover transition-colors"
        aria-label={`Download ${label}`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12" />
          <path d="m6 9 6 6 6-6" />
          <path d="M3 21h18" />
        </svg>
      </button>
    </div>
  );
}
