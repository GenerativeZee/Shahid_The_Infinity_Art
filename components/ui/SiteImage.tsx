import Image from "next/image";

const ASPECT_CLASS: Record<string, string> = {
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-[16/9]",
  "1/1": "aspect-square",
  "3/4": "aspect-[3/4]",
};

type SiteImageProps = {
  /** Path under public/media/, matching content/site.ts `image.filename`. */
  filename: string;
  alt: string;
  aspect?: "4/3" | "16/9" | "1/1" | "3/4";
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Renders a real photo from public/media/ — the counterpart to Placeholder
 * for entries that do have an asset on disk. Sample/stock photography
 * currently fills this role (see DECISIONS.md); swap the underlying files
 * for real client photography without touching this component.
 */
export function SiteImage({
  filename,
  alt,
  aspect = "4/3",
  className = "",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
}: SiteImageProps) {
  return (
    <div className={`relative overflow-hidden ${ASPECT_CLASS[aspect]} ${className}`}>
      <Image
        src={`/media/${filename}`}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
