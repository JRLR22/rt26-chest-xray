import { Activity } from 'lucide-react';
import { DISEASES, MODEL_NAMES } from '../constants';
import { T, card } from '../theme';
import ProbBar from './ProbBar';
import { ResultBadge } from './ui';

/** Resultado del ensemble para una enfermedad (un elemento de `ranking`). */
export default function DiseaseCard({ item, index }) {
  const meta  = DISEASES[item.disease] ?? { label: item.disease, color: T.primary, Icon: Activity };
  const isPos = item.is_positive;
  const tone  = isPos ? meta.color : T.success;
  const classNames = Object.keys(item.probabilities ?? {});

  return (
    <div className="reveal" style={card({ '--i': index + 1, borderLeft: `4px solid ${tone}`, opacity: index === 0 ? 1 : 0.8, marginBottom: 10 })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: meta.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <meta.Icon size={18} color={meta.color} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>#{item.rank} {meta.label}</div>
            <ResultBadge positive={isPos} color={meta.color} size={9} style={{ fontSize: 10 }} />
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 20,
            background: tone, color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em',
          }}>
            {(item.probability_disease * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>probabilidad de enfermedad</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <ProbBar label="Confianza del modelo en este veredicto" value={item.confidence} color={tone} />
      </div>

      {item.ensemble_detail && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontSize: 11, color: T.textDim, cursor: 'pointer', userSelect: 'none' }}>
            Ver detalle por modelo
          </summary>
          <div style={{ marginTop: 10, paddingLeft: 4 }}>
            {Object.entries(item.ensemble_detail).map(([model, probs]) => (
              <div key={model} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.textMid, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {MODEL_NAMES[model] ?? model}
                </div>
                {probs.map((p, i) => <ProbBar key={i} label={classNames[i]} value={p} color={meta.color} />)}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
