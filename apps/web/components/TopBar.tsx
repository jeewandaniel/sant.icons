"use client";

import { forwardRef } from "react";

interface TopBarProps {
  total: number;
  libraryCount: number;
  searchValue: string;
  onSearchChange: (v: string) => void;
}

export const TopBar = forwardRef<HTMLInputElement, TopBarProps>(function TopBar(
  { total, libraryCount, searchValue, onSearchChange },
  searchRef,
) {
  return (
    <header className="flex items-center gap-5 border-b border-border-subtle px-7 py-3">
      {/* Logo */}
      <div className="font-mono font-bold text-[15px] tracking-tight shrink-0">
        <span className="text-accent">sant</span>
        <span className="text-text-muted">.icons</span>
      </div>

      {/* Search */}
      <div className="flex-1 flex items-center gap-2.5 bg-bg-surface border border-border-default focus-within:border-text-faint hover:border-text-faint rounded-md px-3 py-1.5 transition-colors min-w-0">
        <SearchGlyph />
        <input
          ref={searchRef}
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search ${total.toLocaleString()} icons across ${libraryCount} libraries…`}
          className="flex-1 bg-transparent border-0 text-[13.5px] placeholder:text-text-muted text-text-primary min-w-0"
          style={{ caretColor: "var(--color-accent)" }}
          autoFocus
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        <kbd className="hidden sm:inline-block bg-bg-base border border-border-default text-text-muted text-[10.5px] px-1.5 py-0.5 rounded">
          /
        </kbd>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-1 text-[13px] text-text-secondary shrink-0">
        <a className="px-2.5 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-hover transition-colors" href="/docs">
          Docs
        </a>
        <a
          className="px-2.5 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-hover transition-colors"
          href="https://www.npmjs.com/package/@sant/icons-cli"
          target="_blank"
          rel="noreferrer"
        >
          CLI
        </a>
        <a
          className="px-2.5 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-hover transition-colors"
          href="https://github.com/sant-co-nz/sant-icons"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <a
          className="ml-1 px-2.5 py-1.5 rounded-md text-accent border border-border-accent bg-bg-accent hover:bg-bg-hover transition-colors text-[12px] font-medium tracking-wide"
          href="https://www.npmjs.com/package/@sant/icons-mcp"
          target="_blank"
          rel="noreferrer"
        >
          MCP
        </a>
      </nav>
    </header>
  );
});

function SearchGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-muted shrink-0"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
