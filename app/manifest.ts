import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Infinity Art",
    short_name: "Infinity Art",
    description:
      "Custom signage, printing, wedding invitations and brand identity — designed and fabricated by The Infinity Art.",
    start_url: "/",
    display: "standalone",
    background_color: "#080c0e",
    theme_color: "#080c0e",
    icons: [
      {
        src: "/logo/mark.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
