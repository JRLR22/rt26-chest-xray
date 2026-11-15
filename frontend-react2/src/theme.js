// Tokens de diseño y estilos base compartidos por toda la interfaz.

export const T = {
  bg:        '#f0f4f9',
  surface:   '#ffffff',
  border:    '#e2e8f0',
  borderDim: '#edf0f4',
  text:      '#0f1f38',
  textMid:   '#4a5e7a',
  textDim:   '#8fa3bf',
  primary:   '#1a56db',
  primaryDk: '#1340b0',
  primaryLt: '#eff4ff',
  primaryBd: '#c7d7f9',
  success:   '#0d9f6e',
  successLt: '#ecfdf5',
  danger:    '#e02424',
  dangerLt:  '#fef2f2',
  dangerBd:  '#fecaca',
  warn:      '#d97706',
  warnLt:    '#fffbeb',
  font:      "'DM Sans', 'Segoe UI', sans-serif",
  mono:      "'DM Mono', monospace",
  radius:    10,
  radiusLg:  16,
  shadow:    '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)',
  shadowMd:  '0 4px 24px rgba(0,0,0,0.10)',
};

export const card = (extra = {}) => ({
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: T.radius,
  padding: 20,
  marginBottom: 14,
  boxShadow: T.shadow,
  ...extra,
});

export const badge = (color, bg, extra = {}) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  fontSize: 11, fontWeight: 700, padding: '3px 10px',
  borderRadius: 20, color, background: bg,
  letterSpacing: '0.02em', ...extra,
});

const BUTTON_VARIANTS = {
  primary: { background: T.primary, color: '#fff', border: 'none' },
  ghost:   { background: 'transparent', color: T.textMid, border: `1px solid ${T.border}` },
  danger:  { background: T.dangerLt, color: T.danger, border: `1px solid ${T.dangerBd}` },
};

export const btn = (variant = 'primary', extra = {}) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
  fontSize: 13, fontWeight: 600,
  fontFamily: T.font, ...BUTTON_VARIANTS[variant], ...extra,
});

export const pageTitle = {
  fontSize: 20, fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-0.01em',
};

export const sectionLabel = {
  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
};

export const spin = { animation: 'spin 1s linear infinite' };
