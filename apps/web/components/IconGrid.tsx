"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import type { IconRecord } from "@/lib/types";
import { IconCell } from "./IconCell";

interface IconGridProps {
  icons: IconRecord[];
  selectedId: string | null;
  onSelect: (icon: IconRecord) => void;
}

const CELL_SIZE = 100;

export function IconGrid({ icons, selectedId, onSelect }: IconGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!parentRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    ro.observe(parentRef.current);
    return () => ro.disconnect();
  }, []);

  const cols = Math.max(1, Math.floor(width / CELL_SIZE));
  const rows = Math.ceil(icons.length / cols);

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CELL_SIZE,
    overscan: 4,
  });

  const items = rowVirtualizer.getVirtualItems();

  const visibleRows = useMemo(() => {
    return items.map((row) => {
      const start = row.index * cols;
      const slice = icons.slice(start, start + cols);
      return { key: row.key, index: row.index, top: row.start, slice };
    });
  }, [items, icons, cols]);

  return (
    <div ref={parentRef} className="flex-1 overflow-auto bg-border-subtle">
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          position: "relative",
          width: "100%",
        }}
      >
        {visibleRows.map((row) => (
          <div
            key={row.key}
            style={{
              position: "absolute",
              top: row.top,
              left: 0,
              right: 0,
              height: CELL_SIZE,
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: "1px",
            }}
          >
            {row.slice.map((icon) => (
              <IconCell
                key={icon.id}
                icon={icon}
                selected={icon.id === selectedId}
                onClick={() => onSelect(icon)}
              />
            ))}
            {row.slice.length < cols
              ? Array.from({ length: cols - row.slice.length }).map((_, i) => (
                  <div key={`pad-${i}`} className="bg-bg-base" />
                ))
              : null}
          </div>
        ))}
      </div>
    </div>
  );
}
