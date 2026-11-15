import { DISEASES } from '../constants';

const TZ = { timeZone: 'America/Mazatlan' };

export const fmtDate  = (iso) => new Date(iso).toLocaleString('es-MX', TZ);
export const fmtShort = (iso) => new Date(iso).toLocaleDateString('es-MX', TZ);

/** 0.9734 → "97.3%"; valores ausentes → "—". */
export const fmtPct = (value, digits = 1) =>
  typeof value === 'number' && Number.isFinite(value) ? `${(value * 100).toFixed(digits)}%` : '—';

/** plural(2, 'estudio') → "estudios" */
export const plural = (n, singular, pluralForm = `${singular}s`) => (n === 1 ? singular : pluralForm);

/**
 * Normaliza el tipo de enfermedad a 'pneumonia' | 'covid' | 'tuberculosis'.
 * Acepta "pneumonia", "PNEUMONIA" o "DiseaseType.PNEUMONIA".
 */
export function diseaseKey(type) {
  const t = String(type ?? '').toLowerCase();
  if (t.includes('pneumonia')) return 'pneumonia';
  if (t.includes('covid'))     return 'covid';
  if (t.includes('tubercul'))  return 'tuberculosis';
  return null;
}

export const diseaseLabel = (type) => DISEASES[diseaseKey(type)]?.label ?? String(type ?? '—');

export const latestPrediction = (study) => study?.predictions?.[0] ?? null;

export const isPositive = (pred) => Boolean(pred) && !pred.prediction?.toLowerCase().includes('normal');

/** Pasa a texto legible lo que devuelve el backend ("PNEUMONIA", "0 hallazgo(s)"…). */
export const prettyText = (text = '') => text
  .replace(/YOLO detectó 0 hallazgo\(s\)/g, 'YOLO no detectó lesiones focales')
  .replace(/YOLO detectó (\d+) hallazgo\(s\)/g, (_, n) => `YOLO detectó ${n} ${n === '1' ? 'hallazgo' : 'hallazgos'}`)
  .replace(/\bPNEUMONIA\b/g, DISEASES.pneumonia.label)
  .replace(/\bCOVID\b(?!-)/g, DISEASES.covid.label)
  .replace(/\bTUBERCULOSIS\b/g, DISEASES.tuberculosis.label);
