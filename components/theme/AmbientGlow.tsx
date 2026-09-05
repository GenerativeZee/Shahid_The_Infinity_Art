/**
 * A soft, fixed ambient wash tinted by the live --color-accent variable
 * (v4 theme experiment — see DECISIONS.md). Pure CSS: no JS of its own,
 * it just repaints automatically whenever ThemeEngine mutates the
 * variable, same as every button and border already does. Negative
 * z-index keeps it behind all real content, above only the flat ground
 * colour — restrained on purpose, felt as mood rather than seen as a
 * decoration.
 */
export function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-40"
      style={{
        background:
          "radial-gradient(60% 45% at 50% 0%, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent 70%)",
      }}
    />
  );
}
