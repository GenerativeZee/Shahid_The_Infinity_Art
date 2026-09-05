import { WorkGrid } from "@/components/sections/WorkGrid";
import { projects, work } from "@/content/site";

export function Work() {
  return (
    <section id="work" className="px-6 py-section md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-step--1 uppercase tracking-label text-accent">
            {work.eyebrow}
          </p>
          <h2 className="text-heading">{work.headline}</h2>
          <p className="measure text-step-0 text-text-muted">{work.body}</p>
        </div>
        <WorkGrid projects={projects} />
      </div>
    </section>
  );
}
