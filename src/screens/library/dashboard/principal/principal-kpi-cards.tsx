import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';

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
      tooltip: 'Total Library book titles in the selected academic year.',
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
      value: fNumber((circulation?.issuesThisWeek || 0) + (circulation?.returnsThisWeek || 0)),
      icon: 'solar:transfer-horizontal-bold-duotone',
      status: 'success' as const,
      chart: { data: trend },
      tooltip: 'Books issued and returned this week.',
    },
    {
      id: 'LIB_PRINCIPAL_OVERDUE',
      title: 'Overdue Rate',
      value: `${Math.round(utilization?.overdueRate || 0)}%`,
      icon: 'solar:alarm-add-bold-duotone',
      status: 'warning' as const,
      chart: { data: trend },
      tooltip: 'Share of active issues that are overdue.',
    },
    {
      id: 'LIB_PRINCIPAL_FINE_COLLECTION',
      title: 'Fine Collection Rate',
      value: `${Math.round(utilization?.chargeCollectionRate || 0)}%`,
      icon: 'solar:wallet-money-bold-duotone',
      status: 'success' as const,
      chart: { data: trend },
      tooltip: 'Library charge collection rate.',
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
            trendData={kpi.chart.data}
            status={kpi.status}
            tooltip={kpi.tooltip}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default PrincipalKPICards;
