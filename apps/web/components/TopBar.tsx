"use client";

import { forwardRef } from "react";
import { ThemeToggle } from "./ThemeToggle";

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
      {/* Logo — mark + wordmark, mark inherits currentColor from .text-text-primary */}
      <a href="/" className="flex items-center gap-2 shrink-0 font-mono font-bold text-[15px] tracking-tight">
        <SantMark />
        <span>
          <span className="text-accent">sant</span>
          <span className="text-text-muted">.icons</span>
        </span>
      </a>

      {/* Search — capped width so it doesn't eat the whole row, and the
          row keeps its centre of gravity around the logo + nav. */}
      <div className="flex-1 flex justify-center min-w-0">
        <div className="flex w-full max-w-[420px] items-center gap-2.5 bg-bg-surface focus-within:bg-bg-hover hover:bg-bg-hover rounded-md px-3 py-1.5 transition-colors min-w-0">
          <SearchGlyph />
          <input
            ref={searchRef}
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${total.toLocaleString()} icons…`}
            className="flex-1 bg-transparent border-0 text-[13.5px] placeholder:text-text-muted text-text-primary min-w-0"
            style={{ caretColor: "var(--color-accent)" }}
            autoFocus
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
          <kbd className="hidden sm:inline-block border border-border-subtle text-text-faint text-[10.5px] px-1.5 py-0.5 rounded font-mono leading-none">
            /
          </kbd>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-1 text-[13px] text-text-secondary shrink-0">
        <ThemeToggle />
        <a className="px-2.5 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-hover transition-colors" href="/docs">
          Docs
        </a>
        <a
          className="px-2.5 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-hover transition-colors"
          href="https://www.npmjs.com/package/@santicons/cli"
          target="_blank"
          rel="noreferrer"
        >
          CLI
        </a>
        <a
          className="px-2.5 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-hover transition-colors"
          href="https://github.com/jeewandaniel/sant.icons"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <a
          className="ml-1 px-2.5 py-1.5 rounded-md text-accent border border-border-accent bg-bg-accent hover:bg-bg-hover transition-colors text-[12px] font-medium tracking-wide"
          href="https://www.npmjs.com/package/@santicons/mcp"
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

function SantMark() {
  // Tighter viewBox crops the empty padding around the glyph so it actually
  // fills its display box. Aspect ~14:18 — taller than wide.
  // Fill tracks --icon-color from page.tsx so the mark recolours alongside
  // the icon grid whenever the customiser changes the global colour.
  // Falls back to text-primary if the var hasn't been set yet.
  return (
    <svg
      width="20"
      height="26"
      viewBox="296 232 432 560"
      className="-my-1 shrink-0 transition-colors"
      style={{ fill: "var(--icon-color, var(--color-text-primary))" }}
      aria-hidden
    >
      <path d="M384.272 526.708C389.928 525.78 410.65 526.809 417.781 526.583C429.017 526.554 440.652 526.97 451.842 526.869C488.228 526.541 519.469 522.514 546.961 551.305C574.405 580.045 570.954 608.207 570.999 644.849C571.018 661.092 571.072 677.195 571.01 693.428C571.865 736.289 542.794 774.547 500.209 782.555C487.47 784.92 475.655 784.377 462.727 784.348L420.231 784.217C381.549 784.081 341.96 784.636 303.447 784.159L303.363 763.625L303.348 752.78C303.4 725.862 308.37 708.916 327.526 689.099C353.301 662.436 391.03 667.228 424.619 667.489L476.97 667.599L476.926 640.087C460.813 639.48 445.526 639.748 429.46 639.9C402.853 640.151 375.879 637.437 349.857 644.885C334.72 649.218 321.09 656.273 309.999 667.607C307.612 670.052 305.067 672.479 303.399 675.484C303.47 660.634 303.43 645.783 303.279 630.934C303.105 599.864 301.812 577.311 324.828 552.349C341.63 534.126 360.003 527.661 384.272 526.708Z" />
      <path d="M674.297 383.701C677.901 383.355 685.001 383.519 688.771 383.523C699.642 383.615 710.513 383.763 721.384 383.968C720.425 392.867 721.043 415.679 721.049 425.856L721.052 509.07L721.091 784.02C698.102 784.111 672.564 786.824 650.122 780.574C618.577 768.944 598.944 740.981 598.114 707.159C597.714 690.847 597.975 674.422 597.977 658.095L598.124 556.585L597.993 490.27C597.974 478.844 597.442 457.426 599.474 446.377C602.075 432.562 608.536 419.767 618.109 409.474C633.151 393.195 652.273 384.671 674.297 383.701Z" />
      <path d="M381.213 383.708C391.012 382.897 407.782 383.63 418.094 383.526C438.685 383.318 459.686 383.584 480.325 383.484C507.034 383.324 527.937 389.488 547.126 408.789C571.715 433.52 570.69 461.887 570.89 494.168C570.925 509.451 570.821 524.734 570.576 540.015C566.507 535.491 563.432 531.596 558.946 527.182C541.005 509.53 521.452 501.281 496.54 499.098C477.599 498.033 457.178 498.764 438.065 498.977C382.368 499.597 343.242 490.546 303.485 537.393C303.631 523.584 303.558 509.774 303.265 495.968C302.68 464.92 301.644 436.788 323.631 411.898C340.118 393.234 356.726 385.561 381.213 383.708Z" />
      <path d="M392.762 239.747L464.634 239.569C506.237 239.47 537.184 247.164 559.543 285.221C572.343 307.009 571.075 326.909 571.027 351L570.894 397.637C568.646 395.447 565.362 391.171 563.073 388.67C541.215 364.787 519.804 357.728 488.625 356.03C471.874 355.581 453.853 356.091 436.979 356.006C417.447 355.908 397.281 355.651 377.841 356.599C343.682 358.263 325.602 370.356 303.505 394.836C303.151 369.763 300.731 321.338 307.875 299.19C311.591 287.669 318.933 276.42 327.046 267.511C344.637 248.193 367.294 241.036 392.762 239.747Z" />
      <path d="M672.377 239.728C673.89 239.359 682.653 239.445 684.782 239.422C696.971 239.292 709.152 239.776 721.336 239.922C719.009 262.354 724.932 289.101 718.082 311.409C715.327 320.28 710.788 328.494 704.744 335.548C682.045 361.974 656.203 352.133 626.258 368.064C615.137 373.418 606.116 383.17 598.021 392.21C598.743 374.219 597.738 355.601 598.019 337.531C598.249 322.703 597.26 309.428 601.117 294.745C603.827 284.459 608.81 274.912 615.699 266.808C631.433 248.083 648.797 241.743 672.377 239.728Z" />
    </svg>
  );
}
