import { useRef, useState } from 'react';
import { AlertCircle, RefreshCw, Search, Upload } from 'lucide-react';
import { api } from '../api/client';
import AnalysisResults, { EmptyResults } from '../components/AnalysisResults';
import DataSources from '../components/DataSources';
import { MAX_UPLOAD_BYTES, SAMPLES } from '../constants';
import { T, btn, card, sectionLabel, spin } from '../theme';

const panelStyle = { background: T.surface, borderRadius: T.radiusLg, padding: 24, boxShadow: T.shadow, border: `1px solid ${T.border}` };
const panelTitle = { fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: '-0.01em' };
const isDicomFile = (f) => f.name.toLowerCase().endsWith('.dcm');

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function DicomMetadata({ metadata }) {
  const rows = [
    ['Paciente', metadata.patient_name],
    ['Fecha', metadata.study_date_formatted],
    ['Modalidad', metadata.modality],
    ['Institución', metadata.institution],
  ].filter(([, v]) => v);
  return (
    <div style={card({ background: T.primaryLt, border: `1px solid ${T.primaryBd}`, marginBottom: 16 })}>
      <div style={{ ...sectionLabel, color: T.primary, marginBottom: 10 }}>Metadatos DICOM</div>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 12 }}>
          <span style={{ color: T.textMid, minWidth: 72 }}>{label}</span>
          <strong style={{ color: T.text }}>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Analysis() {
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);
  const [dragging, setDragging] = useState(false);
  const [runId,    setRunId]    = useState(0); // reinicia las pestañas en cada análisis
  const inputRef = useRef(null);

  const isDicom = Boolean(file && isDicomFile(file));

  const loadFile = async (f) => {
    if (!f) return;
    if (f.size > MAX_UPLOAD_BYTES) { setError('Máximo 10 MB'); return; }
    setFile(f); setError(null); setResult(null); setPreview(null);
    if (isDicomFile(f)) return; // el navegador no puede previsualizar DICOM
    try { setPreview(await readAsDataURL(f)); } catch { setError('No se pudo leer la imagen'); }
  };

  const loadSample = async (src) => {
    try {
      const blob = await (await fetch(src)).blob();
      loadFile(new File([blob], src.split('/').pop(), { type: blob.type }));
    } catch {
      setError('No se pudo cargar la imagen de ejemplo');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setError(null);
    try {
      setResult(await api.predict(file, { dicom: isDicom }));
      setRunId(n => n + 1);
    } catch (e) {
      setError(e instanceof TypeError ? 'No se pudo conectar con el servidor. Revisa que esté activo.' : e.message);
    } finally {
      setLoading(false);
    }
  };

  const openPicker = () => inputRef.current?.click();
  const previewSrc = preview || (isDicom && result?.gradcam?.heatmap_image) || null;

  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontFamily: T.font }}>
      <div className="upload-panel" style={panelStyle}>
        <h2 style={{ ...panelTitle, margin: '0 0 6px' }}>Subir Radiografía</h2>
        <p style={{ color: T.textMid, fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
          Análisis automático de neumonía, COVID-19 y tuberculosis. Soporta JPG, PNG y DICOM.
        </p>

        <div
          className={`dropzone${dragging ? ' is-dragging' : ''}`}
          role="button" tabIndex={0}
          aria-label="Seleccionar o soltar una radiografía"
          onClick={openPicker}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(); } }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files?.[0]); }}>
          <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.dcm" hidden
            onChange={e => { loadFile(e.target.files[0]); e.target.value = ''; }} />
          <div style={{ width: 44, height: 44, borderRadius: 10, background: T.primaryLt, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Upload size={20} color={T.primary} />
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, color: T.text, marginBottom: 4 }}>
            {isDicom ? file.name : 'Seleccionar archivo'}
          </div>
          <div style={{ color: T.textDim, fontSize: 12 }}>
            {dragging ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic · JPG, PNG, DICOM · máx. 10 MB'}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ ...sectionLabel, fontWeight: 600, color: T.textDim, marginBottom: 8 }}>O prueba con un ejemplo</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {SAMPLES.map((src, i) => (
              <button key={src} onClick={() => loadSample(src)} disabled={loading} className="sample-btn"
                aria-label={`Cargar radiografía de ejemplo ${i + 1}`}
                style={{ padding: 0, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', flex: 1, background: T.bg }}>
                <img src={src} alt={`Ejemplo ${i + 1}`} style={{ width: '100%', height: 72, objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>
        </div>

        {previewSrc && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <img src={previewSrc} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 10, border: `1px solid ${T.border}`, boxShadow: T.shadow }} />
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 6 }}>{file?.name}</div>
          </div>
        )}

        {isDicom && result?.dicom_metadata && <DicomMetadata metadata={result.dicom_metadata} />}

        <button onClick={handleAnalyze} disabled={!file || loading} style={{
          ...btn('primary', { width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14, borderRadius: 10 }),
          opacity: (!file || loading) ? 0.6 : 1,
        }}>
          {loading
            ? <><RefreshCw size={15} style={spin} />{isDicom ? 'Procesando DICOM...' : 'Analizando...'}</>
            : <><Search size={15} />Analizar</>}
        </button>

        {error && (
          <div role="alert" style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: T.dangerLt, color: T.danger, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={13} />{error}
          </div>
        )}
      </div>

      <div className="results-panel" style={panelStyle}>
        <h2 style={{ ...panelTitle, margin: '0 0 20px' }}>Resultados</h2>
        {result
          ? <AnalysisResults key={runId} result={result} original={isDicom ? null : preview} />
          : <EmptyResults />}
        <DataSources />
      </div>
    </div>
  );
}
