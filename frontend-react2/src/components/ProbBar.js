import { T } from '../theme';
import { ProgressBar } from './ui';

/** Etiqueta + porcentaje + barra; `value` de 0 a 1. */
export default function ProbBar({ label, value, color }) {
  const pct = value * 100;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: T.textMid }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: T.text }}>{pct.toFixed(1)}%</span>
      </div>
      <ProgressBar value={pct} color={color} height={6} />
    </div>
  );
}
