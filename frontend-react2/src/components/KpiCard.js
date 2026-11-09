import { T, card } from '../theme';

export default function KpiCard({ Icon, label, value, color, subtitle }) {
  return (
    <div style={card({
      flex: 1, minWidth: 130, borderTop: `3px solid ${color}`,
      display: 'flex', flexDirection: 'column', gap: 8,
    })}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 12, color: T.textMid, fontWeight: 500 }}>{label}</div>
      {subtitle && <div style={{ fontSize: 11, color: T.textDim }}>{subtitle}</div>}
    </div>
  );
}
