import { useState } from 'react';
import { Activity, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { api, setToken, takeSessionExpiredNotice } from '../api/client';
import { DEMO_CREDENTIALS } from '../constants';
import { T, spin } from '../theme';

const HIGHLIGHTS = [['97.6%', 'Precisión promedio'], ['< 3s', 'Tiempo de análisis'], ['3', 'Enfermedades detectadas']];

const inputStyle = {
  padding: '12px 16px', borderRadius: 10, fontSize: 14,
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
  color: '#fff', fontFamily: T.font, outline: 'none',
};

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(takeSessionExpiredNotice);
  const [loading, setLoading]   = useState(false);

  const login = async (credentials) => {
    setLoading(true); setError(null);
    try {
      const data = await api.login(credentials);
      setToken(data.access_token);
      onLogin(data);
    } catch (e) {
      setError(e instanceof TypeError ? 'No se pudo conectar con el servidor.' : e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="login-screen" style={{
      minHeight: '100vh', display: 'flex', fontFamily: T.font,
      background: 'linear-gradient(135deg, #0d1f3c 0%, #1a3a6b 50%, #0e2d5e 100%)',
    }}>
      <div className="login-left" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>rt26</div>
            <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sistema de Diagnóstico</div>
          </div>
        </div>
        <h1 className="login-title" style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          Diagnóstico pulmonar<br />asistido por IA
        </h1>
        <p style={{ fontSize: 16, opacity: 0.7, lineHeight: 1.7, maxWidth: 420, margin: 0 }}>
          Ensemble de tres modelos de deep learning para detección de neumonía,
          COVID-19 y tuberculosis con Grad-CAM, YOLO y segmentación U-Net.
        </p>
        <div style={{ display: 'flex', gap: '16px 32px', marginTop: 48, flexWrap: 'wrap' }}>
          {HIGHLIGHTS.map(([value, label]) => (
            <div key={label}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
              <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
      }}>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Iniciar sesión</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 32px' }}>
            Ingresa tus credenciales para continuar
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="email" placeholder="Correo institucional" aria-label="Correo institucional"
              autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Contraseña" aria-label="Contraseña"
              autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          </div>
          {error && (
            <div role="alert" style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(224,36,36,0.15)', color: '#fca5a5',
              fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <button type="submit" disabled={loading} style={{
            marginTop: 20, width: '100%', padding: '13px',
            borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? 'rgba(26,86,219,0.5)' : T.primary,
            color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: T.font,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading
              ? <><RefreshCw size={14} style={spin} /> Ingresando...</>
              : <>Ingresar <ChevronRight size={16} /></>}
          </button>
          {DEMO_CREDENTIALS && (
            <button type="button" onClick={() => login(DEMO_CREDENTIALS)} disabled={loading} style={{
              marginTop: 10, width: '100%', padding: '13px',
              borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: T.font,
            }}>
              Probar demo sin cuenta
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
