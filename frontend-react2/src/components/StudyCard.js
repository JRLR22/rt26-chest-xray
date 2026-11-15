import { Check } from 'lucide-react';
import { T, badge, card } from '../theme';
import { diseaseLabel, fmtDate, fmtPct, fmtShort, isPositive, latestPrediction } from '../utils/format';
import { ResultBadge } from './ui';

/** Fila de un estudio: enfermedad, fecha, resultado y confianza de la IA. */
export default function StudyCard({ study, showThumbnail = false, shortDate = false, actions = null }) {
  const pred  = latestPrediction(study);
  const isPos = isPositive(pred);

  return (
    <div style={card({
      marginBottom: 0, display: 'flex', gap: 16, alignItems: 'center',
      borderLeft: `4px solid ${isPos ? T.danger : T.success}`,
    })}>
      {showThumbnail && study.original_image_url && (
        <img src={study.original_image_url} alt="Radiografía" style={{
          width: 60, height: 60, borderRadius: 8, objectFit: 'cover',
          border: `1px solid ${T.border}`, flexShrink: 0,
        }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: shortDate ? 13 : 14, color: T.text }}>{diseaseLabel(study.disease_type)}</div>
          <div style={{ fontSize: 11, color: T.textDim, whiteSpace: 'nowrap' }}>
            {(shortDate ? fmtShort : fmtDate)(study.created_at)}
          </div>
        </div>
        {pred && (
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <ResultBadge positive={isPos} />
            <span style={{ fontSize: 12, color: T.textMid }}>
              Confianza: <strong style={{ color: T.text }}>{fmtPct(pred.confidence)}</strong>
            </span>
            {pred.is_validated && <span style={badge(T.success, T.successLt)}><Check size={10} />Validado</span>}
            {actions && <div style={{ marginLeft: 'auto' }}>{actions}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
