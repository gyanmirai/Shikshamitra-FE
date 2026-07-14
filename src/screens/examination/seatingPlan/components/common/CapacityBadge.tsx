import { Label } from 'src/components/label';

export type CapacityStatus = 'ok' | 'shortage' | 'unused';

const CONFIG: Record<CapacityStatus, { label: string; color: 'success' | 'error' | 'warning' }> = {
  ok: { label: 'Capacity OK', color: 'success' },
  shortage: { label: 'Shortage', color: 'error' },
  unused: { label: 'Underused', color: 'warning' },
};

export default function CapacityBadge({ status }: { status: CapacityStatus }) {
  const cfg = CONFIG[status] ?? CONFIG.ok;
  return <Label color={cfg.color}>{cfg.label}</Label>;
}
