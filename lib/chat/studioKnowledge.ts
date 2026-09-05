import {
  business,
  buildIt,
  eyeLenses,
  materials,
  process,
  projects,
  services,
  whyThisWorksByMaterial,
} from "@/content/site";

/**
 * The studio knowledge the assistant is grounded in — derived from
 * `content/site.ts` (single source of truth), never duplicated. Formatted
 * as one compact block for the system instruction. Nothing here is
 * fabricated: client names, locations, years and a fixed address are
 * deliberately omitted because the site itself doesn't publish them.
 */
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function buildStudioKnowledge(): string {
  const servicesBlock = services
    .map(
      (s) =>
        `- ${s.name}: ${s.description} Materials: ${s.materials.join(", ")}. ` +
        `Indicative range ${inr(s.priceRange.min)}–${inr(s.priceRange.max)} ${s.priceRange.unit} ` +
        `(indicative only — every job is quoted after size, material, lighting, fabrication and installation are known).`,
    )
    .join("\n");

  const materialsBlock = materials.map((m) => `- ${m.name}: ${m.description}`).join("\n");

  const processBlock = process.map((p) => `${p.step}. ${p.name} — ${p.description}`).join("\n");

  const whyBlock = Object.entries(whyThisWorksByMaterial)
    .map(([category, v]) => {
      const parts = [v.problem, v.choice, v.detail, v.result].filter(Boolean);
      return `- ${category}: ${parts.join(" ")}`;
    })
    .join("\n");

  const lensesBlock = eyeLenses.map((l) => `- ${l.label}: ${l.annotation}`).join("\n");

  const portfolioBlock = projects.map((p) => `- ${p.name} (${p.material})`).join("\n");

  const buildVars = [
    `Material (${buildIt.materials.map((m) => m.label).join(" / ")})`,
    `Proportion (${buildIt.proportions.map((p) => p.label).join(" / ")})`,
    `Lettering (${buildIt.lettering.map((l) => l.label).join(" / ")})`,
    `Light (${buildIt.light.map((l) => l.label).join(" / ")})`,
  ].join(", ");

  return `STUDIO
${business.legalName} — ${business.tagline}. Based in India. One studio designs, fabricates and installs signage, and also does printing, wedding invitations, brand identity, and websites/apps.
Hours: ${business.hours.map((h) => `${h.day} ${h.open}–${h.close}`).join("; ")}.
The direct line to Shahid is WhatsApp. A specific street address and landline are still being finalised — do not state one.

SERVICES (with indicative price ranges — never quote a single fixed price for a visitor's job)
${servicesBlock}

MATERIALS
${materialsBlock}

WHY CERTAIN CHOICES WORK (category-level craft notes, not project-specific claims)
${whyBlock}

PROCESS — four steps, every job
${processBlock}

SHAHID'S EYE — six ways the studio reads a design
${lensesBlock}

BUILD IT — an interactive tool on this site where a visitor shapes a sign by choosing: ${buildVars}.

PORTFOLIO (categories of work shown on the site; client names, locations and years are not published yet)
${portfolioBlock}`;
}
