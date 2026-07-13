import { Label } from 'src/components/label';

import type { SeatingPlanStatus } from '../../types';

const STATUS_CONFIG: Record<SeatingPlanStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' }> = {
  'not-started': { label: 'Not Started', color: 'default' },
  'in-progress': { label: 'In Progress', color: 'info' },
  ready: { label: 'Ready for Review', color: 'warning' },
  'needs-attention': { label: 'Needs Attention', color: 'error' },
  completed: { label: 'Completed', color: 'success' },
  published: { label: 'Published', color: 'success' },
};

export default function AllocationStatusBadge({ status }: { status: SeatingPlanStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['not-started'];
  return <Label color={cfg.color}>{cfg.label}</Label>;
}

export { STATUS_CONFIG };
