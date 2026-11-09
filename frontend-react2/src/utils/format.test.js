import { diseaseKey, diseaseLabel, fmtPct, isPositive, plural, prettyText } from './format';

describe('diseaseKey / diseaseLabel', () => {
  test.each([
    ['pneumonia', 'pneumonia', 'Neumonía'],
    ['PNEUMONIA', 'pneumonia', 'Neumonía'],
    ['DiseaseType.COVID', 'covid', 'COVID-19'],
    ['tuberculosis', 'tuberculosis', 'Tuberculosis'],
  ])('%s → %s', (input, key, label) => {
    expect(diseaseKey(input)).toBe(key);
    expect(diseaseLabel(input)).toBe(label);
  });

  test('un tipo desconocido se muestra tal cual', () => {
    expect(diseaseKey('otro')).toBeNull();
    expect(diseaseLabel('otro')).toBe('otro');
  });
});

describe('isPositive', () => {
  test('sin predicción no es positivo', () => expect(isPositive(null)).toBe(false));
  test('NORMAL no es positivo', () => expect(isPositive({ prediction: 'NORMAL' })).toBe(false));
  test('cualquier otra clase es positiva', () => expect(isPositive({ prediction: 'PNEUMONIA' })).toBe(true));
});

describe('fmtPct', () => {
  test('formatea fracciones', () => expect(fmtPct(0.9734)).toBe('97.3%'));
  test('valores ausentes', () => {
    expect(fmtPct(undefined)).toBe('—');
    expect(fmtPct(NaN)).toBe('—');
  });
});

test('plural', () => {
  expect(plural(1, 'estudio')).toBe('estudio');
  expect(plural(3, 'estudio')).toBe('estudios');
  expect(plural(2, 'validación', 'validaciones')).toBe('validaciones');
});

describe('prettyText', () => {
  test('traduce las clases del backend', () => {
    expect(prettyText('Hallazgo: PNEUMONIA y COVID')).toBe('Hallazgo: Neumonía y COVID-19');
  });
  test('no duplica COVID-19', () => {
    expect(prettyText('COVID-19')).toBe('COVID-19');
  });
  test('redacta los hallazgos de YOLO', () => {
    expect(prettyText('YOLO detectó 0 hallazgo(s)')).toBe('YOLO no detectó lesiones focales');
    expect(prettyText('YOLO detectó 1 hallazgo(s)')).toBe('YOLO detectó 1 hallazgo');
    expect(prettyText('YOLO detectó 4 hallazgo(s)')).toBe('YOLO detectó 4 hallazgos');
  });
});
