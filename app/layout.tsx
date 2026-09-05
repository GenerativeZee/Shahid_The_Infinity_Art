import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import { Grain } from "@/components/ui/Grain";
import { localBusinessJsonLd } from "@/lib/seo";
import "./globals.css";

// Current production domain. Swap for a real custom domain here (one line)
// once one is bought — see DECISIONS.md.
const SITE_URL = "https://shahid-the-infinity-art.vercel.app";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-source-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const title = "The Infinity Art — Signage, Printing & Branding Studio";
const description =
  "Custom signage, printing, wedding invitations and brand identity — designed and fabricated by The Infinity Art.";

// Stopgap share image: the real logo on its gold banner. Replace with the
// mounted/glowing hero render once real photography exists (see DECISIONS.md).
const shareImage = "/logo/full.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "The Infinity Art",
    locale: "en_IN",
    type: "website",
    images: [{ url: shareImage, alt: "The Infinity Art" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = localBusinessJsonLd(SITE_URL);

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${sourceSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ground text-text">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-ground"
        >
          Skip to content
        </a>
        {children}
        <Grain />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
