import { DATASETS } from '../constants';
import { T } from '../theme';

// Transparencia sobre el origen de los datos y el alcance real del modelo
export default function DataSources() {
  return (
    <details style={{ marginTop: 20, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
      <summary style={{ fontSize: 12, fontWeight: 600, color: T.textMid, cursor: 'pointer' }}>
        Fuentes de datos y limitaciones
      </summary>
      <div style={{ marginTop: 10, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 8px' }}>Los modelos se entrenaron con datasets públicos de Kaggle:</p>
        <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>
          {DATASETS.map(d => (
            <li key={d.name}>
              <a href={d.href} target="_blank" rel="noreferrer" style={{ color: T.primary }}>{d.name}</a>
              <span style={{ color: T.textDim }}> — {d.note}</span>
            </li>
          ))}
        </ul>
        <p style={{ margin: 0 }}>
          <strong>Limitaciones:</strong> como los datasets vienen de fuentes distintas, el modelo
          puede aprender rasgos propios de cada hospital o equipo (marcas, contraste, edad del paciente)
          en lugar de la enfermedad. Con radiografías de otros centros, o de pacientes distintos a los del
          entrenamiento, los resultados pueden ser poco fiables. Las métricas de COVID-19 y tuberculosis
          (AUC 1.000) son una señal de alerta, no de perfección. Más detalle en el README.
        </p>
      </div>
    </details>
  );
}
