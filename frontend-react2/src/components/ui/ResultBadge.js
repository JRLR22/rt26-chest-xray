import { AlertTriangle, CheckCircle } from 'lucide-react';
import { T, badge } from '../../theme';

/** Insignia Positivo / Normal del resultado de la IA. */
export default function ResultBadge({ positive, prefix = '', color, size = 10, style }) {
  const fg = positive ? (color ?? T.danger) : T.success;
  const bg = positive ? (color ? color + '18' : T.dangerLt) : T.successLt;
  const Icon = positive ? AlertTriangle : CheckCircle;
  return (
    <span style={badge(fg, bg, style)}>
      <Icon size={size} />
      {prefix}{positive ? 'Positivo' : 'Normal'}
    </span>
  );
}
