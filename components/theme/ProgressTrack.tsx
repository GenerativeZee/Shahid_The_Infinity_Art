import type { ReactNode } from "react";

type ProgressTrackSize = "sm" | "lg";

const DOT_CLASS: Record<ProgressTrackSize, string> = {
  sm: "h-5 w-5",
  lg: "h-10 w-10 font-mono text-step--1 tabular-nums",
};

const INSET: Record<ProgressTrackSize, string> = {
  sm: "0.625rem", // half of h-5/w-5 (1.25rem)
  lg: "1.25rem", // half of h-10/w-10 (2.5rem)
};

/**
 * The site's one line-behind-numbered-dots progression pattern (∞
 * iteration — see DECISIONS.md). Extracted after Process.tsx and
 * LookAgainReveal's "Why This Works" stepper turned out to have
 * implemented near-identical versions of this independently — the
 * abstraction earns its place by removing that duplication, not because
 * a shared name sounded tidy. Purely presentational plus a click
 * handler; callers own their own step state and content.
 */
export function ProgressTrack({
  count,
  activeIndex,
  onSelect,
  ariaLabel,
  size = "lg",
  dotContent,
  dotAriaLabel,
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  ariaLabel: string;
  size?: ProgressTrackSize;
  dotContent?: (index: number) => ReactNode;
  dotAriaLabel?: (index: number) => string;
}) {
  const inset = INSET[size];

  return (
    <div role="group" aria-label={ariaLabel} className="relative flex gap-2">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 h-px -translate-y-1/2 bg-border"
        style={{ left: inset, right: inset }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 h-px -translate-y-1/2 bg-accent transition-[width] duration-500"
        style={{ left: inset, width: `calc((100% - ${inset} * 2) * ${activeIndex / (count - 1)})` }}
      />
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-current={i === activeIndex ? "step" : undefined}
          aria-label={dotAriaLabel?.(i)}
          onClick={() => onSelect(i)}
          className={`relative z-10 flex items-center justify-center rounded-full border transition-colors duration-200 ${
            DOT_CLASS[size]
          } ${
            i === activeIndex
              ? "border-accent bg-accent text-ground"
              : "border-border bg-surface text-text-muted hover:border-text-muted hover:text-text"
          }`}
        >
          {dotContent?.(i)}
        </button>
      ))}
    </div>
  );
}
