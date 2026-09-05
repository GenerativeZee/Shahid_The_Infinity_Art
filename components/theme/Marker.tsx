import type { Ref } from "react";

/**
 * The site's one pointing-at-something visual — a small accent dot plus a
 * labelled leader. First built for the Work section's "Why This Works" →
 * The Detail stage; reused as-is by Shahid's Eye rather than duplicated,
 * so the site keeps exactly one visual vocabulary for "notice this," not
 * two similar-but-different ones. Positioned by percentage within
 * whatever `relative` container it's placed in.
 *
 * Two modes, same visual: decorative (the default — a `pointer-events-none`
 * dot that just appears, used inside the dialog and Shahid's Eye stage),
 * and interactive (`interactive` + `onActivate` — a real focusable button
 * that toggles a disclosure, used by the Detail Index in the Work grid).
 * The Detail Index reuses this rather than inventing a second marker style.
 */
const DOT_CLASS =
  "absolute block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-ground";
const LABEL_CLASS =
  "absolute left-3 top-0 -translate-y-1/2 whitespace-nowrap rounded border border-accent/60 bg-ground/90 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-label text-accent";

export function Marker({
  xPercent,
  yPercent,
  label,
  animate = true,
  interactive = false,
  expanded,
  controls,
  accessibleName,
  onActivate,
  ref,
}: {
  xPercent: number;
  yPercent: number;
  label: string;
  animate?: boolean;
  /** Turns the marker into a real <button> that toggles a disclosure. */
  interactive?: boolean;
  /** Interactive only — reflected as aria-expanded. */
  expanded?: boolean;
  /** Interactive only — id of the panel this marker controls. */
  controls?: string;
  /** Interactive only — the button's accessible name. */
  accessibleName?: string;
  /** Interactive only — fired on click. */
  onActivate?: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  const enterStyle = animate ? { animation: "look-again-detail 400ms ease both" } : undefined;

  if (interactive) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onActivate}
        aria-expanded={expanded}
        aria-controls={controls}
        aria-label={accessibleName}
        // -m-4 p-4 is an invisible ~42px hit-area around the 10px dot —
        // a comfortable phone tap target without enlarging the visual. The
        // negative margin only overhangs the project image, never a
        // neighbouring control (one marker per card, mid-image).
        className="group absolute -m-4 p-4"
        style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
      >
        <span
          aria-hidden="true"
          className={`${DOT_CLASS} transition-transform duration-200 motion-reduce:transition-none ${
            expanded
              ? "scale-150 bg-accent"
              : "group-hover:scale-150 group-focus-visible:scale-150"
          }`}
        />
        <span aria-hidden="true" className={LABEL_CLASS}>
          {label}
        </span>
      </button>
    );
  }

  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
    >
      <span style={enterStyle} className={DOT_CLASS} />
      <span style={enterStyle} className={LABEL_CLASS}>
        {label}
      </span>
    </div>
  );
}
