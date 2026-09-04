const ASPECT_CLASS: Record<string, string> = {
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-[16/9]",
  "1/1": "aspect-square",
  "3/4": "aspect-[3/4]",
};

type PlaceholderProps = {
  /** Expected final filename, shown so it's obvious what asset is missing. */
  filename: string;
  aspect?: "4/3" | "16/9" | "1/1" | "3/4";
  className?: string;
};

/**
 * Stands in for photography that doesn't exist yet. Deliberately loud and
 * unmistakably fake — a solid accent block with the expected filename
 * printed across it — so nobody confuses it for a finished asset.
 */
export function Placeholder({ filename, aspect = "4/3", className = "" }: PlaceholderProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-accent/20 ${ASPECT_CLASS[aspect]} ${className}`}
      role="img"
      aria-label={`Placeholder image: ${filename}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--color-accent) 0, var(--color-accent) 1px, transparent 1px, transparent 12px)",
          opacity: 0.25,
        }}
      />
      <span className="relative z-10 px-3 text-center font-mono text-[0.65rem] uppercase tracking-label text-accent break-all">
        {filename}
      </span>
    </div>
  );
}
