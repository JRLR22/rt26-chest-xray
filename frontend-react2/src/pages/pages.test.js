import { matchesFilters } from './History';
import { groupByPatient } from './Patients';

const make = (overrides = {}) => ({
  id: Math.random().toString(36).slice(2),
  disease_type: 'pneumonia',
  created_at: '2026-03-10T12:00:00Z',
  predictions: [{ prediction: 'PNEUMONIA', confidence: 0.9, is_validated: false }],
  ...overrides,
});
const ALL = { disease: 'all', result: 'all', validation: 'all', from: '', to: '' };

describe('matchesFilters', () => {
  test('sin filtros acepta todo', () => expect(matchesFilters(make(), ALL)).toBe(true));

  test('filtra por enfermedad', () => {
    expect(matchesFilters(make(), { ...ALL, disease: 'pneumonia' })).toBe(true);
    expect(matchesFilters(make(), { ...ALL, disease: 'covid' })).toBe(false);
  });

  test('filtra por resultado y validación', () => {
    const normal = make({ predictions: [{ prediction: 'NORMAL', is_validated: true }] });
    expect(matchesFilters(normal, { ...ALL, result: 'normal' })).toBe(true);
    expect(matchesFilters(normal, { ...ALL, result: 'positive' })).toBe(false);
    expect(matchesFilters(normal, { ...ALL, validation: 'pending' })).toBe(false);
    expect(matchesFilters(normal, { ...ALL, validation: 'validated' })).toBe(true);
  });

  test('filtra por rango de fechas', () => {
    expect(matchesFilters(make(), { ...ALL, from: '2026-03-01', to: '2026-03-31' })).toBe(true);
    expect(matchesFilters(make(), { ...ALL, from: '2026-04-01' })).toBe(false);
    expect(matchesFilters(make(), { ...ALL, to: '2026-02-28' })).toBe(false);
  });
});

describe('groupByPatient', () => {
  test('agrupa por identificador y ordena del más reciente al más antiguo', () => {
    const studies = [
      make({ id: 'old', patient_identifier: 'P1', created_at: '2026-01-01T00:00:00Z' }),
      make({ id: 'new', patient_identifier: 'P1', created_at: '2026-02-01T00:00:00Z' }),
      make({ id: 'anon', patient_identifier: null }),
    ];
    const groups = groupByPatient(studies);
    expect([...groups.keys()]).toEqual(['P1', 'Sin identificador']);
    expect(groups.get('P1').map(s => s.id)).toEqual(['new', 'old']);
  });

  test('no modifica el arreglo original', () => {
    const studies = [make({ patient_identifier: 'P1' })];
    const copy = [...studies];
    groupByPatient(studies);
    expect(studies).toEqual(copy);
  });
});
