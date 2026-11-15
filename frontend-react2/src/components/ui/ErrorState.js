import { AlertCircle, RefreshCw } from 'lucide-react';
import { T } from '../../theme';

/** Mensaje de error con botón opcional de reintento. */
export default function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" style={{
      padding: '24px 20px', borderRadius: T.radius, background: T.dangerLt, color: T.danger,
      border: `1px solid ${T.dangerBd}`, display: 'flex', alignItems: 'center', gap: 12,
      flexWrap: 'wrap', fontFamily: T.font, fontSize: 13,
    }}>
      <AlertCircle size={16} />
      <span style={{ flex: 1, minWidth: 180 }}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
          cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: T.font,
          background: T.surface, color: T.danger, border: `1px solid ${T.dangerBd}`,
        }}>
          <RefreshCw size={12} /> Reintentar
        </button>
      )}
    </div>
  );
}
