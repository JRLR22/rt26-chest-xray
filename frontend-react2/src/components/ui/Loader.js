import { RefreshCw } from 'lucide-react';
import { T, spin } from '../../theme';

export default function Loader({ label = 'Cargando...' }) {
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      padding: 60, color: T.textMid, fontFamily: T.font,
    }}>
      <RefreshCw size={16} style={spin} /> {label}
    </div>
  );
}
