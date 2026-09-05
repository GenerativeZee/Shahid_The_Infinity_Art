/**
 * Process's evolving artefact — ONE sign panel, four states. The same
 * <svg> nodes persist across every state (this component never remounts
 * and carries no `key`); only their opacity and colour change, so the
 * visitor watches one object gain definition, then material, then a wall,
 * rather than four separate illustrations (see DECISIONS.md). Every
 * transition is a physical event:
 *
 *   0  Design        hairline outline + construction guides — drawn, not built
 *   1  Approval       guides cleared, outline + lettering commit, an approval mark
 *   2  Print          ACP surface + hatch texture + board depth appear
 *   3  Installation   the panel is on a lit wall, mounted, casting a shadow
 *
 * Transitions are defined once in globals.css (`.process-artifact
 * [data-layer]`) and are dropped wholesale under prefers-reduced-motion —
 * each state still renders in full, just without the tween. The subject is
 * the studio's own name, the same object Shahid's Eye examines, so the
 * Type / Material / Space decisions a visitor met there are seen here
 * surviving all the way to the wall.
 */

// Opacity of each layer per state: [Design, Approval, Print, Installation].
const LAYER_OPACITY = {
  guides: [0.5, 0, 0, 0],
  outlineDashed: [1, 0, 0, 0],
  outlineSolid: [0, 1, 1, 1],
  surface: [0, 0, 1, 1],
  texture: [0, 0, 0.5, 0.5],
  depth: [0, 0, 1, 1],
  approvalMark: [0, 1, 1, 1],
  wall: [0, 0, 0, 1],
  glow: [0, 0, 0, 0.16],
  shadow: [0, 0, 0, 0.4],
  mounts: [0, 0, 0, 1],
} as const;

const HATCH_ID = "process-artifact-hatch";

export function ProcessArtifact({ state, label }: { state: number; label: string }) {
  const s = Math.max(0, Math.min(3, Math.round(state)));
  const o = (k: keyof typeof LAYER_OPACITY) => LAYER_OPACITY[k][s];
  const committed = s >= 1;

  return (
    <svg
      viewBox="0 0 360 270"
      className="process-artifact h-full w-full"
      fill="none"
      role="img"
      aria-label={label}
    >
      <defs>
        <pattern
          id={HATCH_ID}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--color-accent)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Installation — the wall the finished sign is mounted on */}
      <rect
        data-layer
        x="0"
        y="0"
        width="360"
        height="270"
        fill="var(--color-surface)"
        style={{ opacity: o("wall") }}
      />
      <line
        data-layer
        x1="0"
        y1="204"
        x2="360"
        y2="204"
        stroke="var(--color-border)"
        strokeWidth="1"
        style={{ opacity: o("wall") }}
      />

      {/* Installation — edge-lit glow behind the panel */}
      <ellipse
        data-layer
        cx="180"
        cy="118"
        rx="150"
        ry="64"
        fill="var(--color-accent)"
        style={{ opacity: o("glow"), filter: "blur(14px)" }}
      />

      {/* Installation — cast shadow, panel mounted proud of the wall */}
      <rect
        data-layer
        x="70"
        y="76"
        width="220"
        height="88"
        rx="2"
        fill="#000000"
        transform="translate(9 11)"
        style={{ opacity: o("shadow"), filter: "blur(6px)" }}
      />

      {/* Print — the board gains thickness */}
      <rect
        data-layer
        x="70"
        y="76"
        width="220"
        height="88"
        rx="2"
        fill="var(--color-ground)"
        stroke="var(--color-border)"
        strokeWidth="1"
        transform="translate(5 5)"
        style={{ opacity: o("depth") }}
      />

      {/* Print — ACP surface, then a printed hatch texture over it */}
      <rect
        data-layer
        x="70"
        y="76"
        width="220"
        height="88"
        rx="2"
        fill="var(--color-surface-raised)"
        style={{ opacity: o("surface") }}
      />
      <rect
        data-layer
        x="70"
        y="76"
        width="220"
        height="88"
        rx="2"
        fill={`url(#${HATCH_ID})`}
        style={{ opacity: o("texture") }}
      />

      {/* Panel outline — dashed while it is a drawing, solid once approved */}
      <rect
        data-layer
        x="70"
        y="76"
        width="220"
        height="88"
        rx="2"
        stroke="var(--color-text-muted)"
        strokeWidth="1"
        strokeDasharray="4 4"
        style={{ opacity: o("outlineDashed") }}
      />
      <rect
        data-layer
        x="70"
        y="76"
        width="220"
        height="88"
        rx="2"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        style={{ opacity: o("outlineSolid") }}
      />

      {/* The wordmark — hairline while it is being positioned, filled once committed */}
      <text
        data-layer
        x="180"
        y="122"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-display)"
        fontWeight="800"
        fontSize="27"
        letterSpacing="1"
        textLength="190"
        lengthAdjust="spacingAndGlyphs"
        style={{
          fill: committed ? "var(--color-text)" : "transparent",
          stroke: committed ? "transparent" : "var(--color-text-muted)",
          strokeWidth: 0.5,
          filter: s >= 2 ? "drop-shadow(0 1px 0 rgba(0,0,0,0.45))" : "none",
        }}
      >
        INFINITY ART
      </text>

      {/* Approval — a small mark in the corner (the old ApprovalIcon check, distilled) */}
      <g data-layer transform="translate(268 82) scale(0.55)" style={{ opacity: o("approvalMark") }}>
        <circle cx="0" cy="0" r="11" stroke="var(--color-accent)" strokeWidth="1.5" />
        <path
          d="M-6 0l4 4 8 -9"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Installation — two mounting points */}
      <g data-layer style={{ opacity: o("mounts") }}>
        <circle cx="84" cy="90" r="2.5" fill="var(--color-text-muted)" />
        <circle cx="276" cy="90" r="2.5" fill="var(--color-text-muted)" />
      </g>

      {/* Design — construction guides and a dimension line */}
      <g
        data-layer
        stroke="var(--color-accent)"
        strokeWidth="0.75"
        style={{ opacity: o("guides") }}
      >
        <line x1="180" y1="38" x2="180" y2="210" strokeDasharray="2 4" />
        <line x1="40" y1="120" x2="320" y2="120" strokeDasharray="2 4" />
        <line x1="58" y1="76" x2="58" y2="164" />
        <line x1="302" y1="76" x2="302" y2="164" />
        <line x1="70" y1="184" x2="290" y2="184" />
        <line x1="70" y1="180" x2="70" y2="188" />
        <line x1="290" y1="180" x2="290" y2="188" />
      </g>
    </svg>
  );
}
