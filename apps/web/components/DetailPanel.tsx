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

const FORMATS: { kind: Format; label: string; shortcut: string; defaultAction: "copy" | "download" }[] = [
  { kind: "svg", label: "SVG", shortcut: "1", defaultAction: "copy" },
  { kind: "jsx", label: "JSX", shortcut: "2", defaultAction: "copy" },
  { kind: "vue", label: "Vue", shortcut: "3", defaultAction: "copy" },
  { kind: "png", label: "PNG", shortcut: "4", defaultAction: "download" },
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
    <aside className="w-[300px] shrink-0 border-l border-border-subtle bg-bg-surface flex flex-col overflow-y-auto">
      {/* Preview */}
      <div className="px-6 pt-6 pb-5 border-b border-border-subtle">
        <div className="flex items-center justify-center h-[180px] bg-bg-base border border-border-subtle rounded-lg">
          {fullIcon ? (
            <div
              className={`icon-svg ${icon!.style}`}
              style={{
                color,
                ["--icon-svg-size" as string]: `${size}px`,
              }}
              dangerouslySetInnerHTML={{
                __html: customiseSvg(fullIcon, { size, color, strokeWidth }),
              }}
            />
          ) : icon ? (
            <span className="text-text-faint text-[12px]">loading…</span>
          ) : (
            <div className="text-center px-4">
              <div className="text-text-muted text-[13px] mb-1">No icon selected</div>
              <div className="text-text-faint text-[11px]">Click an icon to customise it.</div>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="text-[14px] font-medium text-text-primary">
            {icon?.name ?? "—"}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {icon ? `${icon.libraryLabel} · ${icon.style} · ${icon.license}` : "Pick an icon to begin"}
          </div>
          {icon && (
            <code className="block mt-2 text-[10.5px] font-mono text-text-faint truncate">
              {icon.id}
            </code>
          )}
        </div>
      </div>

      {/* Customiser — always rendered, gated by `icon` */}
      <div className="px-6 py-5 border-b border-border-subtle">
        <Customiser
          icon={icon}
          size={size}
          setSize={setSize}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          color={color}
          setColor={setColor}
          onReset={onReset}
        />
      </div>

      {/* Copy / download */}
      <div className="px-6 py-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className={SECTION}>Copy / Download</div>
          <div className="text-[10px] text-text-faint tracking-wide">click label · shift-click =⬇</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
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
      </div>

      <div className="mt-auto px-6 py-3 border-t border-border-subtle min-h-[36px] text-[11px] text-accent">
        {feedback ?? <span className="text-text-faint">&nbsp;</span>}
      </div>
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
