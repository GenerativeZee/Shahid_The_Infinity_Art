/**
 * The site's one pointing-at-something visual — a small accent dot plus a
 * labelled leader. First built for the Work section's "Why This Works" →
 * The Detail stage; reused as-is by Shahid's Eye rather than duplicated,
 * so the site keeps exactly one visual vocabulary for "notice this," not
 * two similar-but-different ones. Positioned by percentage within
 * whatever `relative` container it's placed in.
 */
export function Marker({
  xPercent,
  yPercent,
  label,
  animate = true,
}: {
  xPercent: number;
  yPercent: number;
  label: string;
  animate?: boolean;
}) {
  const enterStyle = animate ? { animation: "look-again-detail 400ms ease both" } : undefined;

  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
    >
      <span
        style={enterStyle}
        className="absolute block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-ground"
      />
      <span
        style={enterStyle}
        className="absolute left-3 top-0 -translate-y-1/2 whitespace-nowrap rounded border border-accent/60 bg-ground/90 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-label text-accent"
      >
        {label}
      </span>
    </div>
  );
}
