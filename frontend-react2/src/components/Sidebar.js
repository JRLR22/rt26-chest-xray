import { Activity, ClipboardList, LayoutDashboard, LogOut, Microscope, Stethoscope, Users } from 'lucide-react';
import { canValidate } from '../constants';
import { T } from '../theme';
import { RoleBadge } from './ui';

export const NAV_ITEMS = [
  { key: 'analysis',    Icon: Microscope,      label: 'Análisis' },
  { key: 'dashboard',   Icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'history',     Icon: ClipboardList,   label: 'Historial' },
  { key: 'patients',    Icon: Users,           label: 'Pacientes' },
  { key: 'radiologist', Icon: Stethoscope,     label: 'Radiólogo', requiresValidator: true },
];

export default function Sidebar({ active, onChange, onLogout, user, pendingCount = 0 }) {
  const items = NAV_ITEMS.filter(item => !item.requiresValidator || canValidate(user));

  return (
    <div className="sidebar" style={{
      background: T.text, color: '#fff',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
      fontFamily: T.font,
    }}>
      <div className="sb-head" style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={18} color="#fff" />
          </div>
          <div className="sb-hide">
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>rt26</div>
            <div style={{ fontSize: 10, opacity: 0.45, letterSpacing: '0.04em', textTransform: 'uppercase' }}>v2.0</div>
          </div>
        </div>
        {user && (
          <div className="sb-hide" style={{
            marginTop: 16, padding: '10px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 12, opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
            <RoleBadge role={user.role} />
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {items.map(({ key, Icon, label }) => {
          const isActive = active === key;
          const count = key === 'radiologist' ? pendingCount : 0;
          return (
            <button key={key} onClick={() => onChange(key)}
              className={`nav-btn${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label} title={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                fontFamily: T.font, fontSize: 13, marginBottom: 2,
              }}>
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span className="sb-hide" style={{ flex: 1, textAlign: 'left' }}>{label}</span>
              {count > 0 && (
                <span className="nav-badge" style={{
                  background: T.danger, color: '#fff', borderRadius: 20,
                  fontSize: 10, fontWeight: 700, padding: '1px 7px',
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={onLogout} className="logout-btn" aria-label="Cerrar sesión" title="Cerrar sesión" style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
          fontFamily: T.font, fontSize: 13, color: 'rgba(255,255,255,0.4)',
          background: 'transparent',
        }}>
          <LogOut size={16} style={{ flexShrink: 0 }} /><span className="sb-hide">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
