// Shared glyphs for icons that appear more than once at different sizes:
// the courthouse (search page pitch row, drawer nav) and the group-of-three
// (search page pitch row only). Kept here so the two copies cannot drift, the
// way the capitol and person paths in the drawer nav and the pitch section
// once did. `size` renders at 28px on the pitch row and 20px in the drawer,
// both scaling the same 24x24 viewBox.

// stroke="currentColor" is the default so the icon works unstyled in the
// drawer, which colors it via `.drawer-icon { color: var(--muted) }`. A CSS
// rule beats a presentation attribute, so `.pitch-item svg { stroke: var(--blue) }`
// still overrides this on the search page.
export function CourthouseIcon({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className}>
      <line x1="4" y1="21" x2="20" y2="21" />
      <polyline points="4,10 12,4 20,10" />
      <rect x="6" y="10" width="12" height="11" />
      <line x1="9" y1="11" x2="9" y2="20" />
      <line x1="12" y1="11" x2="12" y2="20" />
      <line x1="15" y1="11" x2="15" y2="20" />
    </svg>
  );
}

// Three figures, side by side and not overlapping: the center person larger
// and in front conceptually, the two smaller ones at either side. Tried as
// overlapping shoulder arcs first; at this stroke weight the crossing lines
// read as a smudge rather than depth, so the three feet meet at a shared
// point instead of crossing.
export function GroupIcon({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className}>
      <circle cx="4.6" cy="10.6" r="1.9" />
      <path d="M1.6 20c0-2.7 1.4-4.3 3-4.3s3 1.6 3 4.3" strokeLinecap="round" />
      <circle cx="19.4" cy="10.6" r="1.9" />
      <path d="M16.4 20c0-2.7 1.4-4.3 3-4.3s3 1.6 3 4.3" strokeLinecap="round" />
      <circle cx="12" cy="8" r="2.6" />
      <path d="M7.6 20c0-3.4 2-5.3 4.4-5.3s4.4 1.9 4.4 5.3" strokeLinecap="round" />
    </svg>
  );
}
