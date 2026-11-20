import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import React from 'react';
import { Box, Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';
import { RouterLink } from 'src/routes/components';
import { libraryPaths } from 'src/constants/library-menus';

import { overdueValue, movementValue } from '../dashboard-date-values';
import CompactKPICard from '../../../student/dashboard/principal/kpi-card-item';

const trendFromOverview = (overview?: LibraryDashboardOverview) => {
  const data = (overview?.weeklyCirculation || []).map(
    (point: any) => point.issued + point.returned
  );
  return data.length ? data : [0, 0, 0, 0, 0, 0, 0];
};

const buildKpiData = (overview: LibraryDashboardOverview | undefined, canViewCharges: boolean) => {
  const trend = trendFromOverview(overview);
  const stock = overview?.stockTotals;
  const circulation = overview?.circulation;
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
      tooltip: 'Permanent Library book titles across academic years.',
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
      value: movementValue(overview, 'today'),
      chart: { data: trend },
      icon: 'solar:transfer-horizontal-bold-duotone',
      status: 'info' as const,
      path: '/library/issued-books',
      tooltip: 'Books issued and returned today.',
    },
    {
      id: 'LIB_OVERDUE',
      title: 'Overdue Books',
      value: overdueValue(circulation?.overdueIssues || 0, circulation),
      chart: { data: trend },
      icon: 'solar:alarm-add-bold-duotone',
      status: 'error' as const,
      path: '/library/issued-books',
      tooltip: 'Books currently past their due date.',
    },
    {
      id: 'LIB_FINANCE_REVIEW',
      title: 'Needs Finance Review',
      value: overview?.financePosition
        ? fNumber(overview.financePosition.needsReviewCount)
        : 'Unavailable',
      chart: { data: [] },
      icon: 'solar:wallet-money-bold-duotone',
      status: 'warning' as const,
      path: canViewCharges ? libraryPaths.charges : undefined,
      tooltip:
        'Authorized assessment records whose Finance evidence needs review. This is a record count, not an outstanding amount.',
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

const AdminKPICards = ({
  overview,
  canViewCharges = false,
}: {
  overview?: LibraryDashboardOverview;
  canViewCharges?: boolean;
}) => {
  const kpiData = buildKpiData(overview, canViewCharges);

  return (
    <Grid container spacing={1}>
      {kpiData.map((kpi) => {
        const financial = kpi.id === 'LIB_FINANCE_REVIEW';
        const card = (
          <CompactKPICard
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trendData={kpi.chart.data.length ? kpi.chart.data : undefined}
            path={financial ? undefined : kpi.path}
            tooltip={kpi.tooltip}
            status={kpi.status}
          />
        );
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
            {financial && kpi.path ? (
              <Box
                component={RouterLink}
                href={kpi.path}
                aria-label="Open Library charge register"
                sx={{
                  display: 'block',
                  height: 1,
                  textDecoration: 'none',
                  borderRadius: 2,
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                {card}
              </Box>
            ) : (
              card
            )}
          </Grid>
        );
      })}
    </Grid>
  );
};

export default AdminKPICards;
