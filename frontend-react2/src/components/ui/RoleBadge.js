import { Shield } from 'lucide-react';
import { ROLES } from '../../constants';
import { badge } from '../../theme';

export default function RoleBadge({ role }) {
  const meta = ROLES[role];
  if (!meta) return null;
  return <span style={badge(meta.color, meta.bg)}><Shield size={10} />{meta.label}</span>;
}
