"use client";

import { useMemo, useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { LookAgainReveal } from "@/components/theme/LookAgainReveal";
import { craftDetails } from "@/content/site";
import type { MaterialCategory, Project } from "@/content/types";

type Filter = MaterialCategory | "all";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Signage", value: "signage" },
  { label: "Flex", value: "flex" },
  { label: "Acrylic / LED", value: "acrylic-led" },
  { label: "Wedding", value: "wedding" },
  { label: "Print", value: "print" },
  { label: "Digital", value: "digital" },
];

const FILTER_LABEL: Record<Filter, string> = Object.fromEntries(
  FILTERS.map((f) => [f.value, f.label]),
) as Record<Filter, string>;

export function WorkGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? projects : projects.filter((p) => p.material === filter);
  // The site's one signature discovery moment (see LookAgainReveal) — the
  // rest of the grid gets the lighter "What changed?" hover cue instead.
  const signatureSlug = useMemo(() => projects.find((p) => p.featured)?.slug, [projects]);

  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label="Filter by material" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-4 py-2 font-mono text-step--1 uppercase tracking-label transition-colors duration-200 ${
                active
                  ? "border-accent bg-accent text-ground"
                  : "border-border text-text-muted hover:border-text-muted hover:text-text"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="font-mono text-step--1 text-text-muted">
          Nothing in this category yet — check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project, index) => (
            <Reveal key={project.slug} index={index % 6}>
              <ProjectCard project={project} isSignature={project.slug === signatureSlug} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, isSignature }: { project: Project; isSignature: boolean }) {
  return (
    <article className="group flex flex-col gap-3">
      {isSignature ? (
        <LookAgainReveal image={project.image} projectName={project.name} details={craftDetails} />
      ) : (
        <div className="relative hover-zoom overflow-hidden">
          <div className={project.featured ? "kenburns-slow" : ""}>
            <Placeholder filename={project.image.filename} aspect={project.image.aspect} />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-end justify-start bg-ground/0 p-4 transition-colors duration-300 group-hover:bg-ground/25"
          >
            <span className="translate-y-2 rounded-full border border-accent/60 bg-ground/80 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-label text-accent opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              What changed?
            </span>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-step-0 font-semibold text-text">{project.name}</h3>
          <span className="mt-0.5 shrink-0 rounded-full border border-border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-label text-text-muted">
            {FILTER_LABEL[project.material]}
          </span>
        </div>
        <p className="font-mono text-step--1 tabular-nums text-text-muted">
          {project.client} — {project.location} · {project.year}
        </p>
      </div>
    </article>
  );
}
