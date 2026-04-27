"use client";

interface StatusBarProps {
  total: number;
  visible: number;
  selectedName: string | null;
}

const KBD =
  "inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-bg-surface border border-border-default rounded text-[10.5px] font-mono text-text-secondary";

export function StatusBar({ total, visible, selectedName }: StatusBarProps) {
  return (
    <footer className="border-t border-border-subtle bg-bg-base px-7 py-3 flex items-center justify-between text-[12px] text-text-muted">
      <div className="flex items-center gap-2">
        <span className="font-mono text-text-secondary">sant.co.nz</span>
        <span className="text-text-faint">·</span>
        <span>free, forever</span>
      </div>
      <div className="flex items-center gap-5">
        <span>
          Showing <span className="text-text-primary tabular-nums">{visible.toLocaleString()}</span> /{" "}
          <span className="tabular-nums">{total.toLocaleString()}</span>
        </span>
        {selectedName && (
          <span className="text-text-secondary">
            <span className="text-text-faint">selected</span>{" "}
            <span className="font-mono text-accent">{selectedName}</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <kbd className={KBD}>/</kbd>
          <span>search</span>
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className={KBD}>↵</kbd>
          <span>copy</span>
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className={KBD}>esc</kbd>
          <span>clear</span>
        </span>
      </div>
    </footer>
  );
}
