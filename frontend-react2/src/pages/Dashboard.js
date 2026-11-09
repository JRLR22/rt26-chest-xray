import { useCallback, useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle, Clock, Cpu, Hospital, Layers } from 'lucide-react';
import { api } from '../api/client';
import DonutChart from '../components/DonutChart';
import KpiCard from '../components/KpiCard';
import { ErrorState, Loader, PageHeader, ProgressBar } from '../components/ui';
import { DISEASES } from '../constants';
import { T, badge, card } from '../theme';
import { plural } from '../utils/format';

const TIMELINE_DAYS = 14;
const tableCell = { padding: '12px 12px' };
const cardTitle = { fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 16 };
const noData = <div style={{ textAlign: 'center', padding: 40, color: T.textDim, fontSize: 13 }}>Sin datos aún</div>;

function ModelMetrics({ metrics }) {
  const items = [
    { label: 'Neumonía',     value: metrics.pneumonia_accuracy,    note: 'AUC 0.972' },
    { label: 'COVID-19',     value: metrics.covid_accuracy,        note: 'AUC 1.000 ⚠️' },
    { label: 'Tuberculosis', value: metrics.tuberculosis_accuracy, note: 'AUC 1.000 ⚠️' },
    { label: 'Promedio',     value: metrics.avg_accuracy,          note: 'ensemble' },
    { label: 'YOLO mAP50',   value: metrics.yolo_map50,            note: 'localiza lesiones',
      hint: 'mAP50: qué tan bien YOLO localiza lesiones en la radiografía (1.0 = perfecto).' },
    { label: 'U-Net Dice',   value: metrics.unet_dice,             note: 'contorno pulmonar',
      hint: 'Dice: qué tanto coincide el contorno de pulmón dibujado por U-Net con el real (1.0 = idéntico).' },
  // el backend manda null en las métricas de modelos que no están cargados (YOLO es opcional)
  ].filter(({ value }) => value != null);

  return (
    <div style={card({ background: T.primaryLt, border: `1px solid ${T.primaryBd}`, marginBottom: 20 })}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.primary, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
        Métricas de Validación del Modelo (ensemble)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px 24px' }}>
        {items.map(({ label, value, note, hint }) => (
          <div key={label} title={hint}>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ fontSize: 11, color: T.textMid, marginTop: 2, fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 10, color: T.textDim, marginTop: 1 }}>{note}</div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 14, fontSize: 11, color: T.primaryDk,
        background: '#dbeafe', borderRadius: 6, padding: '6px 10px', display: 'inline-block',
      }}>
        ⚠️ COVID y TB al 100% — interpretar con cautela (posible sobreajuste / n reducido en prueba)
      </div>
    </div>
  );
}

function ConfidenceBars({ distribution }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {distribution.map(d => {
        const { label, color } = DISEASES[d.disease];
        return (
          <div key={d.disease}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{label}</span>
              <span style={{ fontSize: 11, color: T.textDim, marginLeft: 'auto' }}>{d.total} {plural(d.total, 'estudio')}</span>
            </div>
            {[['Confianza', d.avg_confidence, color], ['Tasa positiva', d.positive_rate, color + '99']].map(([name, value, barColor]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: T.textMid, marginBottom: 5 }}>
                <span style={{ minWidth: 84 }}>{name}</span>
                <ProgressBar value={value} color={barColor} />
                <span style={{ fontSize: 11, fontWeight: 700, color: barColor, minWidth: 36, textAlign: 'right' }}>{value}%</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Timeline({ data }) {
  const total = data.reduce((s, d) => s + (d.count || 0), 0);
  return (
    <div style={card()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Estudios — últimos {TIMELINE_DAYS} días</div>
        <div style={{ fontSize: 11, color: T.textDim }}>Total periodo: {total}</div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradDash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={T.primary} stopOpacity={0.15} />
              <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={T.borderDim} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: T.textDim }}
            tickFormatter={d => String(d).replace('Z', '').slice(5, 10)} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: T.textDim }} />
          <Tooltip
            contentStyle={{
              background: 'rgba(15,31,56,0.92)', border: 'none',
              borderRadius: 8, fontSize: 12, color: '#fff', padding: '8px 12px',
            }}
            labelFormatter={d => `Fecha: ${String(d).replace('Z', '').slice(0, 10)}`}
            formatter={v => [`${v} ${plural(v, 'estudio')}`, '']}
          />
          <Area type="monotone" dataKey="count" stroke={T.primary} fill="url(#gradDash)"
            strokeWidth={2} dot={{ fill: T.primary, r: 3 }}
            activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DiseaseTable({ distribution }) {
  const headers = ['Enfermedad', 'Total', 'Positivos', 'Negativos', 'Tasa positiva', 'Confianza prom.'];
  return (
    <div style={card()}>
      <div style={{ ...cardTitle, marginBottom: 14 }}>Resumen por enfermedad</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${T.border}` }}>
              {headers.map(h => (
                <th key={h} style={{
                  padding: '8px 12px', textAlign: 'left', color: T.textMid,
                  fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {distribution.map(d => {
              const { label, color } = DISEASES[d.disease];
              const isRisk = d.positive_rate > 50;
              return (
                <tr key={d.disease} style={{ borderBottom: `1px solid ${T.borderDim}` }}>
                  <td style={tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                      <span style={{ fontWeight: 600, color: T.text }}>{label}</span>
                    </div>
                  </td>
                  <td style={{ ...tableCell, fontWeight: 700, color: T.text }}>{d.total}</td>
                  <td style={{ ...tableCell, color: T.danger, fontWeight: 600 }}>{d.positive}</td>
                  <td style={{ ...tableCell, color: T.success, fontWeight: 600 }}>{d.negative}</td>
                  <td style={tableCell}>
                    <span style={badge(isRisk ? T.danger : T.success, isRisk ? T.dangerLt : T.successLt)}>{d.positive_rate}%</span>
                  </td>
                  <td style={tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ProgressBar value={d.avg_confidence} color={color} height={4} width={48} />
                      <span style={{ fontWeight: 700, color, fontSize: 12 }}>{d.avg_confidence}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    api.dashboardStats()
      .then(setStats)
      .catch(() => setError('No se pudieron cargar las estadísticas. Revisa que el servidor esté activo.'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader label="Cargando estadísticas..." />;
  if (error)   return <ErrorState message={error} onRetry={load} />;
  if (!stats)  return null;

  const { kpis, disease_distribution: distribution, timeline, system_metrics } = stats;
  const hasData = kpis.total_predictions > 0;
  const validationPct = hasData ? Math.round((kpis.validated / kpis.total_predictions) * 100) : 0;

  return (
    <div style={{ paddingBottom: 32, fontFamily: T.font }}>
      <PageHeader title="Dashboard del Sistema" subtitle="Vista general de actividad y métricas del modelo">
        <span style={badge(T.success, T.successLt)}><CheckCircle size={10} /> Sistema activo</span>
      </PageHeader>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <KpiCard Icon={Hospital}    label="Estudios totales" value={kpis.total_studies}      color={T.primary} />
        <KpiCard Icon={Cpu}         label="Predicciones"     value={kpis.total_predictions}  color="#8b5cf6" />
        <KpiCard Icon={CheckCircle} label="Validados"        value={kpis.validated}          color={T.success}
          subtitle={`${validationPct}% del total`} />
        <KpiCard Icon={Clock}       label="Sin validar"      value={kpis.pending_validation} color={T.warn} />
        <KpiCard Icon={Layers}      label="Estudios DICOM"   value={kpis.dicom_studies}      color="#0ea5e9" />
      </div>

      <ModelMetrics metrics={system_metrics} />

      <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={card({ flex: 1, minWidth: 280, marginBottom: 0 })}>
          <div style={cardTitle}>Distribución por enfermedad</div>
          {hasData ? <DonutChart data={distribution} /> : noData}
        </div>
        <div style={card({ flex: 1, minWidth: 280, marginBottom: 0 })}>
          <div style={cardTitle}>Confianza y tasa positiva</div>
          {hasData ? <ConfidenceBars distribution={distribution} /> : noData}
        </div>
      </div>

      <Timeline data={timeline.slice(-TIMELINE_DAYS)} />
      <DiseaseTable distribution={distribution} />
    </div>
  );
}
