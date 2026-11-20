import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';

import { movementValue, completeOverdue } from '../dashboard-date-values';
import CompactKPICard from '../../../student/dashboard/principal/kpi-card-item';

const trendFromOverview = (overview?: LibraryDashboardOverview) => {
  const data = (overview?.weeklyCirculation || []).map(
    (point: any) => point.issued + point.returned
  );
  return data.length ? data : [0, 0, 0, 0, 0, 0, 0];
};

const PrincipalKPICards = ({ overview }: { overview?: LibraryDashboardOverview }) => {
  const trend = trendFromOverview(overview);
  const stock = overview?.stockTotals;
  const circulation = overview?.circulation;
  const utilization = overview?.utilization;

  const kpiData = [
    {
      id: 'LIB_PRINCIPAL_TOTAL_BOOKS',
      title: 'Total Books',
      value: fNumber(stock?.totalBooks || 0),
      icon: 'solar:book-bookmark-bold-duotone',
      status: 'primary' as const,
      chart: { data: trend },
      tooltip: 'Permanent Library book titles across academic years.',
    },
    {
      id: 'LIB_PRINCIPAL_TOTAL_COPIES',
      title: 'Total Copies',
      value: fNumber(stock?.totalCopies || 0),
      icon: 'solar:layers-bold-duotone',
      status: 'info' as const,
      chart: { data: trend },
      tooltip: 'Total physical inventory count across all sections.',
    },
    {
      id: 'LIB_PRINCIPAL_CIRCULATION',
      title: 'Weekly Circulation',
      value: movementValue(overview, 'week'),
      icon: 'solar:transfer-horizontal-bold-duotone',
      status: 'success' as const,
      chart: { data: trend },
      tooltip: 'Books issued and returned this week.',
    },
    {
      id: 'LIB_PRINCIPAL_OVERDUE',
      title: 'Overdue Rate',
      value: completeOverdue(circulation)
        ? `${Math.round(utilization?.overdueRate || 0)}%`
        : 'Not classified',
      icon: 'solar:alarm-add-bold-duotone',
      status: 'warning' as const,
      chart: { data: trend },
      tooltip: 'Share of active issues that are overdue.',
    },
    {
      id: 'LIB_PRINCIPAL_FINANCE_VERIFIED',
      title: 'Verified Finance Sources',
      value: overview?.financePosition
        ? fNumber(overview.financePosition.verifiedCount)
        : 'Unavailable',
      icon: 'solar:wallet-money-bold-duotone',
      status: 'success' as const,
      chart: { data: [] },
      tooltip:
        'Authorized assessment records with verified Finance evidence. Verification does not mean full settlement.',
    },
    {
      id: 'LIB_PRINCIPAL_ACTIVE_ISSUES',
      title: 'Active Issues',
      value: fNumber(circulation?.activeIssues || 0),
      icon: 'solar:book-2-bold-duotone',
      status: 'primary' as const,
      chart: { data: trend },
      tooltip: 'Books currently issued to members.',
    },
  ];

  return (
    <Grid container spacing={1}>
      {kpiData.map((kpi) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
          <CompactKPICard
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trendData={kpi.chart.data.length ? kpi.chart.data : undefined}
            status={kpi.status}
            tooltip={kpi.tooltip}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default PrincipalKPICards;
