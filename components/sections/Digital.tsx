import { Reveal } from "@/components/ui/Reveal";
import { digital, whatsappHref } from "@/content/site";

export function Digital() {
  return (
    <section id="digital" className="px-6 py-section md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <Reveal>
          <p className="font-mono text-step--1 uppercase tracking-label text-accent">
            {digital.eyebrow}
          </p>
        </Reveal>
        <Reveal index={1}>
          <h2 className="text-heading">{digital.headline}</h2>
        </Reveal>
        <Reveal index={2} className="flex flex-col gap-6">
          <p className="measure text-step-0 text-text-muted">{digital.body}</p>
          <a
            href={whatsappHref}
            className="w-fit rounded border border-border px-5 py-3 font-mono text-step--1 uppercase tracking-label text-text hover:border-text-muted"
          >
            Ask About a Website
          </a>
        </Reveal>
      </div>
    </section>
  );
}
