import { WorkGrid } from "@/components/sections/WorkGrid";
import { projects } from "@/content/site";

export function Work() {
  return (
    <section id="work" className="px-6 py-section md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-step--1 uppercase tracking-label text-accent">Work</p>
          <h2 className="text-step-3">Kahaan se banwaayi?</h2>
          <p className="measure text-step-0 text-text-muted">
            Signage, print and wedding work we&apos;ve made for shops, clinics and families —
            filter by material to see what we do best.
          </p>
        </div>
        <WorkGrid projects={projects} />
      </div>
    </section>
  );
}
