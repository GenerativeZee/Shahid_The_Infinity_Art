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
