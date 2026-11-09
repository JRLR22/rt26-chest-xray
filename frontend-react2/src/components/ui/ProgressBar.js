import { T } from '../../theme';

/** Barra horizontal; `value` de 0 a 100. */
export default function ProgressBar({ value, color, height = 5, width }) {
  const pct = Math.max(0, Math.min(Number(value) || 0, 100));
  return (
    <div style={{ flex: width ? 'none' : 1, width, height, background: T.border, borderRadius: height, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: height, transition: 'width 0.4s ease' }} />
    </div>
  );
}
