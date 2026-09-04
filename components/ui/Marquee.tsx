/** Pure CSS, no JS (§10.2) — animation lives in app/globals.css, gated by prefers-reduced-motion. */
export function Marquee({ items }: { items: string[] }) {
  return (
    <div className="overflow-hidden border-b border-border py-6">
      <div className="marquee-track flex w-max gap-8 whitespace-nowrap font-mono text-step-0 uppercase tracking-label text-text-muted">
        {[...items, ...items].map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
    </div>
  );
}
