import { useEffect, useState } from 'react';
import { AlertCircle, Check, HelpCircle, RefreshCw, X } from 'lucide-react';
import { api } from '../api/client';
import { T, btn, card, sectionLabel, spin } from '../theme';
import { diseaseLabel, fmtDate, fmtPct, isPositive } from '../utils/format';
import { ResultBadge } from './ui';

export const VALIDATION_RESULTS = {
  confirmed:    { label: 'Confirmado',   action: 'Confirmar',    Icon: Check,      color: T.success, bg: T.successLt },
  rejected:     { label: 'Rechazado',    action: 'Rechazar IA',  Icon: X,          color: T.danger,  bg: T.dangerLt },
  inconclusive: { label: 'Inconclusivo', action: 'Inconclusivo', Icon: HelpCircle, color: T.warn,    bg: T.warnLt },
};

/** Diálogo donde el radiólogo confirma, rechaza o marca como inconclusa la predicción. */
export default function ValidationModal({ study, pred, onClose, onSaved }) {
  const [result,  setResult]  = useState('confirmed');
  const [notes,   setNotes]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async () => {
    setSaving(true); setError(null);
    try {
      await api.validatePrediction(pred.id, { result, notes: notes.trim() });
      onSaved();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  const visuals = [
    [pred.gradcam_image_url, 'Grad-CAM'],
    [pred.yolo_image_url, 'YOLO'],
    [pred.segmentation_image_url, 'U-Net'],
  ].filter(([url]) => url);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,31,56,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', fontFamily: T.font,
    }}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="validation-title" style={{
        background: T.surface, borderRadius: T.radiusLg, padding: 28,
        width: '90%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 id="validation-title" style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.text }}>Validar Estudio</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMid }}>{diseaseLabel(study.disease_type)}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={btn('ghost', { padding: 8, borderRadius: '50%' })}>
            <X size={16} />
          </button>
        </div>

        <div style={card({ display: 'flex', gap: 14, marginBottom: 16 })}>
          {study.original_image_url && (
            <img src={study.original_image_url} alt="Radiografía" style={{
              width: 72, height: 72, borderRadius: 8, objectFit: 'cover', border: `1px solid ${T.border}`, flexShrink: 0,
            }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: T.textMid, marginBottom: 6 }}>{fmtDate(study.created_at)}</div>
            <div style={{ marginBottom: 6 }}><ResultBadge positive={isPositive(pred)} prefix="IA: " /></div>
            <div style={{ fontSize: 12, color: T.textMid }}>
              Confianza IA: <strong style={{ color: T.primary }}>{fmtPct(pred.confidence)}</strong>
            </div>
          </div>
        </div>

        {visuals.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
            {visuals.map(([url, label]) => (
              <div key={label} style={{ textAlign: 'center', flexShrink: 0 }}>
                <img src={url} alt={label} style={{ width: 110, height: 90, objectFit: 'cover', borderRadius: 8, border: `1px solid ${T.border}` }} />
                <div style={{ fontSize: 10, color: T.textDim, marginTop: 4, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px' }}>
          <legend style={{ ...sectionLabel, fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 10, padding: 0 }}>
            Decisión del radiólogo
          </legend>
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(VALIDATION_RESULTS).map(([value, opt]) => {
              const active = result === value;
              return (
                <button key={value} type="button" onClick={() => setResult(value)} aria-pressed={active} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, fontFamily: T.font,
                  border: `2px solid ${active ? opt.color : T.border}`,
                  background: active ? opt.bg : T.surface,
                  color: active ? opt.color : T.textMid,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <opt.Icon size={13} />{opt.action}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="validation-notes" style={{ ...sectionLabel, display: 'block', fontSize: 12, fontWeight: 600, color: T.textMid, marginBottom: 8 }}>
            Notas <span style={{ fontWeight: 400, opacity: 0.6, textTransform: 'none' }}>(opcional)</span>
          </label>
          <textarea id="validation-notes" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Hallazgos clínicos, recomendaciones..." rows={3}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
              border: `1px solid ${T.border}`, resize: 'vertical', fontFamily: T.font,
              boxSizing: 'border-box', outline: 'none', color: T.text,
            }} />
        </div>

        {error && (
          <div role="alert" style={{ ...card({ background: T.dangerLt, border: `1px solid ${T.dangerBd}`, marginBottom: 12 }), color: T.danger, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <AlertCircle size={14} />{error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btn('ghost')}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} style={btn('primary', { opacity: saving ? 0.6 : 1 })}>
            {saving
              ? <><RefreshCw size={13} style={spin} />Guardando...</>
              : <><Check size={13} />Guardar validación</>}
          </button>
        </div>
      </div>
    </div>
  );
}
