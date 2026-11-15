import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Eye, Layers, Search } from 'lucide-react';
import { T, btn, card, sectionLabel } from '../theme';
import { prettyText } from '../utils/format';
import CompareSlider from './CompareSlider';
import DiseaseCard from './DiseaseCard';

const TAB_HINTS = {
  gradcam: 'Grad-CAM: zonas donde el modelo puso más atención. Rojo = mayor atención · azul = área normal.',
  yolo:    'YOLO: cuadros sobre posibles lesiones localizadas en la radiografía.',
  seg:     'U-Net: contorno de los pulmones, separado del resto de la imagen.',
};

const imageStyle = { width: '100%', borderRadius: 8, border: `1px solid ${T.border}` };
const unavailable = <div style={{ color: T.textDim, fontSize: 13, textAlign: 'center', padding: 20 }}>No disponible</div>;

function Conclusion({ result }) {
  const positive = result.ranking?.some(r => r.is_positive);
  const tone = positive
    ? { color: T.danger, bg: T.dangerLt, border: T.dangerBd }
    : { color: T.success, bg: T.successLt, border: '#a7f3d0' };
  return (
    <div className="reveal" style={card({ background: tone.bg, border: `1px solid ${tone.border}`, borderLeft: `4px solid ${tone.color}`, marginBottom: 16 })}>
      <div style={{ ...sectionLabel, color: tone.color, marginBottom: 6 }}>Conclusión del Sistema</div>
      <p style={{ margin: 0, fontSize: 13, color: T.text, lineHeight: 1.6 }}>{prettyText(result.conclusion)}</p>
    </div>
  );
}

function Disclaimer() {
  return (
    <div style={card({ background: T.warnLt, border: '1px solid #fde68a', marginBottom: 16, padding: '12px 16px' })}>
      <p style={{ margin: 0, fontSize: 12, color: '#78350f', lineHeight: 1.6, display: 'flex', gap: 8 }}>
        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>Prototipo de investigación y portafolio. Los resultados no constituyen un diagnóstico médico y deben ser revisados por un profesional de la salud.</span>
      </p>
    </div>
  );
}

function Visualizations({ result, original }) {
  const [tab, setTab] = useState('gradcam');
  const { gradcam, yolo, segmentation } = result;

  const tabs = [
    { key: 'gradcam', label: 'Grad-CAM', Icon: Eye },
    yolo?.available !== false && { key: 'yolo', label: `YOLO (${yolo?.total ?? 0})`, Icon: Search },
    { key: 'seg', label: 'Segmentación', Icon: Layers },
  ].filter(Boolean);

  return (
    <div style={card()}>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>Visualizaciones</div>
      <div style={{ fontSize: 11, color: T.textDim, marginBottom: 12 }}>{TAB_HINTS[tab]}</div>
      <div role="tablist" style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            style={btn(tab === t.key ? 'primary' : 'ghost', { fontSize: 12, padding: '6px 12px' })}>
            <t.Icon size={12} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'gradcam' && (gradcam?.heatmap_image
        ? (original
            ? <CompareSlider before={original} after={gradcam.heatmap_image} />
            : <img src={gradcam.heatmap_image} alt="Grad-CAM" style={imageStyle} />)
        : unavailable)}

      {tab === 'yolo' && (
        <div>
          {yolo?.image_url ? <img src={yolo.image_url} alt="Detecciones YOLO" style={{ ...imageStyle, marginBottom: 10 }} /> : unavailable}
          {yolo?.detections?.map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 6, background: T.bg, marginBottom: 4, fontSize: 12 }}>
              <span style={{ color: T.text }}>{d.class_name}</span>
              <span style={{ fontWeight: 700, color: T.primary }}>{(d.confidence * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'seg' && (segmentation?.image_url
        ? <img src={segmentation.image_url} alt="Segmentación pulmonar" style={imageStyle} />
        : unavailable)}
    </div>
  );
}

export function EmptyResults() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: T.textDim }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: T.primaryLt, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Activity size={28} color={T.primary} />
      </div>
      <p style={{ fontSize: 15, color: T.textMid, margin: '0 0 16px', fontWeight: 500 }}>Sube una radiografía para comenzar</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
        {['Ensemble 3 modelos por enfermedad', 'Grad-CAM · YOLO · U-Net', 'Soporte DICOM nativo'].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.textDim }}>
            <CheckCircle size={13} color={T.success} />{f}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Resultado completo de /predict: conclusión, ranking por enfermedad y visualizaciones. */
export default function AnalysisResults({ result, original }) {
  return (
    <div>
      <Conclusion result={result} />
      <Disclaimer />
      {result.ranking?.map((item, i) => <DiseaseCard key={item.disease} item={item} index={i} />)}
      <Visualizations result={result} original={original} />
    </div>
  );
}
