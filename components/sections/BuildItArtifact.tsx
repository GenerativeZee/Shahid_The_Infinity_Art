import type {
  BuildLetteringId,
  BuildLightId,
  BuildMaterialId,
  BuildProportionId,
} from "@/content/types";

/**
 * The Build It preview — ONE sign panel, reshaped by four decisions. Same
 * philosophy as `ProcessArtifact`: a single persistent <svg> whose nodes
 * never unmount; only their opacity, transform, fill/stroke and the
 * lettering's spacing change as the props change. Nothing here is a real
 * customer's sign — it always reads the studio's own name.
 *
 *   material   → the face: flat ACP, sheened acrylic, woven Star Flex, dark LED box
 *   proportion → a non-uniform scale on the whole panel group
 *   lettering  → weight, size and tracking of the wordmark
 *   light      → the glow behind the panel and, illuminated, on the letters
 *
 * Transitions live in globals.css (`.build-artifact [data-layer]`) inside
 * the shared reduced-motion guard, so a reduced-motion visitor still sees
 * every state in full — just with no tween.
 */

const PROPORTION_SCALE: Record<BuildProportionId, string> = {
  compact: "scale(0.76, 1.08)",
  standard: "scale(1, 1)",
  wide: "scale(1.3, 0.88)",
};

const DEPTH_OPACITY: Record<BuildMaterialId, number> = {
  acp: 1,
  acrylic: 1,
  "star-flex": 0.25,
  led: 0.9,
};

const SHADOW_OPACITY: Record<BuildMaterialId, number> = {
  acp: 0.32,
  acrylic: 0.4,
  "star-flex": 0.16,
  led: 0.28,
};

const GLOW_OPACITY: Record<BuildLightId, number> = {
  none: 0,
  soft: 0.13,
  illuminated: 0.3,
};

const EDGE: Record<BuildMaterialId, { stroke: string; width: number }> = {
  acp: { stroke: "var(--color-text-muted)", width: 1 },
  acrylic: { stroke: "var(--color-accent)", width: 1.5 },
  "star-flex": { stroke: "var(--color-border)", width: 1 },
  led: { stroke: "var(--color-accent)", width: 2.5 },
};

const LETTERING: Record<BuildLetteringId, { weight: number; size: number; spacing: number }> = {
  clean: { weight: 600, size: 30, spacing: 1.5 },
  bold: { weight: 800, size: 32, spacing: 0.5 },
  refined: { weight: 400, size: 27, spacing: 5 },
};

const WEAVE_ID = "build-artifact-weave";

export function BuildItArtifact({
  material,
  proportion,
  lettering,
  light,
  label,
}: {
  material: BuildMaterialId;
  proportion: BuildProportionId;
  lettering: BuildLetteringId;
  light: BuildLightId;
  label: string;
}) {
  const edge = EDGE[material];
  const type = LETTERING[lettering];
  const isLed = material === "led";

  const wordmarkFilter =
    light === "illuminated"
      ? "drop-shadow(0 0 5px var(--color-accent))"
      : isLed
        ? "drop-shadow(0 0 3px var(--color-accent))"
        : "none";

  return (
    <svg
      viewBox="0 0 400 300"
      className="build-artifact h-full w-full"
      fill="none"
      role="img"
      aria-label={label}
    >
      <defs>
        <pattern id={WEAVE_ID} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 0L6 6M6 0L0 6" stroke="var(--color-text-muted)" strokeWidth="0.6" opacity="0.55" />
        </pattern>
      </defs>

      {/* Studio wall the sign sits against */}
      <rect data-layer x="0" y="0" width="400" height="300" fill="var(--color-surface)" />
      <line data-layer x1="0" y1="234" x2="400" y2="234" stroke="var(--color-border)" strokeWidth="1" />

      {/* Light — glow behind the panel */}
      <ellipse
        data-layer
        cx="200"
        cy="148"
        rx="172"
        ry="82"
        fill="var(--color-accent)"
        style={{ opacity: GLOW_OPACITY[light], filter: "blur(18px)" }}
      />

      {/* Material — cast shadow (deep for acrylic, faint for tensioned flex) */}
      <rect
        data-layer
        x="100"
        y="96"
        width="200"
        height="108"
        rx="2"
        fill="#000000"
        transform="translate(10 12)"
        style={{ opacity: SHADOW_OPACITY[material], filter: "blur(7px)" }}
      />

      {/* Proportion — the whole panel group scales, non-uniformly */}
      <g
        data-layer
        style={{
          transform: PROPORTION_SCALE[proportion],
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      >
        {/* Material — board depth */}
        <rect
          data-layer
          x="100"
          y="96"
          width="200"
          height="108"
          rx="2"
          fill="var(--color-ground)"
          stroke="var(--color-border)"
          strokeWidth="1"
          transform="translate(5 5)"
          style={{ opacity: DEPTH_OPACITY[material] }}
        />

        {/* Face — base, then material-specific overlays */}
        <rect x="100" y="96" width="200" height="108" rx="2" fill="var(--color-surface-raised)" />
        <rect
          data-layer
          x="100"
          y="96"
          width="200"
          height="108"
          rx="2"
          fill="var(--color-ground)"
          style={{ opacity: isLed ? 0.85 : 0 }}
        />
        <rect
          data-layer
          x="100"
          y="96"
          width="200"
          height="108"
          rx="2"
          fill={`url(#${WEAVE_ID})`}
          style={{ opacity: material === "star-flex" ? 0.5 : 0 }}
        />
        <rect
          data-layer
          x="100"
          y="96"
          width="200"
          height="52"
          rx="2"
          fill="var(--color-text)"
          style={{ opacity: material === "acrylic" ? 0.06 : 0 }}
        />

        {/* Edge treatment */}
        <rect
          data-layer
          x="100"
          y="96"
          width="200"
          height="108"
          rx="2"
          fill="none"
          style={{ stroke: edge.stroke, strokeWidth: edge.width }}
        />

        {/* Lettering — the studio's own name, never a customer's */}
        <text
          data-layer
          x="200"
          y="150"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="var(--font-display)"
          fontWeight={type.weight}
          textLength="172"
          lengthAdjust="spacingAndGlyphs"
          style={{
            fontSize: type.size,
            letterSpacing: type.spacing,
            fill: isLed ? "var(--color-accent)" : "var(--color-text)",
            filter: wordmarkFilter,
          }}
        >
          INFINITY ART
        </text>
      </g>
    </svg>
  );
}
