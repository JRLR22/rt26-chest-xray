import { T, pageTitle } from '../../theme';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      gap: 12, flexWrap: 'wrap', marginBottom: 20,
    }}>
      <div>
        <h2 style={pageTitle}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: T.textDim, margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {children && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{children}</div>}
    </div>
  );
}
