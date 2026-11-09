import { buildFHIRReport, buildStudiesCSV } from './export';

const study = {
  id: 'abcdef12-3456',
  disease_type: 'pneumonia',
  patient_identifier: 'P-001',
  created_at: '2026-01-15T10:00:00Z',
  predictions: [{ prediction: 'PNEUMONIA', confidence: 0.912, is_validated: true, validation_result: 'confirmed' }],
};

describe('buildFHIRReport', () => {
  test('genera un DiagnosticReport final para estudios validados', () => {
    const report = buildFHIRReport(study, study.predictions[0]);
    expect(report.resourceType).toBe('DiagnosticReport');
    expect(report.status).toBe('final');
    expect(report.subject.display).toBe('P-001');
    expect(report.conclusion).toBe('Hallazgo positivo: PNEUMONIA. Confianza IA: 91.2%.');
  });

  test('sin validar queda como preliminary', () => {
    const pred = { prediction: 'NORMAL', confidence: 0.8, is_validated: false };
    const report = buildFHIRReport({ ...study, patient_identifier: null }, pred);
    expect(report.status).toBe('preliminary');
    expect(report.subject.display).toBe('Paciente sin ID');
    expect(report.conclusion).toMatch(/^Sin hallazgos patológicos/);
  });
});

describe('buildStudiesCSV', () => {
  test('incluye encabezados y una fila por estudio', () => {
    const lines = buildStudiesCSV([study]).split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('"ID","Enfermedad","Resultado","Confianza","Validado","Fecha"');
    expect(lines[1]).toContain('"Neumonía","Positivo","91.2%","Sí"');
  });

  test('escapa las comillas', () => {
    const csv = buildStudiesCSV([{ ...study, id: 'a"b' }]);
    expect(csv).toContain('"a""b"');
  });
});
