import { Label } from 'src/components/label';

import type { SeatingPlanStatus } from '../../types';

const STATUS_CONFIG: Record<SeatingPlanStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' }> = {
  'not-started': { label: 'Not started', color: 'default' },
  'in-progress': { label: 'In progress', color: 'info' },
  ready: { label: 'Ready for review', color: 'warning' },
  'needs-attention': { label: 'Needs attention', color: 'error' },
  completed: { label: 'Completed', color: 'success' },
  published: { label: 'Published', color: 'success' },
};

export default function AllocationStatusBadge({ status }: { status: SeatingPlanStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['not-started'];
  return <Label color={cfg.color}>{cfg.label}</Label>;
}

export { STATUS_CONFIG };
