import { useCallback, useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { api, clearToken, getToken } from './api/client';
import ChatWidget from './components/ChatWidget';
import Sidebar from './components/Sidebar';
import { EmptyState, RoleBadge } from './components/ui';
import { canValidate } from './constants';
import Analysis from './pages/Analysis';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Login from './pages/Login';
import Patients from './pages/Patients';
import RadiologistPanel from './pages/RadiologistPanel';
import { T } from './theme';
import { latestPrediction } from './utils/format';
import './App.css';
import './ui.css';

const PAGES = {
  analysis:    { title: 'Análisis',              Component: Analysis },
  dashboard:   { title: 'Dashboard',             Component: Dashboard },
  history:     { title: 'Historial de Estudios', Component: History },
  patients:    { title: 'Pacientes',             Component: Patients },
  radiologist: { title: 'Panel Radiólogo',       Component: RadiologistPanel, requiresValidator: true },
};
const DEFAULT_PAGE = 'analysis';

// El asistente de chat es opcional: requiere un servicio externo (puerto 8001)
const CHAT_ENABLED = process.env.REACT_APP_ENABLE_CHAT === 'true';

const countPending = (studies) =>
  studies.filter(s => { const p = latestPrediction(s); return p && !p.is_validated; }).length;

function Topbar({ title, user }) {
  return (
    <header style={{
      background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 28px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
    }}>
      <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: '-0.01em' }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user && <RoleBadge role={user.role} />}
        <span style={{ fontSize: 11, color: T.textDim, fontFamily: T.mono }}>rt26 v2.0</span>
      </div>
    </header>
  );
}

export default function App() {
  const [loggedIn,     setLoggedIn]     = useState(() => Boolean(getToken()));
  const [page,         setPage]         = useState(DEFAULT_PAGE);
  const [user,         setUser]         = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!loggedIn) return;
    api.me().then(setUser).catch(() => {});
    api.studies().then(studies => setPendingCount(countPending(studies))).catch(() => {});
  }, [loggedIn]);

  const logout = useCallback(() => {
    clearToken();
    setLoggedIn(false);
    setUser(null);
    setPage(DEFAULT_PAGE);
  }, []);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  const { title, Component, requiresValidator } = PAGES[page];
  const allowed = !requiresValidator || canValidate(user);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: T.font, background: T.bg }}>
      <Sidebar active={page} onChange={setPage} onLogout={logout} user={user} pendingCount={pendingCount} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Topbar title={title} user={user} />
        <main className="page-pad" style={{ padding: 24, flex: 1 }}>
          {allowed
            ? <Component onPendingCountChange={setPendingCount} />
            : <EmptyState Icon={Shield} padding={80} message="Acceso restringido a radiólogos y administradores" />}
        </main>
      </div>

      {CHAT_ENABLED && <ChatWidget />}
    </div>
  );
}
