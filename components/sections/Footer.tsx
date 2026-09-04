import { business, whatsappHref } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-section md:px-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-step-2">{business.legalName}</h2>
          <p className="text-step-0 text-text-muted">{business.tagline}</p>

          <address className="not-italic text-step--1 text-text-muted">
            {business.address.line1}
            <br />
            {business.address.line2}
            <br />
            {business.address.city}, {business.address.state} {business.address.postalCode}
            <br />
            {business.address.country}
          </address>

          <dl className="flex flex-col gap-1 font-mono text-step--1 tabular-nums text-text-muted">
            {business.hours.map((h) => (
              <div key={h.day} className="flex gap-3">
                <dt className="w-20 uppercase tracking-label text-text">{h.day}</dt>
                <dd>{h.open === "Closed" ? "Closed" : `${h.open} – ${h.close}`}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href={whatsappHref}
              className="rounded bg-accent px-5 py-3 font-mono text-step--1 uppercase tracking-label text-ground"
            >
              WhatsApp
            </a>
            <a
              href={`tel:${business.phone.replace(/\s/g, "")}`}
              className="rounded border border-border px-5 py-3 font-mono text-step--1 uppercase tracking-label text-text"
            >
              {business.phone}
            </a>
          </div>
        </div>

        <div className="flex min-h-[240px] items-center justify-center border border-border bg-surface font-mono text-step--1 uppercase tracking-label text-text-muted">
          {business.mapEmbedUrl ? (
            <iframe
              src={business.mapEmbedUrl}
              title="Map to our workshop"
              className="h-full min-h-[240px] w-full border-0"
              loading="lazy"
            />
          ) : (
            <span>Map — pending confirmed address</span>
          )}
        </div>
      </div>
    </footer>
  );
}
