"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { IconGrid } from "@/components/IconGrid";
import { DetailPanel, type Format } from "@/components/DetailPanel";
import { StatusBar } from "@/components/StatusBar";
import { loadManifest, summariseStyles } from "@/lib/icons";
import { search, type Filters } from "@/lib/search";
import { copyText, customiseSvg, downloadBlob, svgToPngBlob, toReact, toVue } from "@/lib/export";
import { getSvg, loadAllLibraries, loadLibrary } from "@/lib/svg-cache";
import type { IconRecord, LibrarySummary } from "@/lib/types";

interface ManifestState {
  icons: IconRecord[];
  libraries: LibrarySummary[];
  styles: { name: string; count: number }[];
}

export default function HomePage() {
  const [manifest, setManifest] = useState<ManifestState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [selected, setSelected] = useState<IconRecord | null>(null);
  // Two parallel sets of customiser values:
  //   `g*` — global, drives the whole grid via CSS vars (used when nothing is selected)
  //   `l*` — local, drives the detail-panel preview + exports for the selected icon
  // Snapshot global → local at the moment of selection so the panel starts coherent.
  const [gSize, setGSize] = useState(24);
  const [gColor, setGColor] = useState("#a2a2a2");
  const [gStroke, setGStroke] = useState(1);
  const [lSize, setLSize] = useState(24);
  const [lColor, setLColor] = useState("#a2a2a2");
  const [lStroke, setLStroke] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Effective values shown by the customiser + used by the detail-panel preview/exports.
  const eSize = selected ? lSize : gSize;
  const eColor = selected ? lColor : gColor;
  const eStroke = selected ? lStroke : gStroke;
  const setEffSize = (n: number) => (selected ? setLSize(n) : setGSize(n));
  const setEffColor = (h: string) => (selected ? setLColor(h) : setGColor(h));
  const setEffStroke = (n: number) => (selected ? setLStroke(n) : setGStroke(n));

  const handleReset = () => {
    if (selected) {
      setLSize(24);
      setLColor("#a2a2a2");
      setLStroke(1);
    } else {
      setGSize(24);
      setGColor("#a2a2a2");
      setGStroke(1);
    }
  };
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadManifest()
      .then((m) => {
        setManifest({
          icons: m.icons,
          libraries: m.libraries,
          styles: summariseStyles(m.icons),
        });
        loadAllLibraries(m.libraries.map((l) => l.slug));

        // Honour ?focus=<icon-id> so detail pages can deep-link back into the
        // live editor with the right icon already selected.
        if (typeof window !== "undefined") {
          const focusId = new URLSearchParams(window.location.search).get("focus");
          if (focusId) {
            const target = m.icons.find((i) => i.id === focusId);
            if (target) {
              setSelected(target);
              // Pre-load just that library so the preview renders without delay.
              void loadLibrary(target.library);
              // Clean the URL so reloads don't keep snapping back.
              window.history.replaceState({}, "", "/");
            }
          }
        }
      })
      .catch((e) => setError(e.message ?? "Failed to load icons"));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 100);
    return () => clearTimeout(t);
  }, [query]);

  // Globals always drive CSS vars (and so the grid).
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--icon-color", gColor);
    root.setProperty("--icon-stroke", String(gStroke));
    // Cap grid icon at ~80px so it doesn't punch through cell padding.
    root.setProperty("--icon-svg-size", `${Math.min(gSize, 80)}px`);
  }, [gColor, gStroke, gSize]);

  // Snapshot globals → locals whenever the user picks a new icon.
  useEffect(() => {
    if (!selected) return;
    setLSize(gSize);
    setLColor(gColor);
    setLStroke(gStroke);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: snapshot only on identity change
  }, [selected?.id]);

  const flash = useCallback((msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1400);
  }, []);

  const handleAction = useCallback(
    async (kind: Format, action: "copy" | "download", iconArg?: IconRecord | null) => {
      const target = iconArg ?? selected;
      if (!target) return;
      const svg = getSvg(target.library, target.name);
      if (!svg) {
        void loadLibrary(target.library);
        return;
      }
      // Use whichever set is "in scope" — local if an icon is selected,
      // global if the click came directly from a grid cell.
      const useLocal = !!selected && (!iconArg || iconArg.id === selected.id);
      const cSize = useLocal ? lSize : gSize;
      const cColor = useLocal ? lColor : gColor;
      const cStroke = useLocal ? lStroke : gStroke;
      const fullIcon = { ...target, svg };
      const finalSvg = customiseSvg(fullIcon, { size: cSize, color: cColor, strokeWidth: cStroke });

      if (action === "download") {
        if (kind === "png") {
          const blob = await svgToPngBlob(finalSvg, 256);
          downloadBlob(blob, `${target.id}.png`);
        } else if (kind === "svg") {
          downloadBlob(new Blob([finalSvg], { type: "image/svg+xml" }), `${target.id}.svg`);
        } else if (kind === "jsx") {
          const text = toReact(fullIcon, { size: cSize, color: cColor, strokeWidth: cStroke });
          downloadBlob(new Blob([text], { type: "text/plain" }), `${target.id}.tsx`);
        } else if (kind === "vue") {
          const text = toVue(fullIcon, { size: cSize, color: cColor, strokeWidth: cStroke });
          downloadBlob(new Blob([text], { type: "text/plain" }), `${target.id}.vue`);
        }
        flash(`${kind.toUpperCase()} downloaded`);
        return;
      }

      // copy
      if (kind === "png") {
        const blob = await svgToPngBlob(finalSvg, 256);
        downloadBlob(blob, `${target.id}.png`);
        flash("PNG downloaded");
        return;
      }
      let text = "";
      if (kind === "svg") text = finalSvg;
      else if (kind === "jsx") text = toReact(fullIcon, { size: cSize, color: cColor, strokeWidth: cStroke });
      else if (kind === "vue") text = toVue(fullIcon, { size: cSize, color: cColor, strokeWidth: cStroke });
      await copyText(text);
      flash(`${kind.toUpperCase()} copied`);
    },
    [selected, lSize, lColor, lStroke, gSize, gColor, gStroke, flash],
  );

  // Keyboard shortcuts
  useEffect(() => {
    function isTypingTarget(el: Element | null): boolean {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return true;
      if ((el as HTMLElement).isContentEditable) return true;
      return false;
    }

    function onKey(e: KeyboardEvent) {
      const typing = isTypingTarget(document.activeElement);

      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Escape") {
        if (document.activeElement === searchRef.current) {
          setQuery("");
          searchRef.current?.blur();
        } else {
          setSelected(null);
        }
        return;
      }

      // Format shortcuts: only when an icon is selected
      if (!selected) return;

      // Enter copies SVG (works in search input too)
      if (e.key === "Enter" && document.activeElement === searchRef.current) {
        e.preventDefault();
        void handleAction("svg", "copy");
        return;
      }

      // 1/2/3/4 — only when not typing
      if (!typing) {
        if (e.key === "1") { e.preventDefault(); void handleAction("svg", "copy"); }
        else if (e.key === "2") { e.preventDefault(); void handleAction("jsx", "copy"); }
        else if (e.key === "3") { e.preventDefault(); void handleAction("vue", "copy"); }
        else if (e.key === "4") { e.preventDefault(); void handleAction("png", "download"); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, handleAction]);

  const results = useMemo(() => {
    if (!manifest) return [] as IconRecord[];
    return search(manifest.icons, debouncedQuery, filters);
  }, [manifest, debouncedQuery, filters]);

  // First-result auto-select for keyboard flow
  useEffect(() => {
    if (debouncedQuery.trim() && results.length > 0 && !selected) {
      setSelected(results[0]);
    }
  }, [debouncedQuery, results, selected]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-text-muted text-[13px]">
        <div className="text-center">
          <div className="text-accent mb-2">Manifest failed to load</div>
          <div className="text-text-faint">{error}</div>
        </div>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="h-screen flex items-center justify-center text-text-muted text-[13px]">
        <div className="text-text-faint">Loading icons…</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-base">
      <TopBar
        ref={searchRef}
        total={manifest.icons.length}
        libraryCount={manifest.libraries.length}
        searchValue={query}
        onSearchChange={setQuery}
      />
      <div className="flex-1 flex min-h-0">
        <Sidebar
          libraries={manifest.libraries}
          styles={manifest.styles}
          filters={filters}
          onFilters={setFilters}
        />
        <main className="flex-1 flex min-h-0">
          <IconGrid
            icons={results}
            selectedId={selected?.id ?? null}
            onSelect={(icon) => {
              // Click again on the already-selected icon → deselect.
              setSelected((prev) => {
                if (prev?.id === icon.id) return null;
                void handleAction("svg", "copy", icon);
                return icon;
              });
            }}
          />
          <DetailPanel
            icon={selected}
            size={eSize}
            setSize={setEffSize}
            color={eColor}
            setColor={setEffColor}
            strokeWidth={eStroke}
            setStrokeWidth={setEffStroke}
            onReset={handleReset}
            feedback={feedback}
            onAction={handleAction}
          />
        </main>
      </div>
      <StatusBar
        total={manifest.icons.length}
        visible={results.length}
        selectedName={selected?.name ?? null}
      />
    </div>
  );
}
