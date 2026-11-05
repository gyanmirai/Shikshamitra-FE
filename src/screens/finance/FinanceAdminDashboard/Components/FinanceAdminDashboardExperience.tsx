'use client';

import type { RootState } from 'src/redux/store';
import type { DateRange } from 'src/components/custom-date-range-picker';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { fCurrency } from 'src/utils/format-number';
import { useMemo, useState, useEffect } from 'react';
import { financePaths } from 'src/constants/finance-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import {
  Box,
  Chip,
  Grid,
  Alert,
  Paper,
  Stack,
  Button,
  Typography,
} from '@mui/material';

import ExposureAtlas from './ExposureAtlas';
import MoneyTransitMap from './MoneyTransitMap';
import { FinanceReportRail, FinanceAttentionQueue } from './FinanceActionRail';
import { financeQueuePreview, financeExposurePreview, summarizeFinanceActivity } from '../finance-admin-dashboard-preview-data';

function academicYearName(year: Record<string, any>) {
  if (year.name || year.academicYearName || year.yearName) {
    return year.name || year.academicYearName || year.yearName;
  }

  const start = year.startDate ? dayjs(year.startDate).year() : null;
  const end = year.endDate ? dayjs(year.endDate).year() : null;
  return start && end ? `AY ${  start  }–${  end}` : 'Selected academic year';
}

function createDefaultRange(yearStart: dayjs.Dayjs, yearEnd: dayjs.Dayjs): DateRange {
  const today = dayjs().startOf('day');
  const endDate = today.isAfter(yearEnd) ? yearEnd : today;
  const sevenDaysAgo = endDate.subtract(6, 'day');
  const startDate = sevenDaysAgo.isBefore(yearStart) ? yearStart : sevenDaysAgo;
  return [startDate, endDate];
}

function EmptyActivity() {
  return {
    received: 0,
    confirmedIncome: 0,
    expenses: 0,
    transactions: 0,
    methods: {} as Record<string, number>,
    days: [],
  };
}

export default function FinanceAdminDashboardExperience() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const yearStart = useMemo(
    () => (currentYear?.startDate ? dayjs(currentYear.startDate).startOf('day') : null),
    [currentYear?.startDate]
  );
  const yearEnd = useMemo(
    () => (currentYear?.endDate ? dayjs(currentYear.endDate).startOf('day') : null),
    [currentYear?.endDate]
  );
  const yearKey = [
    currentYear?.id ?? '',
    currentYear?.startDate ?? '',
    currentYear?.endDate ?? '',
  ].join(':');
  const hasValidAcademicYear =
    Boolean(currentYear?.id) &&
    Boolean(yearStart?.isValid()) &&
    Boolean(yearEnd?.isValid()) &&
    Boolean(yearStart && yearEnd && !yearEnd.isBefore(yearStart, 'day'));
  const [dateRange, setDateRange] = useState<DateRange>([null, null]);

  useEffect(() => {
    if (hasValidAcademicYear && yearStart && yearEnd) {
      setDateRange(createDefaultRange(yearStart, yearEnd));
    } else {
      setDateRange([null, null]);
    }
  }, [hasValidAcademicYear, yearEnd, yearKey, yearStart]);

  const [fromDate, toDate] = dateRange;
  const activity = useMemo(
    () =>
      fromDate && toDate && !toDate.isBefore(fromDate, 'day')
        ? summarizeFinanceActivity(fromDate.format('YYYY-MM-DD'), toDate.format('YYYY-MM-DD'))
        : EmptyActivity(),
    [fromDate, toDate]
  );
  const yearLabel = currentYear?.id
    ? academicYearName(currentYear as Record<string, any>)
    : 'No academic year selected';
  const rangeLabel =
    fromDate && toDate
      ? `${fromDate.format('DD MMM YYYY')  } – ${  toDate.format('DD MMM YYYY')}`
      : 'Select a valid date range';

  const applyPreset = (preset: 'week' | 'month' | 'year') => {
    if (!yearStart || !yearEnd || !hasValidAcademicYear) return;

    const today = dayjs().startOf('day');
    const endDate = today.isAfter(yearEnd) ? yearEnd : today;
    const requestedStart =
      preset === 'year'
        ? yearStart
        : preset === 'month'
          ? endDate.startOf('month')
          : endDate.subtract(6, 'day');
    const startDate = requestedStart.isBefore(yearStart) ? yearStart : requestedStart;
    setDateRange([startDate, endDate]);
  };

  return (
    <Box sx={{ pb: 3, minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Finance Dashboard"
        description="School-wide finance movement, unresolved work and fee exposure for the selected academic year."
        links={[{ name: 'Finance', href: financePaths.dashboard }, { name: 'Dashboard' }]}
      />

      <Stack spacing={2} sx={{ mt: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            px: { xs: 2, md: 2.5 },
            py: 1.5,
            display: 'flex',
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              size="small"
              variant="outlined"
              color={currentYear?.id ? 'primary' : 'default'}
              label={`Global academic year · ${  yearLabel}`}
            />
            <Chip
              size="small"
              variant="outlined"
              color="warning"
              label="UI preview · sample figures"
              title="These sample figures are for the design preview and are not connected to live finance data."
            />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <CustomDateRangePicker
              value={dateRange}
              onChange={setDateRange}
              label="Activity date range"
              title="Select activity date range"
              dateFormat="DD MMM YYYY"
              minDate={yearStart ?? undefined}
              maxDate={yearEnd ?? undefined}
              disabled={!hasValidAcademicYear}
              calendars={2}
              showShortcuts={false}
              allowManualInput
            />
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              <Button
                size="small"
                color="inherit"
                onClick={() => applyPreset('week')}
                disabled={!hasValidAcademicYear}
              >
                Last 7 days
              </Button>
              <Button
                size="small"
                color="inherit"
                onClick={() => applyPreset('month')}
                disabled={!hasValidAcademicYear}
              >
                This month
              </Button>
              <Button
                size="small"
                color="inherit"
                onClick={() => applyPreset('year')}
                disabled={!hasValidAcademicYear}
              >
                Full year
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {!currentYear?.id ? (
          <Alert severity="info">
            Choose an academic year from the global selector to view its board, medium and finance
            context.
          </Alert>
        ) : !hasValidAcademicYear ? (
          <Alert severity="warning">
            The selected academic year does not have valid start and end dates. Update the year
            dates before filtering dashboard activity.
          </Alert>
        ) : null}

        <Paper
          variant="outlined"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, 1fr)' },
            px: { xs: 2, md: 2.5 },
            py: 1.5,
            '& > *:nth-of-type(even)': { borderRight: { xs: 0, lg: '1px solid' } },
          }}
        >
          <Box sx={{ p: 1, borderRight: { xs: '1px solid', lg: 0 }, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Fee payments received · activity
            </Typography>
            <Typography variant="h5">{fCurrency(activity.received)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {activity.transactions.toLocaleString('en-IN')} transactions · {rangeLabel}
            </Typography>
          </Box>
          <Box sx={{ p: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Outstanding fees · year snapshot
            </Typography>
            <Typography variant="h5">{fCurrency(financeExposurePreview.outstanding)}</Typography>
            <Typography variant="caption" color="text.secondary">
              Across the selected academic year
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1,
              borderRight: { xs: '1px solid', lg: 0 },
              borderTop: { xs: '1px solid', lg: 0 },
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Awaiting my decision · year queue
            </Typography>
            <Typography variant="h5">{financeQueuePreview.decisions}</Typography>
            <Typography variant="caption" color="text.secondary">
              Requests needing an admin decision
            </Typography>
          </Box>
          <Box sx={{ p: 1, borderTop: { xs: '1px solid', lg: 0 }, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Refunds awaiting payment · year queue
            </Typography>
            <Typography variant="h5">{fCurrency(financeQueuePreview.refundAmount)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {financeQueuePreview.refundRequests} requests
            </Typography>
          </Box>
        </Paper>

        <MoneyTransitMap activity={activity} rangeLabel={rangeLabel} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <ExposureAtlas />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <FinanceAttentionQueue />
          </Grid>
        </Grid>

        <FinanceReportRail />

        <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
          Activity values follow the selected date range. Outstanding, overdue exposure and
          unresolved year queues follow the global academic year and are shown as current snapshots.
        </Typography>
      </Stack>
    </Box>
  );
}
