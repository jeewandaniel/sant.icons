"use client";

import type { IconRecord } from "@/lib/types";
import { memo, useSyncExternalStore } from "react";
import { getServerVersion, getSvg, getVersion, subscribe } from "@/lib/svg-cache";

interface IconCellProps {
  icon: IconRecord;
  selected: boolean;
  onClick: () => void;
}

function IconCellInner({ icon, selected, onClick }: IconCellProps) {
  useSyncExternalStore(subscribe, getVersion, getServerVersion);
  const svg = getSvg(icon.library, icon.name);

  return (
    <button
      onClick={onClick}
      className={`icon-cell group relative flex items-center justify-center bg-bg-base hover:bg-bg-hover transition-colors h-[100px] w-full text-text-primary ${
        selected ? "ring-1 ring-accent z-10 text-accent" : ""
      }`}
      title={`${icon.libraryLabel} · ${icon.name}`}
      aria-label={icon.name}
    >
      <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[10px] font-medium tracking-wide text-accent transition-opacity pointer-events-none">
        copy
      </span>
      {svg ? (
        <span
          className={`icon-svg ${icon.style} flex items-center justify-center pointer-events-none`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <span className="w-8 h-8 bg-bg-hover rounded pointer-events-none" />
      )}
      <span className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 text-center font-mono text-[10px] text-text-muted truncate transition-opacity pointer-events-none">
        {icon.name}
      </span>
    </button>
  );
}

export const IconCell = memo(IconCellInner);
