export type MaterialCategory =
  | "signage"
  | "flex"
  | "acrylic-led"
  | "wedding"
  | "print"
  | "digital";

export type ProjectImage = {
  /** Expected filename under public/media/work/, documented in public/media/README.md */
  filename: string;
  alt: string;
  aspect: "4/3" | "16/9" | "1/1" | "3/4";
};

export type Project = {
  slug: string;
  name: string;
  /** Real client name, per SPEC.md §11.2 — a bracketed placeholder until confirmed. */
  client: string;
  /** Real location, per SPEC.md §11.2 — a bracketed placeholder until confirmed. */
  location: string;
  material: MaterialCategory;
  /** Real completion year, per SPEC.md §11.2 — a bracketed placeholder until confirmed. */
  year: string;
  image: ProjectImage;
  featured?: boolean;
};

export type PriceRange = {
  min: number;
  max: number;
  unit: string;
};

export type Service = {
  slug: string;
  name: string;
  description: string;
  materials: string[];
  priceRange: PriceRange;
};

export type ProcessStep = {
  step: number;
  name: string;
  description: string;
  /**
   * One honest sentence describing how the Process artefact looks at this
   * stage — the method, not a fabricated project fact. Used as the SVG's
   * accessible label so the transformation is legible to a screen reader.
   */
  visual: string;
  /**
   * The Shahid's Eye lens this stage foregrounds, if any. Drives the
   * marker on the artefact — the visitor sees that decision survive into
   * material and installation. Approval is a decision beat, not an
   * observation, so it has none.
   */
  lens?: EyeLensId;
};

/**
 * The "Why This Works" story behind a material category — never a
 * specific placeholder project (SPEC.md §11.2 still applies: no
 * fabricated project facts). `problem`/`detail`/`detailMarker` are
 * optional on purpose — most categories only get the lighter
 * choice+result story; only the category behind the signature Work
 * card earns the full four-layer treatment. See DECISIONS.md.
 */
export type WhyThisWorksLayer = {
  problem?: string;
  choice: string;
  /** Only present for the one category deep enough to point at something specific. */
  detail?: string;
  /** Percentage position within the project image, for the detail-stage marker. */
  detailMarker?: { xPercent: number; yPercent: number; label: string };
  result: string;
};

/** A "Shahid's Eye" lens — one of six ways of looking at the same subject. */
export type EyeLensId = "type" | "light" | "space" | "material" | "colour" | "balance";

/**
 * A Detail Index category. Reuses Shahid's Eye's six lenses verbatim —
 * a marker a visitor finds in the Work grid names the same way-of-looking
 * that section demonstrates — plus a general "detail" for a small physical
 * decision that doesn't sit under one lens.
 */
export type DetailCategory = EyeLensId | "detail";

/**
 * One "look closer" note in the Detail Index — a marker on a Work project
 * image that, when opened, answers one design question. Same honesty rule
 * as WhyThisWorksLayer (SPEC.md §11.2): `answer` is true of the material or
 * category, never an invented fact about the specific (still-placeholder)
 * project. Deliberately sparse — only a few projects carry one. See
 * DECISIONS.md.
 */
export type ProjectDetail = {
  /** `Project.slug` this note is attached to. */
  projectSlug: string;
  category: DetailCategory;
  /** Percentage position of the marker within the project image. */
  marker: { xPercent: number; yPercent: number };
  /** One descriptive word on the marker itself — points at the thing, not the lens. */
  markerLabel: string;
  /** The question the note answers, also its accessible name (e.g. "Why seal the edge?"). */
  question: string;
  /** 1–2 sentences. Material/category-level truth only. */
  answer: string;
};

/**
 * "Build It" decisions — a small, fixed vocabulary. Materials map by
 * `sample` onto the existing `materials` list so their accent and
 * description stay single-sourced; nothing here is a new material system.
 */
export type BuildMaterialId = "acp" | "acrylic" | "star-flex" | "led";
export type BuildProportionId = "compact" | "standard" | "wide";
export type BuildLetteringId = "clean" | "bold" | "refined";
export type BuildLightId = "none" | "soft" | "illuminated";

export type MaterialSample = {
  name: string;
  description: string;
  /**
   * Local accent tint for the material explorer's hover/tap preview —
   * scoped to that section only (set on its own wrapper, never on
   * :root), so it never fights the scroll-driven theme engine's own
   * --color-accent value.
   */
  accent: string;
};

export type TrustNumber = {
  value: string;
  label: string;
};

export type BusinessHours = {
  day: string;
  open: string;
  close: string;
};

export type BusinessInfo = {
  legalName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  whatsappMessage: string;
  email?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  geo: { lat: number; lng: number };
  hours: BusinessHours[];
  mapEmbedUrl: string;
  instagram?: string;
};
