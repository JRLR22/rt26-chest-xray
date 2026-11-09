import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { DISEASES } from '../constants';
import { T } from '../theme';

const share = (value, total) => (total > 0 ? ((value / total) * 100).toFixed(1) : '0.0');

/** Distribución de estudios por enfermedad (`data`: disease_distribution del backend). */
export default function DonutChart({ data }) {
  const slices = data.map(d => ({
    key: d.disease,
    name: DISEASES[d.disease]?.label ?? d.disease,
    color: DISEASES[d.disease]?.color ?? T.textDim,
    value: d.total || 0,
  }));
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const summary = slices.map(s => `${s.name} ${s.value}`).join(', ');

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginBottom: 16 }}>
        {slices.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.textMid }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontWeight: 500, color: T.text }}>{s.name}</span>
            <span style={{ color: T.textDim }}>{s.value} ({share(s.value, total)}%)</span>
          </div>
        ))}
      </div>
      <div role="img" aria-label={`Distribución: ${summary}`} style={{ position: 'relative', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={total > 0 ? slices : [{ key: 'empty', name: 'Sin datos', value: 1, color: T.border }]}
              dataKey="value" nameKey="name"
              innerRadius="65%" outerRadius="95%"
              stroke={T.surface} strokeWidth={3}
              animationDuration={600}
            >
              {(total > 0 ? slices : [{ key: 'empty', color: T.border }]).map(s => <Cell key={s.key} fill={s.color} />)}
            </Pie>
            {total > 0 && (
              <Tooltip
                formatter={(value, name) => [`${value} (${share(value, total)}%)`, name]}
                contentStyle={{
                  background: 'rgba(15,31,56,0.92)', border: 'none', borderRadius: 8,
                  fontSize: 12, padding: '8px 12px',
                }}
                itemStyle={{ color: '#fff' }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          {total > 0 ? (
            <>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.02em', lineHeight: 1 }}>{total}</div>
              <div style={{ fontSize: 10, color: T.textDim, marginTop: 3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                estudios
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: T.textDim }}>Sin datos</div>
          )}
        </div>
      </div>
    </div>
  );
}
