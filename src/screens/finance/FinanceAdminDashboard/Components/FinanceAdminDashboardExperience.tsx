'use client';

import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { DateRange } from 'src/components/custom-date-range-picker';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Grid, Alert, Stack, Button, Skeleton } from '@mui/material';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import {
  useGetFinanceDashboardActivityQuery,
  useGetFinanceDashboardOverviewQuery,
} from 'src/redux/finance/financeDashboardApi';

import ExposureAtlas from './ExposureAtlas';
import FinanceChequeOverview from './FinanceChequeOverview';
import { FinanceAttentionQueue } from './FinanceActionRail';
import { FinanceActivityMetrics, FinanceCollectionCharts } from './MoneyTransitMap';

const minDate = (a: Dayjs, b: Dayjs) => (a.isBefore(b, 'day') ? a : b);
const maxDate = (a: Dayjs, b: Dayjs) => (a.isAfter(b, 'day') ? a : b);
const initialEnd = (start: Dayjs, end: Dayjs) =>
  maxDate(start, minDate(dayjs().startOf('day'), end));

function LoadError({ error, retry }: { error: unknown; retry: () => void }) {
  const denied =
    typeof error === 'object' && error !== null && 'status' in error && error.status === 403;

  return (
    <Alert
      severity={denied ? 'warning' : 'error'}
      action={
        denied ? undefined : (
          <Button color="inherit" onClick={retry}>
            Retry
          </Button>
        )
      }
    >
      {denied
        ? 'Finance data is unavailable for your access in this academic year.'
        : 'Finance data could not be loaded.'}
    </Alert>
  );
}

function FinanceYearDashboard({
  academicYearId,
  scopeKey,
  yearStart,
  yearEnd,
  yearLabel,
}: {
  academicYearId: string;
  scopeKey: string;
  yearStart: Dayjs;
  yearEnd: Dayjs;
  yearLabel: string;
}) {
  const [range, setRange] = useState<DateRange>(() => {
    const end = initialEnd(yearStart, yearEnd);
    return [maxDate(yearStart, end.subtract(6, 'day')), end];
  });

  const [from, to] = range;
  const period =
    from?.isValid() &&
    to?.isValid() &&
    !to.isBefore(from, 'day') &&
    !from.isBefore(yearStart, 'day') &&
    !to.isAfter(yearEnd, 'day')
      ? { academicYearId, scopeKey, from: from.format('YYYY-MM-DD'), to: to.format('YYYY-MM-DD') }
      : skipToken;
  const periodLabel =
    period !== skipToken && from && to
      ? `${from.format('DD MMM YYYY')} – ${to.format('DD MMM YYYY')}`
      : '';
  const overview = useGetFinanceDashboardOverviewQuery(period, { refetchOnMountOrArgChange: true });
  const activity = useGetFinanceDashboardActivityQuery(period, { refetchOnMountOrArgChange: true });

  const setPreset = (preset: 'week' | 'month' | 'year') => {
    const end = initialEnd(yearStart, yearEnd);
    const start =
      preset === 'year'
        ? yearStart
        : preset === 'month'
          ? end.startOf('month')
          : end.subtract(6, 'day');
    setRange([maxDate(yearStart, start), end]);
  };

  const currentOverview =
    period === skipToken || overview.isError ? undefined : overview.currentData;
  const currentActivity = activity.isError ? undefined : activity.currentData;
  let periodContent: ReactNode;
  if (period === skipToken) {
    periodContent = <Alert severity="info">Select activity dates within this academic year.</Alert>;
  } else if (activity.isError) {
    periodContent = <LoadError error={activity.error} retry={activity.refetch} />;
  } else if (!currentActivity) {
    periodContent = <Skeleton aria-label="Loading period activity" variant="rounded" height={86} />;
  } else {
    periodContent = <FinanceActivityMetrics activity={currentActivity} />;
  }

  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <Stack
        component="section"
        aria-label="Activity date controls"
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={1}
        useFlexGap
      >
        <Box sx={{ width: { xs: '100%', sm: 300 }, minWidth: 0 }}>
          <CustomDateRangePicker
            value={range}
            onChange={setRange}
            label="Activity date range"
            title="Select activity date range"
            dateFormat="DD MMM YYYY"
            minDate={yearStart}
            maxDate={yearEnd}
            calendars={2}
            showShortcuts={false}
            allowManualInput
          />
        </Box>
        <Stack
          direction="row"
          spacing={0.5}
          useFlexGap
          flexWrap="wrap"
          sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
        >
          <Button size="small" color="inherit" onClick={() => setPreset('week')}>
            Last 7 days
          </Button>
          <Button size="small" color="inherit" onClick={() => setPreset('month')}>
            This month
          </Button>
          <Button size="small" color="inherit" onClick={() => setPreset('year')}>
            Full year to date
          </Button>
        </Stack>
      </Stack>
      {periodContent}
      {period !== skipToken && overview.isError && (
        <LoadError error={overview.error} retry={overview.refetch} />
      )}
      {period !== skipToken && !overview.isError && !currentOverview && (
        <Skeleton
          aria-label="Loading balances for the selected period"
          variant="rounded"
          height={145}
        />
      )}
      {currentOverview && (
        <FinanceChequeOverview overview={currentOverview} periodLabel={periodLabel} />
      )}
      {period !== skipToken && currentActivity && (
        <FinanceCollectionCharts activity={currentActivity} />
      )}
      {currentOverview && (
        <Grid container spacing={2} alignItems="flex-start">
          {currentOverview.balances && (
            <Grid size={{ xs: 12, xl: currentOverview.work.length ? 8 : 12 }} sx={{ minWidth: 0 }}>
              <ExposureAtlas
                classes={currentOverview.balances.classes}
                yearLabel={yearLabel}
                periodLabel={periodLabel}
              />
            </Grid>
          )}
          {currentOverview.work.length > 0 && (
            <Grid size={{ xs: 12, xl: currentOverview.balances ? 4 : 12 }} sx={{ minWidth: 0 }}>
              <FinanceAttentionQueue work={currentOverview.work} />
            </Grid>
          )}
        </Grid>
      )}
    </Stack>
  );
}

export default function FinanceAdminDashboardExperience() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const {
    user,
    sessionContext,
    initializationVersion,
    permissions,
    loading,
    permissionsInitialized,
  } = useSelector((state: RootState) => state.auth);
  const academicYearId = typeof currentYear?.id === 'string' ? currentYear.id : '';
  const yearStart = currentYear?.startDate ? dayjs(currentYear.startDate).startOf('day') : null;
  const yearEnd = currentYear?.endDate ? dayjs(currentYear.endDate).startOf('day') : null;
  const yearLabel =
    currentYear?.name ||
    (yearStart && yearEnd ? `${yearStart.year()}–${yearEnd.year()}` : 'Academic year');
  const userId = user?.sub;
  const tenantId = sessionContext?.tenantId;
  const scopeKey = `${tenantId ?? ''}:${userId ?? ''}:${initializationVersion}`;

  let content: ReactNode;
  if (loading || !permissionsInitialized) {
    content = <Skeleton aria-label="Loading finance access" variant="rounded" height={145} />;
  } else if (
    !tenantId ||
    !userId ||
    !hasGrantedPermission(permissions, financePermissions.dashboard)
  ) {
    content = (
      <Alert severity="warning">Finance dashboard access is unavailable for your account.</Alert>
    );
  } else if (
    !academicYearId ||
    !yearStart?.isValid() ||
    !yearEnd?.isValid() ||
    yearEnd.isBefore(yearStart, 'day')
  ) {
    content = (
      <Alert severity="info">
        Select an academic year on another Finance page, then return to the dashboard.
      </Alert>
    );
  } else {
    content = (
      <FinanceYearDashboard
        key={`${scopeKey}:${academicYearId}:${yearStart.format('YYYY-MM-DD')}:${yearEnd.format('YYYY-MM-DD')}`}
        academicYearId={academicYearId}
        scopeKey={scopeKey}
        yearStart={yearStart}
        yearEnd={yearEnd}
        yearLabel={yearLabel}
      />
    );
  }

  return (
    <Box sx={{ pb: 3, minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Finance Dashboard"
        description="Review outstanding fees, finance work and period activity within your academic scope."
        links={[{ name: 'Finance', href: financePaths.dashboard }, { name: 'Dashboard' }]}
        sx={{ mb: 2 }}
      />
      {content}
    </Box>
  );
}
