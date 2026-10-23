/** Brand mark: two columns, echoing a board. */
export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--brand)" />
      <rect x="6" y="7" width="8" height="18" rx="2" fill="var(--on-brand)" />
      <rect x="18" y="7" width="8" height="11" rx="2" fill="var(--on-brand)" opacity=".75" />
    </svg>
  )
}
