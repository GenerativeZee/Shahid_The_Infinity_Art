/** Fixed full-page film-grain overlay (SPEC.md §5.7). Pure CSS, no runtime cost. */
export function Grain() {
  return <div aria-hidden="true" className="grain-overlay" />;
}
