import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { DashboardAlerts } from '../alerts/DashboardAlerts';

export { AlertItem } from '../alerts/DashboardAlertItem';
export type { AlertItemProps } from '../alerts/DashboardAlertItem';

export const DEFAULTERS: { id: number; name: string; books: number; days: number }[] = [];
export const OVERDUE_BOOKS: { id: number; title: string; member: string; days: number }[] = [];
export const HIGH_DEMAND: { id: number; title: string; requests: number }[] = [];
export const LOW_STOCK: { id: number; title: string; stock: number }[] = [];

export const getSeverityStatus = (days: number): 'warning' | 'error' | 'default' => {
  if (days >= 8) return 'error';
  if (days >= 3) return 'warning';
  return 'default';
};

export default function AdminAlerts({ overview }: { overview?: LibraryDashboardOverview }) {
  return <DashboardAlerts overview={overview} />;
}
