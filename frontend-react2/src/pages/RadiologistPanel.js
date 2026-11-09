import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, ChevronRight, ClipboardList, Clock, Eye, Share2 } from 'lucide-react';
import ValidationModal, { VALIDATION_RESULTS } from '../components/ValidationModal';
import { EmptyState, ErrorState, Loader, PageHeader, ResultBadge } from '../components/ui';
import { useStudies } from '../hooks/useStudies';
import { T, badge, btn, card } from '../theme';
import { diseaseLabel, fmtDate, fmtPct, isPositive, latestPrediction, plural } from '../utils/format';
import { exportFHIR } from '../utils/export';

const POLL_MS = 30_000;
const resultMeta = (value) => VALIDATION_RESULTS[value] ?? VALIDATION_RESULTS.inconclusive;

const TABS = [
  { key: 'queue', label: 'Cola de revisión', Icon: ClipboardList },
  { key: 'audit', label: 'Audit trail',      Icon: Eye },
];

const truncate = (text, max) => (text.length > max ? `${text.slice(0, max)}…` : text);

function QueueItem({ study, pred, onValidate }) {
  const isPos = isPositive(pred);
  const validated = pred.is_validated;
  const res = validated ? resultMeta(pred.validation_result) : null;

  return (
    <div style={card({
      marginBottom: 0, display: 'flex', gap: 14, alignItems: 'center',
      borderLeft: `4px solid ${validated ? T.success : (isPos ? T.danger : T.primary)}`,
    })}>
      {study.original_image_url && (
        <img src={study.original_image_url} alt="Radiografía" style={{
          width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: `1px solid ${T.border}`, flexShrink: 0,
        }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{diseaseLabel(study.disease_type)}</div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
              ID: {study.id.slice(0, 8)}… · {fmtDate(study.created_at)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {res && <span style={badge(res.color, res.bg)}><res.Icon size={10} />{res.label}</span>}
            {validated ? (
              <button onClick={() => exportFHIR(study, pred)} style={btn('ghost', { fontSize: 11, padding: '4px 10px' })}>
                <Share2 size={11} /> FHIR
              </button>
            ) : (
              <button onClick={onValidate} style={btn('primary', { fontSize: 12 })}>
                Validar <ChevronRight size={13} />
              </button>
            )}
          </div>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <ResultBadge positive={isPos} prefix="IA: " />
          <span style={{ fontSize: 12, color: T.textMid }}>
            Confianza: <strong style={{ color: T.text }}>{fmtPct(pred.confidence)}</strong>
          </span>
          {validated && pred.radiologist_notes && (
            <span style={{ fontSize: 11, color: T.primary, fontStyle: 'italic' }}>"{truncate(pred.radiologist_notes, 60)}"</span>
          )}
        </div>
      </div>
    </div>
  );
}

function AuditTable({ entries }) {
  const cell = { padding: '10px 14px' };
  return (
    <>
      <div style={{ fontSize: 12, color: T.textDim, marginBottom: 12 }}>
        {entries.length} {plural(entries.length, 'validación', 'validaciones')} {plural(entries.length, 'registrada')}
      </div>
      <div style={{ border: `1px solid ${T.border}`, borderRadius: T.radius, overflowX: 'auto', background: T.surface }}>
        <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 13, fontFamily: T.font }}>
          <thead>
            <tr style={{ background: T.bg }}>
              {['Fecha', 'Enfermedad', 'Pred. IA', 'Confianza', 'Decisión', 'Notas'].map(h => (
                <th key={h} style={{
                  ...cell, textAlign: 'left', color: T.textMid, fontWeight: 600, fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${T.border}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(({ study, pred }) => {
              const res = resultMeta(pred.validation_result);
              return (
                <tr key={pred.id ?? study.id} style={{ borderBottom: `1px solid ${T.borderDim}` }}>
                  <td style={{ ...cell, color: T.textMid, fontSize: 12, whiteSpace: 'nowrap' }}>
                    {pred.validated_at ? fmtDate(pred.validated_at) : '—'}
                  </td>
                  <td style={{ ...cell, fontWeight: 600 }}>{diseaseLabel(study.disease_type)}</td>
                  <td style={cell}><ResultBadge positive={isPositive(pred)} /></td>
                  <td style={{ ...cell, fontWeight: 700, color: T.primary }}>{fmtPct(pred.confidence)}</td>
                  <td style={cell}><span style={badge(res.color, res.bg)}><res.Icon size={10} />{res.label}</span></td>
                  <td style={{
                    ...cell, color: T.primary, fontStyle: pred.radiologist_notes ? 'italic' : 'normal',
                    maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {pred.radiologist_notes || <span style={{ color: T.textDim }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function RadiologistPanel({ onPendingCountChange }) {
  const { studies, loading, error, reload } = useStudies({ pollMs: POLL_MS });
  const [filter,   setFilter]   = useState('pending');
  const [tab,      setTab]      = useState('queue');
  const [selected, setSelected] = useState(null);
  const closeModal = useCallback(() => setSelected(null), []);

  const { all, pending, validated, auditEntries } = useMemo(() => {
    const entries = studies.map(study => ({ study, pred: latestPrediction(study) })).filter(e => e.pred);
    const done = entries.filter(e => e.pred.is_validated);
    return {
      all: entries,
      pending: entries.filter(e => !e.pred.is_validated),
      validated: done,
      auditEntries: [...done].sort((a, b) => new Date(b.pred.validated_at) - new Date(a.pred.validated_at)),
    };
  }, [studies]);
  const queue = { pending, validated, all }[filter];

  // mantiene sincronizado el contador de la barra lateral
  useEffect(() => {
    if (!loading && !error) onPendingCountChange?.(pending.length);
  }, [pending.length, loading, error, onPendingCountChange]);

  const filters = [
    { key: 'pending',   label: `Pendientes (${pending.length})` },
    { key: 'validated', label: `Validados (${validated.length})` },
    { key: 'all',       label: 'Todos' },
  ];

  const renderQueue = () => {
    if (loading) return <Loader label="Cargando estudios..." />;
    if (error)   return <ErrorState message={error} onRetry={() => reload()} />;
    if (queue.length === 0) {
      return filter === 'pending'
        ? <EmptyState Icon={CheckCircle} iconColor={T.success} message="Sin estudios pendientes" />
        : <EmptyState Icon={ClipboardList} message="Sin estudios en este filtro" />;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {queue.map(({ study, pred }) => (
          <QueueItem key={study.id} study={study} pred={pred} onValidate={() => setSelected({ study, pred })} />
        ))}
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: 32, fontFamily: T.font }}>
      <PageHeader title="Panel Radiólogo">
        <span style={badge(T.warn, T.warnLt)}><Clock size={10} />{pending.length} pendientes</span>
        <span style={badge(T.success, T.successLt)}><CheckCircle size={10} />{validated.length} validados</span>
      </PageHeader>

      <div role="tablist" style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: `2px solid ${T.border}` }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button key={t.key} role="tab" aria-selected={active} onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', border: 'none', cursor: 'pointer', fontSize: 13,
              fontWeight: active ? 700 : 400, fontFamily: T.font, background: 'transparent',
              borderBottom: `2px solid ${active ? T.primary : 'transparent'}`,
              color: active ? T.primary : T.textMid, marginBottom: -2,
            }}>
              <t.Icon size={14} />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'queue' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} aria-pressed={filter === f.key} style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: T.font,
                background: filter === f.key ? T.primary : T.border,
                color: filter === f.key ? '#fff' : T.textMid,
              }}>{f.label}</button>
            ))}
          </div>
          {renderQueue()}
        </>
      )}

      {tab === 'audit' && (auditEntries.length === 0
        ? <EmptyState Icon={Eye} message="No hay validaciones registradas aún" />
        : <AuditTable entries={auditEntries} />)}

      {selected && (
        <ValidationModal
          study={selected.study} pred={selected.pred}
          onClose={closeModal}
          onSaved={() => { setSelected(null); reload(true); }}
        />
      )}
    </div>
  );
}
