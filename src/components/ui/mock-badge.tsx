// MockBadge component — visually marks UI sections that use placeholder data
// instead of real backend data. Renders an amber badge with optional tooltip.

interface MockBadgeProps {
  /** Optional label to show (defaults to "MOCK") */
  label?: string;
  /** Optional tooltip description of what is mocked */
  tooltip?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

/**
 * MockBadge — Shows users that this data section is not yet connected to the real backend.
 * Should be rendered inline next to section titles or data values that use placeholder data.
 *
 * @example
 * <h2>Total Balance <MockBadge tooltip="Balance calculation coming soon" /></h2>
 */
export function MockBadge({ label = 'MOCK', tooltip, size = 'sm' }: MockBadgeProps) {
  const baseClasses =
    'inline-flex items-center rounded font-bold uppercase tracking-wide bg-amber-400/20 text-amber-400 border border-amber-400/40 cursor-default select-none';

  const sizeClasses =
    size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[11px]';

  return (
    <span
      className={`${baseClasses} ${sizeClasses}`}
      title={tooltip}
      aria-label={tooltip ?? `${label} - placeholder data`}
    >
      {label}
    </span>
  );
}

export default MockBadge;
