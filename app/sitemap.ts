import type { MetadataRoute } from "next";

const SITE_URL = "https://shahid-the-infinity-art.vercel.app";

// Single-page site — the section anchors (#work, #process, …) are not
// separate URLs. Add entries here if real /[city]/[service] routes land
// (see DECISIONS.md "Open items").
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
