import { Reveal } from "@/components/ui/Reveal";
import { services, servicesIntro } from "@/content/site";
import type { Service } from "@/content/types";

function formatPrice(service: Service) {
  const { min, max, unit } = service.priceRange;
  return `₹${min.toLocaleString("en-IN")}–${max.toLocaleString("en-IN")} ${unit}`;
}

export function Services() {
  return (
    <section id="services" className="bg-surface px-6 py-section md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-step--1 uppercase tracking-label text-accent">
            {servicesIntro.eyebrow}
          </p>
          <h2 className="text-heading">{servicesIntro.headline}</h2>
          <p className="measure text-step-0 text-text-muted">{servicesIntro.body}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.slug} index={index % 6}>
              <article className="flex h-full flex-col gap-3 rounded border border-border bg-ground p-6">
                <h3 className="text-step-0 font-semibold text-text">{service.name}</h3>
                <p className="measure text-step--1 text-text-muted">{service.description}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {service.materials.map((m) => (
                    <span
                      key={m}
                      className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-label text-text-muted"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                <p className="mt-auto pt-3 font-mono text-step--1 tabular-nums text-accent">
                  {formatPrice(service)}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
