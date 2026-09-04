import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { wedding } from "@/content/site";

/**
 * Static presentation for M1b. The scroll-driven fold interaction (§9, §14
 * M7) is deliberately deferred — it's the last milestone, built only if M6
 * lands comfortably within budget. This section still needs to hold its own
 * visually until then.
 */
export function Wedding() {
  return (
    <section id="wedding" className="px-6 py-section md:px-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <Placeholder
            filename={wedding.image.filename}
            aspect={wedding.image.aspect}
            className="rounded"
          />
        </Reveal>
        <Reveal index={1} className="flex flex-col gap-4">
          <p className="font-mono text-step--1 uppercase tracking-label text-accent">
            {wedding.eyebrow}
          </p>
          <h2 className="text-step-3">{wedding.headline}</h2>
          <p className="measure text-step-0 text-text-muted">{wedding.body}</p>
          <a
            href={wedding.cta.href}
            className="w-fit rounded bg-accent px-5 py-3 font-mono text-step--1 uppercase tracking-label text-ground"
          >
            {wedding.cta.label}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
