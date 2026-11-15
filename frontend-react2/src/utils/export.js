import { MODEL_NAMES } from '../constants';
import { diseaseLabel, fmtDate, fmtPct, isPositive, latestPrediction } from './format';

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  // se libera en el siguiente tick: algunos navegadores cancelan la descarga si se revoca antes
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

const today = () => new Date().toISOString().slice(0, 10);

/** Construye un DiagnosticReport FHIR R4 con el resultado de la IA. */
export function buildFHIRReport(study, pred) {
  const confidence = fmtPct(pred?.confidence);
  return {
    resourceType: 'DiagnosticReport',
    id: study.id,
    status: pred?.is_validated ? 'final' : 'preliminary',
    code: { text: 'Radiografía de tórax — Análisis IA' },
    subject: { display: study.patient_identifier || 'Paciente sin ID' },
    effectiveDateTime: study.created_at,
    conclusion: isPositive(pred)
      ? `Hallazgo positivo: ${pred.prediction}. Confianza IA: ${confidence}.`
      : `Sin hallazgos patológicos. Confianza IA: ${confidence}.`,
    extension: [{
      url: 'http://sistemapulmonar.mx/fhir/extension',
      valueString: JSON.stringify({
        models: Object.values(MODEL_NAMES),
        confidence: pred?.confidence,
        validation_result: pred?.validation_result,
      }),
    }],
  };
}

export function exportFHIR(study, pred) {
  const report = buildFHIRReport(study, pred);
  downloadBlob(
    new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
    `FHIR_${study.id.slice(0, 8)}.json`,
  );
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export function buildStudiesCSV(studies) {
  const headers = ['ID', 'Enfermedad', 'Resultado', 'Confianza', 'Validado', 'Fecha'];
  const rows = studies.map(s => {
    const pred = latestPrediction(s);
    return [
      s.id,
      diseaseLabel(s.disease_type),
      isPositive(pred) ? 'Positivo' : 'Normal',
      fmtPct(pred?.confidence),
      pred?.is_validated ? 'Sí' : 'No',
      fmtDate(s.created_at),
    ];
  });
  return [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
}

export function exportStudiesCSV(studies) {
  // BOM para que Excel reconozca UTF-8 (acentos)
  downloadBlob(
    new Blob(['﻿' + buildStudiesCSV(studies)], { type: 'text/csv;charset=utf-8;' }),
    `historial_${today()}.csv`,
  );
}
