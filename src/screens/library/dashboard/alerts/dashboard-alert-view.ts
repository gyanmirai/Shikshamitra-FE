import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

export type DashboardAlert = {
  type: string;
  severity: string;
  title: string;
  message: string;
  count: number;
  link?: string | null;
};
const financialTypes = new Set([
  'pendingCharges',
  'overdueCharges',
  'unpostedCharges',
  'reviewCharges',
]);
const demandTypes = new Set(['pendingCharges', 'overdueCharges']);

export const isFinancialAlert = (type: string) => financialTypes.has(type);

export function dashboardAlertView(
  overview: LibraryDashboardOverview | undefined,
  financialOnly: boolean
) {
  const source: DashboardAlert[] = overview?.alerts || [];
  const candidates = financialOnly ? source.filter((item) => isFinancialAlert(item.type)) : source;
  const unavailable =
    !overview?.financePosition && candidates.some((item) => demandTypes.has(item.type));
  return {
    unavailable,
    alerts: candidates.filter((item) => !(unavailable && demandTypes.has(item.type))),
  };
}

export const alertStatus = (severity: string) => {
  const value = severity.toLowerCase();
  if (value === 'critical' || value === 'error') return 'error';
  if (value === 'warning') return 'warning';
  if (value === 'success') return 'success';
  if (value === 'info') return 'info';
  return 'default';
};

export const alertIcon = (type: string) => {
  const value = type.toLowerCase();
  if (value.includes('overdue')) return 'solar:alarm-linear';
  if (value.includes('reservation')) return 'solar:calendar-mark-linear';
  if (value.includes('charge')) return 'solar:wallet-money-linear';
  if (value.includes('stock')) return 'solar:box-linear';
  return 'solar:info-circle-linear';
};
