import { T, card } from '../../theme';

export default function EmptyState({ Icon, message, iconColor, padding = 60, style }) {
  return (
    <div style={{ ...card(), textAlign: 'center', padding, color: T.textDim, ...style }}>
      {Icon && <Icon size={40} style={{ marginBottom: 12, opacity: 0.3, color: iconColor }} />}
      <p style={{ margin: 0, fontSize: 13 }}>{message}</p>
    </div>
  );
}
