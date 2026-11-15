import { useMemo, useState } from 'react';
import { Search, Users, X } from 'lucide-react';
import StudyCard from '../components/StudyCard';
import { EmptyState, ErrorState, Loader, PageHeader } from '../components/ui';
import { useStudies } from '../hooks/useStudies';
import { T, card } from '../theme';
import { plural } from '../utils/format';

const UNIDENTIFIED = 'Sin identificador';

/** Agrupa los estudios por paciente, del más reciente al más antiguo. */
export function groupByPatient(studies) {
  const groups = new Map();
  for (const s of studies) {
    const key = s.patient_identifier || UNIDENTIFIED;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  return groups;
}

function PatientButton({ name, count, selected, onSelect }) {
  return (
    <button onClick={onSelect} aria-pressed={selected} style={{
      ...card({
        marginBottom: 0, cursor: 'pointer', textAlign: 'left',
        borderLeft: `4px solid ${selected ? T.primary : 'transparent'}`,
        background: selected ? T.primaryLt : T.surface,
      }),
      border: `1px solid ${selected ? T.primaryBd : T.border}`,
      fontFamily: T.font,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: T.primaryLt, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Users size={14} color={T.primary} />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </div>
          <div style={{ fontSize: 11, color: T.textDim }}>{count} {plural(count, 'estudio')}</div>
        </div>
      </div>
    </button>
  );
}

export default function Patients() {
  const { studies, loading, error, reload } = useStudies({
    errorMessage: 'No se pudo cargar la lista de pacientes. Revisa que el servidor esté activo.',
  });
  const [selected, setSelected] = useState(null);
  const [query,    setQuery]    = useState('');

  const patients = useMemo(() => groupByPatient(studies), [studies]);
  const names = useMemo(
    () => [...patients.keys()].filter(name => name.toLowerCase().includes(query.trim().toLowerCase())),
    [patients, query],
  );

  const search = (value) => { setQuery(value); setSelected(null); };

  if (loading) return <Loader label="Cargando pacientes..." />;
  if (error)   return <ErrorState message={error} onRetry={() => reload()} />;

  const selectedStudies = selected ? patients.get(selected) : null;

  return (
    <div style={{ paddingBottom: 32, fontFamily: T.font }}>
      <PageHeader title="Pacientes">
        <span style={{ fontSize: 12, color: T.textDim }}>
          {names.length} de {patients.size} {plural(patients.size, 'paciente')}
        </span>
      </PageHeader>

      {patients.size === 0 ? (
        <EmptyState Icon={Users} message="No hay pacientes registrados aún" />
      ) : (
        <div className="patients-layout">
          <div className="patients-list" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8,
              border: `1px solid ${T.border}`, background: T.surface, marginBottom: 4,
            }}>
              <Search size={13} color={T.textDim} />
              <input type="search" placeholder="Buscar paciente..." aria-label="Buscar paciente"
                value={query} onChange={e => search(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: 12, fontFamily: T.font, color: T.text, background: 'transparent', width: '100%' }} />
              {query && (
                <button onClick={() => search('')} aria-label="Limpiar búsqueda"
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <X size={12} color={T.textDim} />
                </button>
              )}
            </div>

            {names.length === 0 ? (
              <div style={{ fontSize: 12, color: T.textDim, textAlign: 'center', padding: '20px 0' }}>Sin resultados</div>
            ) : names.map(name => (
              <PatientButton key={name} name={name} count={patients.get(name).length}
                selected={selected === name} onSelect={() => setSelected(name)} />
            ))}
          </div>

          {selectedStudies ? (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={card({ background: T.primaryLt, border: `1px solid ${T.primaryBd}`, marginBottom: 12 })}>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.primary }}>{selected}</div>
                <div style={{ fontSize: 12, color: T.textMid, marginTop: 4 }}>
                  {selectedStudies.length} {plural(selectedStudies.length, 'estudio')} en el sistema
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedStudies.map(s => <StudyCard key={s.id} study={s} shortDate />)}
              </div>
            </div>
          ) : (
            <EmptyState Icon={Users} message="Selecciona un paciente para ver sus estudios" style={{ flex: 1, marginBottom: 0 }} />
          )}
        </div>
      )}
    </div>
  );
}
