import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import React from 'react';
import { Grid } from '@mui/material';
import { fNumber, fCurrency } from 'src/utils/format-number';

import CompactKPICard from '../../../student/dashboard/principal/kpi-card-item';

const trendFromOverview = (overview?: LibraryDashboardOverview) => {
  const data = (overview?.weeklyCirculation || []).map(
    (point: any) => point.issued + point.returned
  );
  return data.length ? data : [0, 0, 0, 0, 0, 0, 0];
};

const buildKpiData = (overview?: LibraryDashboardOverview) => {
  const trend = trendFromOverview(overview);
  const stock = overview?.stockTotals;
  const circulation = overview?.circulation;
  const charges = overview?.charges;
  const reservations = overview?.reservations;

  return [
    {
      id: 'LIB_TOTAL_BOOKS',
      title: 'Total Books',
      value: fNumber(stock?.totalBooks || 0),
      chart: { data: trend },
      icon: 'solar:book-bookmark-bold-duotone',
      status: 'primary' as const,
      path: '/library/book-list',
      tooltip: 'Total book titles in the current academic year.',
    },
    {
      id: 'LIB_TOTAL_COPIES',
      title: 'Total Copies',
      value: fNumber(stock?.totalCopies || 0),
      chart: { data: trend },
      icon: 'solar:layers-bold-duotone',
      status: 'secondary' as const,
      path: '/library/book-list',
      tooltip: 'Total physical copies tracked in Library inventory.',
    },
    {
      id: 'LIB_CIRCULATION',
      title: 'Circulation Today',
      value: fNumber((circulation?.issuesToday || 0) + (circulation?.returnsToday || 0)),
      chart: { data: trend },
      icon: 'solar:transfer-horizontal-bold-duotone',
      status: 'info' as const,
      path: '/library/issued-books',
      tooltip: 'Books issued and returned today.',
    },
    {
      id: 'LIB_OVERDUE',
      title: 'Overdue Books',
      value: fNumber(circulation?.overdueIssues || 0),
      chart: { data: trend },
      icon: 'solar:alarm-add-bold-duotone',
      status: 'error' as const,
      path: '/library/issued-books',
      tooltip: 'Books currently past their due date.',
    },
    {
      id: 'LIB_PENDING_CHARGES',
      title: 'Pending Charges',
      value: fCurrency(charges?.pendingAmount || 0),
      chart: { data: trend },
      icon: 'solar:wallet-money-bold-duotone',
      status: 'warning' as const,
      path: '/library/charges-management',
      tooltip: 'Outstanding Library fines and charges.',
    },
    {
      id: 'LIB_AVAILABLE_BOOKS',
      title: 'Available Copies',
      value: fNumber(stock?.availableCopies || 0),
      chart: { data: trend },
      icon: 'solar:book-2-bold-duotone',
      status: 'success' as const,
      path: '/library/book-list',
      tooltip: `${fNumber(reservations?.activeReservations || 0)} active reservations are waiting.`,
    },
  ];
};

const AdminKPICards = ({ overview }: { overview?: LibraryDashboardOverview }) => {
  const kpiData = buildKpiData(overview);

  return (
    <Grid container spacing={1}>
      {kpiData.map((kpi) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
          <CompactKPICard
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trendData={kpi.chart.data}
            path={kpi.path}
            tooltip={kpi.tooltip}
            status={kpi.status}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default AdminKPICards;
