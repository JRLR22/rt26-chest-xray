import { useMemo, useState } from 'react';
import { ClipboardList, Download, X } from 'lucide-react';
import { api } from '../api/client';
import StudyCard from '../components/StudyCard';
import { EmptyState, ErrorState, Loader, PageHeader } from '../components/ui';
import { DISEASES } from '../constants';
import { useStudies } from '../hooks/useStudies';
import { T, btn, card } from '../theme';
import { diseaseKey, isPositive, latestPrediction, plural } from '../utils/format';
import { downloadBlob, exportStudiesCSV } from '../utils/export';

const EMPTY_FILTERS = { disease: 'all', result: 'all', validation: 'all', from: '', to: '' };

const FILTER_OPTIONS = {
  disease: {
    label: 'Enfermedad',
    options: [['all', 'Todas'], ...Object.entries(DISEASES).map(([key, d]) => [key, d.label])],
  },
  result: {
    label: 'Resultado',
    options: [['all', 'Todos'], ['positive', 'Positivo'], ['normal', 'Normal']],
  },
  validation: {
    label: 'Validación',
    options: [['all', 'Todas'], ['validated', 'Validado'], ['pending', 'Sin validar']],
  },
};

const controlStyle = {
  padding: '6px 10px', borderRadius: 7, border: `1px solid ${T.border}`,
  fontSize: 12, fontFamily: T.font, color: T.text, background: T.surface,
  outline: 'none', cursor: 'pointer',
};

function Field({ id, label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label htmlFor={id} style={{ fontSize: 10, fontWeight: 600, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function matchesFilters(study, { disease, result, validation, from, to }) {
  const pred  = latestPrediction(study);
  const isPos = isPositive(pred);
  const date  = new Date(study.created_at);

  if (disease !== 'all' && diseaseKey(study.disease_type) !== disease) return false;
  if (result === 'positive' && !isPos) return false;
  if (result === 'normal'   && isPos)  return false;
  if (validation === 'validated' && !pred?.is_validated) return false;
  if (validation === 'pending'   &&  pred?.is_validated) return false;
  if (from && date < new Date(`${from}T00:00:00`)) return false;
  if (to   && date > new Date(`${to}T23:59:59`))   return false;
  return true;
}

export default function History() {
  const { studies, loading, error, setError, reload } = useStudies({
    errorMessage: 'No se pudo cargar el historial. Revisa que el servidor esté activo.',
  });
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const filtered = useMemo(() => studies.filter(s => matchesFilters(s, filters)), [studies, filters]);
  const hasFilters = Object.keys(EMPTY_FILTERS).some(k => filters[k] !== EMPTY_FILTERS[k]);
  const setFilter = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }));

  const downloadPDF = (studyId) => {
    api.studyReport(studyId)
      .then(blob => downloadBlob(blob, `reporte_${studyId.slice(0, 8)}.pdf`))
      .catch(() => setError('No se pudo descargar el PDF. Inténtalo de nuevo.'));
  };

  if (loading) return <Loader label="Cargando historial..." />;
  if (error && studies.length === 0) return <ErrorState message={error} onRetry={() => reload()} />;

  return (
    <div style={{ paddingBottom: 32, fontFamily: T.font }}>
      <PageHeader title="Historial de Estudios">
        <span style={{ fontSize: 12, color: T.textDim }}>
          {filtered.length} de {studies.length} {plural(studies.length, 'registro')}
        </span>
        {filtered.length > 0 && (
          <button onClick={() => exportStudiesCSV(filtered)} style={btn('ghost', { fontSize: 12, padding: '5px 12px' })}>
            <Download size={12} /> Exportar CSV
          </button>
        )}
      </PageHeader>

      {error && <div style={{ marginBottom: 12 }}><ErrorState message={error} /></div>}

      <div style={{ ...card({ marginBottom: 16 }), display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
        {Object.entries(FILTER_OPTIONS).map(([key, { label, options }]) => (
          <Field key={key} id={`filter-${key}`} label={label}>
            <select id={`filter-${key}`} value={filters[key]} onChange={setFilter(key)} style={controlStyle}>
              {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </Field>
        ))}
        <Field id="filter-from" label="Desde">
          <input id="filter-from" type="date" value={filters.from} onChange={setFilter('from')} style={controlStyle} />
        </Field>
        <Field id="filter-to" label="Hasta">
          <input id="filter-to" type="date" value={filters.to} onChange={setFilter('to')} style={controlStyle} />
        </Field>
        {hasFilters && (
          <button onClick={() => setFilters(EMPTY_FILTERS)} style={btn('ghost', { fontSize: 12, padding: '6px 12px' })}>
            <X size={12} /> Limpiar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState Icon={ClipboardList}
          message={studies.length === 0 ? 'No hay estudios registrados aún' : 'Ningún estudio coincide con los filtros'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(study => (
            <StudyCard key={study.id} study={study} showThumbnail actions={
              <button onClick={() => downloadPDF(study.id)} style={btn('ghost', { padding: '3px 10px', fontSize: 11 })}>
                <Download size={11} /> PDF
              </button>
            } />
          ))}
        </div>
      )}
    </div>
  );
}
