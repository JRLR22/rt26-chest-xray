// Cliente HTTP del backend: token JWT, expiración de sesión y endpoints.

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const TOKEN_KEY = 'token';
const EXPIRED_KEY = 'session_expired';

// El storage puede no estar disponible (modo privado, cookies bloqueadas)
const safe = (fn, fallback = null) => {
  try { return fn(); } catch { return fallback; }
};

export const getToken   = () => safe(() => localStorage.getItem(TOKEN_KEY));
export const setToken   = (token) => safe(() => localStorage.setItem(TOKEN_KEY, token));
export const clearToken = () => safe(() => localStorage.removeItem(TOKEN_KEY));

/** Devuelve (y consume) el aviso de sesión expirada que dejó un 401. */
export function takeSessionExpiredNotice() {
  return safe(() => {
    if (!sessionStorage.getItem(EXPIRED_KEY)) return null;
    sessionStorage.removeItem(EXPIRED_KEY);
    return 'Tu sesión ha expirado. Inicia sesión nuevamente.';
  });
}

/** fetch con el token de sesión; ante un 401 cierra la sesión y vuelve al login. */
export async function authFetch(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: { ...(opts.headers || {}), Authorization: `Bearer ${getToken()}` },
  });
  if (res.status === 401) {
    clearToken();
    safe(() => sessionStorage.setItem(EXPIRED_KEY, '1'));
    window.location.href = '/';
  }
  return res;
}

async function errorFrom(res, fallback) {
  const body = await res.json().catch(() => null);
  return new Error(body?.detail || fallback);
}

async function getJSON(path) {
  const res = await authFetch(path);
  if (!res.ok) throw await errorFrom(res, `Error ${res.status}`);
  return res.json();
}

// El backend ha devuelto tanto un arreglo como { studies: [...] }
const extractStudies = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.studies)) return data.studies;
  return [];
};

export const api = {
  async login(credentials) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Credenciales incorrectas');
    return res.json();
  },

  me:             () => getJSON('/auth/me'),
  dashboardStats: () => getJSON('/dashboard/stats'),
  studies:        () => getJSON('/studies').then(extractStudies),

  async studyReport(studyId) {
    const res = await authFetch(`/studies/${studyId}/report`);
    if (!res.ok) throw await errorFrom(res, 'No se pudo generar el PDF');
    return res.blob();
  },

  async validatePrediction(predictionId, { result, notes }) {
    const params = new URLSearchParams({ validation_result: result });
    if (notes) params.append('radiologist_notes', notes);
    const res = await authFetch(`/predictions/${predictionId}/validate?${params}`, { method: 'PUT' });
    if (!res.ok) throw await errorFrom(res, 'Error al validar');
    return res.json().catch(() => null);
  },

  async predict(file, { dicom = false } = {}) {
    const form = new FormData();
    form.append('file', file);
    const res = await authFetch(dicom ? '/predict/dicom' : '/predict/auto', { method: 'POST', body: form });
    if (!res.ok) throw await errorFrom(res, 'Error al analizar la imagen');
    return res.json();
  },
};
