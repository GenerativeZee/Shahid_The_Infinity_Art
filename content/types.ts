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
  client: string;
  location: string;
  material: MaterialCategory;
  year: number;
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
