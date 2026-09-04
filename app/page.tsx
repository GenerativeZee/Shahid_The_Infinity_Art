import { Work } from "@/components/sections/Work";
import { business, hero, materials, trust } from "@/content/site";

export default function Home() {
  return (
    <main id="main" className="flex flex-col">
      <section className="flex flex-col gap-6 px-6 py-section md:px-12">
        <p className="font-mono text-step--1 uppercase tracking-label text-accent">
          {hero.eyebrow} — M0 scaffold check
        </p>
        <h1 className="text-step-5 text-text">{hero.headline}</h1>
        <p className="measure text-step-1 text-text-muted">{hero.subhead}</p>
        <div className="flex flex-wrap gap-4 pt-2">
          <a
            href={hero.primaryCta.href}
            className="rounded bg-accent px-5 py-3 font-mono text-step--1 uppercase tracking-label text-ground"
          >
            {hero.primaryCta.label}
          </a>
          <a
            href={hero.secondaryCta.href}
            className="rounded border border-border px-5 py-3 font-mono text-step--1 uppercase tracking-label text-text"
          >
            {hero.secondaryCta.label}
          </a>
        </div>
      </section>

      <section className="flex flex-wrap gap-x-8 gap-y-4 border-y border-border bg-surface px-6 py-8 md:px-12">
        {trust.map((t) => (
          <div key={t.label} className="flex items-baseline gap-2">
            <span className="font-mono text-step-2 tabular-nums text-accent">{t.value}</span>
            <span className="font-mono text-step--1 uppercase tracking-label text-text-muted">
              {t.label}
            </span>
          </div>
        ))}
      </section>

      <section className="overflow-hidden border-b border-border py-6">
        <div className="flex animate-none gap-8 whitespace-nowrap px-6 font-mono text-step-0 uppercase tracking-label text-text-muted">
          {materials.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </section>

      <Work />

      <footer className="flex flex-col gap-2 border-t border-border px-6 py-8 font-mono text-step--1 text-text-muted md:px-12">
        <span>{business.legalName}</span>
        <span>
          {business.address.line1}, {business.address.line2}, {business.address.city},{" "}
          {business.address.state} {business.address.postalCode}
        </span>
        <span>{business.phone}</span>
      </footer>
    </main>
  );
}
