import type {
  BusinessInfo,
  MaterialCategory,
  MaterialSample,
  PriceRange,
  ProcessStep,
  Project,
  Service,
  TrustNumber,
  WhyThisWorksLayer,
} from "./types";

/**
 * Single source of copy for the whole site. Everything a component renders
 * as text should come from here, not be hardcoded inline.
 *
 * PLACEHOLDER DATA — see DECISIONS.md "content placeholders":
 * - `business` contact details (phone, whatsapp, address, geo, hours) are
 *   bracketed placeholders and MUST be replaced with Shahid's real details
 *   before this site is ever deployed to production.
 * - `projects` are fictional sample entries standing in for real client work
 *   and real photography (§13 of the brief). They exist so the Work grid can
 *   be built and reviewed at full visual fidelity; every entry must be
 *   swapped for a real client, real location and real photograph at M2.
 * - `services` price ranges are illustrative market-plausible figures, not
 *   Shahid's actual pricing. Must be confirmed with him before M2 ships.
 * - `trust` numbers are placeholders pending real figures from Shahid.
 */

export const business: BusinessInfo = {
  legalName: "The Infinity Art",
  tagline: "Design, printing & branding studio",
  phone: "+91 90000 00000",
  whatsapp: "919000000000",
  whatsappMessage:
    "Hi, I'm looking for signage/printing work — can you share details?",
  address: {
    line1: "[Shop No. / Building name]",
    line2: "[Area / Road]",
    city: "[City]",
    state: "[State]",
    postalCode: "[PIN]",
    country: "India",
  },
  geo: { lat: 0, lng: 0 },
  hours: [
    { day: "Mon–Sat", open: "10:00", close: "20:00" },
    { day: "Sun", open: "Closed", close: "Closed" },
  ],
  mapEmbedUrl: "",
  instagram: "https://instagram.com/theinfinityart",
};

export const whatsappHref = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
  business.whatsappMessage,
)}`;

export const nav = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Wedding Cards", href: "#wedding" },
  { label: "Process", href: "#process" },
  { label: "Digital", href: "#digital" },
  { label: "Get a Quote", href: "#quote" },
];

export const hero = {
  eyebrow: "The Infinity Art",
  headline: "Your shopfront, unmistakably yours.",
  subhead:
    "Signage, printing, wedding cards and brand identity — designed, fabricated and installed by one studio.",
  primaryCta: { label: "WhatsApp Us", href: whatsappHref },
  secondaryCta: { label: "See Work", href: "#work" },
};

export const work = {
  eyebrow: "Work",
  headline: "Our Work",
  body: "Signage, print and wedding work we've made for shops, clinics and families — filter by material to see what we do best.",
};

export const servicesIntro = {
  eyebrow: "Services",
  headline: "What We Make",
  body: "Real materials, honest price ranges. Talk to us about your exact size and we'll confirm a number on WhatsApp.",
};

export const trust: TrustNumber[] = [
  { value: "[X]+", label: "Years in Business" },
  { value: "[X]+", label: "Boards Installed" },
  { value: "[X]", label: "Cities Covered" },
];

export const materials: MaterialSample[] = [
  {
    name: "ACP",
    description: "Brushed aluminium composite — the standard for a durable, architectural shopfront.",
    accent: "#8fa3ad",
  },
  {
    name: "Star Flex",
    description: "Woven outdoor-grade vinyl for bold, budget-friendly hoardings.",
    accent: "#d99a4e",
  },
  {
    name: "Cast Acrylic",
    description: "3D-cut letters, front or back-lit, for a raised, premium finish.",
    accent: "#e8c98a",
  },
  {
    name: "3M Vinyl",
    description: "Precision-cut lettering and graphics that hold their colour for years.",
    accent: "#5ec2d1",
  },
  {
    name: "300 GSM",
    description: "Heavyweight card stock for visiting cards and brochures that feel substantial.",
    accent: "#d8c9ad",
  },
  {
    name: "LED",
    description: "Fully backlit glow signage that reads clearly after dark.",
    accent: "#7fe3ff",
  },
];

const priceRange = (min: number, max: number, unit: string): PriceRange => ({
  min,
  max,
  unit,
});

export const services: Service[] = [
  {
    slug: "flex-star-flex",
    name: "Flex & Star Flex Boards",
    description:
      "Outdoor flex and star flex printing for shopfront boards and hoardings, mounted on MS frame.",
    materials: ["Flex", "Star flex", "MS frame"],
    priceRange: priceRange(25, 45, "per sq ft"),
  },
  {
    slug: "acp-signage",
    name: "ACP Signboards",
    description:
      "Aluminium composite panel boards with vinyl-cut or printed lettering — the standard for a durable, weatherproof shopfront.",
    materials: ["ACP", "3M vinyl"],
    priceRange: priceRange(180, 350, "per sq ft"),
  },
  {
    slug: "cast-acrylic-letters",
    name: "Cast Acrylic Letters",
    description:
      "3D cut acrylic letters, front-lit or back-lit, for a raised, premium shopfront look.",
    materials: ["Cast acrylic", "LED"],
    priceRange: priceRange(250, 600, "per sq ft"),
  },
  {
    slug: "led-glow-signs",
    name: "LED Glow Signs",
    description:
      "Fully backlit glow signboards that read clearly after dark — the highest-visibility option we make.",
    materials: ["Acrylic", "LED", "ACP backing"],
    priceRange: priceRange(400, 900, "per sq ft"),
  },
  {
    slug: "visiting-cards",
    name: "Visiting Cards",
    description: "300 GSM visiting cards, matte or gloss lamination, same-week turnaround.",
    materials: ["300 GSM board"],
    priceRange: priceRange(300, 900, "per box of 100"),
  },
  {
    slug: "brochures-standees",
    name: "Brochures & Standees",
    description: "Tri-fold brochures and roll-up standees for shops, clinics and exhibitions.",
    materials: ["170 GSM art paper", "Flex", "Standee stand"],
    priceRange: priceRange(800, 2500, "per standee"),
  },
  {
    slug: "wedding-cards",
    name: "Wedding Invitations",
    description:
      "Custom wedding cards on textured paper, with gold foil and insert cards.",
    materials: ["Textured paper", "Gold foil"],
    priceRange: priceRange(25, 150, "per card"),
  },
  {
    slug: "logo-branding",
    name: "Logo & Brand Identity",
    description:
      "Logo design, stationery and a brand kit so every board, card and post looks like it belongs to the same shop.",
    materials: ["Brand guideline", "Stationery kit"],
    priceRange: priceRange(8000, 40000, "per project"),
  },
  {
    slug: "websites-apps",
    name: "Websites & Apps",
    description:
      "Websites and simple business apps for clients who want the same studio to build their digital side too.",
    materials: ["Website", "Web app"],
    priceRange: priceRange(15000, 80000, "per project"),
  },
];

export const process: ProcessStep[] = [
  {
    step: 1,
    name: "Design",
    description: "We measure the site, take your brief and send a proof before anything is cut or printed.",
  },
  {
    step: 2,
    name: "Approval",
    description: "You sign off the design and size. Nothing goes to production without your yes.",
  },
  {
    step: 3,
    name: "Print",
    description: "Material is printed, cut or fabricated in-house and quality-checked.",
  },
  {
    step: 4,
    name: "Installation",
    description: "We install on-site on the date we gave you — that date is a promise, not an estimate.",
  },
];

export const wedding = {
  eyebrow: "Wedding Cards",
  headline: "Your wedding, your style.",
  body: "Custom wedding invitations on textured paper, with gold foil and insert cards — designed around your colours, not a catalogue template.",
  cta: { label: "Talk to Us", href: whatsappHref },
  image: {
    filename: "wedding/hero-flatlay.jpg",
    alt: "Wedding card flat lay on textured paper with gold foil detail",
    aspect: "4/3" as const,
  },
};

export const digital = {
  eyebrow: "Also digital",
  headline: "We build the website too.",
  body:
    "Most of what you see us make is physical — boards, cards, banners. We also build the websites and apps that go with them, so your shop looks the same everywhere someone finds it.",
};

export const quote = {
  headline: "Get a Quote",
  body: "Tell us the size and material, and send a photo of the wall if you have one — we'll reply on WhatsApp with a price.",
};

/**
 * "Why This Works" — Portfolio 2.0. One story per material category, not
 * per (placeholder) project — SPEC.md §11.2 still rules out inventing
 * project-specific facts. Only `signage` gets the full problem/choice/
 * detail/result arc with a marker on the image; every other category
 * gets the lighter choice+result version. That split is deliberate, not
 * an oversight: the signature Work card (material: "signage") is the
 * one place this site currently has enough of a real story to tell in
 * four parts, and forcing that depth onto every category would mean
 * inventing detail that isn't there. See DECISIONS.md.
 */
export const whyThisWorksByMaterial: Record<MaterialCategory, WhyThisWorksLayer> = {
  signage: {
    problem: "A shopfront sign has to work from across the street, not just up close.",
    choice: "ACP board with raised, edge-lit lettering instead of a printed flex face.",
    detail:
      "The letterforms are cut heavier than feels “right” up close — calibrated for legibility from a moving vehicle, not for a close-up photo.",
    detailMarker: { xPercent: 55, yPercent: 45, label: "Letter weight" },
    result: "A sign that reads clearly from the road, not just the doorstep.",
  },
  flex: {
    choice: "Star flex stretched drum-tight over an MS frame, not glued to a wall.",
    result: "Tensioned tight so the print never ripples in wind.",
  },
  "acrylic-led": {
    choice: "Backlit cast acrylic, not edge-lit — the glow needed to be even, not just a rim.",
    result: "Backlit evenly, corner to corner — no hot spots.",
  },
  wedding: {
    choice: "Foil placed only where it catches light, not across the whole card.",
    result: "Foil that catches light without overpowering the design.",
  },
  print: {
    choice: "300 GSM stock, heavy enough to hold its shape in a stack.",
    result: "Stock heavy enough to feel considered before you even read it.",
  },
  digital: {
    choice: "Built content-first, so the design serves what a customer is actually looking for.",
    result: "Built to load fast on the same connection your customers use.",
  },
};

/**
 * The lightweight answer behind every non-signature Work card's "What
 * changed?" pill — one true-of-the-category sentence, not a fabricated
 * claim about the specific (placeholder) project shown. Same honesty
 * rule as `craftDetails`, one level lighter.
 */
export const whatChangedByMaterial: Record<MaterialCategory, string> = {
  signage: "Every panel edge is sealed against monsoon damp.",
  flex: "Tensioned tight so the print never ripples in wind.",
  "acrylic-led": "Backlit evenly, corner to corner — no hot spots.",
  wedding: "Foil that catches light without overpowering the design.",
  print: "Stock heavy enough to feel considered before you even read it.",
  digital: "Built to load fast on the same connection your customers use.",
};

const project = (p: Project): Project => p;

// PLACEHOLDER DATA (SPEC.md §11.2): client, location and year are
// deliberately bracketed, not invented — "Named clients, testimonials,
// review counts, project years. Leave empty and flag." `name` and
// `material` describe the category of work, which isn't a claim about a
// specific business, so those stay descriptive rather than bracketed.
export const projects: Project[] = [
  project({
    slug: "acp-shopfront-board",
    name: "ACP Shopfront Board",
    client: "[Client name pending]",
    location: "[Location pending]",
    material: "signage",
    year: "[Year pending]",
    image: {
      filename: "work/acp-shopfront-board-wide.jpg",
      alt: "ACP shopfront board, wide shot — placeholder pending real photography",
      aspect: "4/3",
    },
    featured: true,
  }),
  project({
    slug: "star-flex-clinic-board",
    name: "Star Flex Clinic Board",
    client: "[Client name pending]",
    location: "[Location pending]",
    material: "flex",
    year: "[Year pending]",
    image: {
      filename: "work/star-flex-clinic-board-wide.jpg",
      alt: "Star flex clinic board, wide shot — placeholder pending real photography",
      aspect: "4/3",
    },
  }),
  project({
    slug: "cast-acrylic-led-sign",
    name: "Cast Acrylic LED Sign",
    client: "[Client name pending]",
    location: "[Location pending]",
    material: "acrylic-led",
    year: "[Year pending]",
    image: {
      filename: "work/cast-acrylic-led-sign-dusk.jpg",
      alt: "Glowing acrylic LED sign at dusk — placeholder pending real photography",
      aspect: "4/3",
    },
    featured: true,
  }),
  project({
    slug: "wedding-invitation-suite",
    name: "Wedding Invitation Suite",
    client: "[Client name pending]",
    location: "[Location pending]",
    material: "wedding",
    year: "[Year pending]",
    image: {
      filename: "work/wedding-invitation-suite-flatlay.jpg",
      alt: "Wedding card flat lay on textured paper — placeholder pending real photography",
      aspect: "1/1",
    },
  }),
  project({
    slug: "visiting-card-set",
    name: "Visiting Card Set",
    client: "[Client name pending]",
    location: "[Location pending]",
    material: "print",
    year: "[Year pending]",
    image: {
      filename: "work/visiting-card-set.jpg",
      alt: "300 GSM visiting card set — placeholder pending real photography",
      aspect: "4/3",
    },
  }),
  project({
    slug: "business-website",
    name: "Business Website",
    client: "[Client name pending]",
    location: "[Location pending]",
    material: "digital",
    year: "[Year pending]",
    image: {
      filename: "work/business-website.jpg",
      alt: "Client website shown on a laptop — placeholder pending real photography",
      aspect: "16/9",
    },
  }),
  project({
    slug: "acp-signboard-two-panel",
    name: "ACP Signboard, Two Panels",
    client: "[Client name pending]",
    location: "[Location pending]",
    material: "signage",
    year: "[Year pending]",
    image: {
      filename: "work/acp-signboard-two-panel-detail.jpg",
      alt: "ACP signboard, close detail of the edge — placeholder pending real photography",
      aspect: "3/4",
    },
  }),
  project({
    slug: "led-glow-sign",
    name: "LED Glow Sign",
    client: "[Client name pending]",
    location: "[Location pending]",
    material: "acrylic-led",
    year: "[Year pending]",
    image: {
      filename: "work/led-glow-sign-dusk.jpg",
      alt: "LED glow sign at blue hour — placeholder pending real photography",
      aspect: "4/3",
    },
  }),
];

export const materialFilters: { label: string; value: MaterialCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Signage", value: "signage" },
  { label: "Flex", value: "flex" },
  { label: "Acrylic / LED", value: "acrylic-led" },
  { label: "Wedding", value: "wedding" },
  { label: "Print", value: "print" },
  { label: "Digital", value: "digital" },
];
