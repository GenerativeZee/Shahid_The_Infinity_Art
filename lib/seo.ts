import { business } from "@/content/site";

const DAY_ABBR: Record<string, string> = {
  Mon: "Mo",
  Tue: "Tu",
  Wed: "We",
  Thu: "Th",
  Fri: "Fr",
  Sat: "Sa",
  Sun: "Su",
};

function toOpeningHours(): string[] {
  return business.hours
    .filter((h) => h.open !== "Closed")
    .map((h) => {
      const [start, end] = h.day.split("–").map((d) => d.trim());
      const abbr = end
        ? `${DAY_ABBR[start.slice(0, 3)]}-${DAY_ABBR[end.slice(0, 3)]}`
        : DAY_ABBR[start.slice(0, 3)];
      return `${abbr} ${h.open}-${h.close}`;
    });
}

/** LocalBusiness JSON-LD (§12). `siteUrl` needs a real production domain — see DECISIONS.md. */
export function localBusinessJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.legalName,
    telephone: business.phone,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: [business.address.line1, business.address.line2].filter(Boolean).join(", "),
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.lat,
      longitude: business.geo.lng,
    },
    openingHours: toOpeningHours(),
    sameAs: [business.instagram].filter(Boolean),
    url: siteUrl,
  };
}
