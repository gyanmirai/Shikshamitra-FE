import type { SeatingPlanListRow } from '../../types';

export interface SeatingPlanSummaryDefinition {
  key: string;
  label: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  count: (rows: SeatingPlanListRow[]) => number;
}

export const SEATING_PLAN_SUMMARIES: SeatingPlanSummaryDefinition[] = [
  {
    key: 'requiring-seating',
    label: 'Requires seating',
    icon: 'mdi:clipboard-list-outline',
    color: 'primary',
    count: (rows) => rows.filter((row) => row.status !== 'published').length,
  },
  {
    key: 'in-progress',
    label: 'In progress',
    icon: 'mdi:progress-clock',
    color: 'info',
    count: (rows) => rows.filter((row) => row.status === 'in-progress').length,
  },
  {
    key: 'ready-for-review',
    label: 'Ready for review',
    icon: 'mdi:clipboard-check-outline',
    color: 'warning',
    count: (rows) => rows.filter((row) => row.status === 'ready').length,
  },
  {
    key: 'fully-allocated',
    label: 'Fully allocated',
    icon: 'mdi:check-decagram-outline',
    color: 'success',
    count: (rows) =>
      rows.filter((row) => row.status === 'completed' || row.status === 'published').length,
  },
  {
    key: 'published',
    label: 'Published',
    icon: 'mdi:send-check-outline',
    color: 'success',
    count: (rows) => rows.filter((row) => row.status === 'published').length,
  },
];
