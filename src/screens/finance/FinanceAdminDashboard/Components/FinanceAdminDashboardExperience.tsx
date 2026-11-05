'use client';

import type { RootState } from 'src/redux/store';
import type { DateRange } from 'src/components/custom-date-range-picker';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { useMemo, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import { financePaths } from 'src/constants/finance-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { Box, Chip, Grid, Alert, Paper, Stack, Button, Typography } from '@mui/material';

import ExposureAtlas from './ExposureAtlas';
import MoneyTransitMap from './MoneyTransitMap';
import { FinanceReportRail, FinanceAttentionQueue } from './FinanceActionRail';
import { financeNoteFrameSx, financeNoteInnerSx } from './finance-dashboard-note-styles';
import {
  financeQueuePreview,
  financeExposurePreview,
  summarizeFinanceActivity,
} from '../finance-admin-dashboard-preview-data';

function academicYearName(year: Record<string, any>) {
  if (year.name || year.academicYearName || year.yearName) {
    return year.name || year.academicYearName || year.yearName;
  }

  const start = year.startDate ? dayjs(year.startDate).year() : null;
  const end = year.endDate ? dayjs(year.endDate).year() : null;
  return start && end ? `AY ${start}–${end}` : 'Selected academic year';
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
      ? `${fromDate.format('DD MMM YYYY')} – ${toDate.format('DD MMM YYYY')}`
      : 'Select a valid date range';
  const confirmedNet = activity.confirmedIncome - activity.expenses;
  const statementFacts = [
    {
      label: 'Fee payments received · activity',
      value: formatNumber(activity.received, 'INR'),
      detail: `${activity.transactions.toLocaleString('en-IN')} transactions · ${rangeLabel}`,
    },
    {
      label: 'Awaiting my decision · year queue',
      value: String(financeQueuePreview.decisions),
      detail: 'Requests needing an admin decision',
    },
    {
      label: 'Refunds awaiting payment · year queue',
      value: formatNumber(financeQueuePreview.refundAmount, 'INR'),
      detail: `${financeQueuePreview.refundRequests} requests`,
    },
  ];

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
              label={`Global academic year · ${yearLabel}`}
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
          component="section"
          aria-label="Finance Statement"
          variant="outlined"
          sx={financeNoteFrameSx}
        >
          <Box sx={financeNoteInnerSx}>
            <Box
              sx={{
                p: { xs: 2, md: 3 },
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
                gap: { xs: 3, md: 4 },
                alignItems: 'center',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" color="success.main" sx={{ letterSpacing: 2 }}>
                  Finance Statement · {yearLabel}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Net movement · activity
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    mt: 0.5,
                    color: 'text.primary',
                    lineHeight: 1.05,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {formatNumber(confirmedNet, 'INR')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Confirmed income {formatNumber(activity.confirmedIncome, 'INR')} less recorded
                  expenses {formatNumber(activity.expenses, 'INR')} · {rangeLabel}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: { xs: 200, sm: 220 },
                  aspectRatio: '1',
                  borderRadius: '50%',
                  border: (theme) => `4px double ${alpha(theme.palette.success.main, 0.65)}`,
                  outline: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                  outlineOffset: 7,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.055),
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                  mx: { xs: 'auto', md: 0 },
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Outstanding fees · year snapshot
                </Typography>
                <Typography variant="h5" sx={{ color: 'text.primary', mt: 0.5 }}>
                  {formatNumber(financeExposurePreview.outstanding, 'INR')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Across the selected academic year
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                borderTop: '1px dashed',
                borderColor: 'success.main',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
              }}
            >
              {statementFacts.map((fact, index) => (
                <Box
                  key={fact.label}
                  sx={{
                    minWidth: 0,
                    px: { xs: 2, md: 3 },
                    py: 2,
                    borderRight: { sm: index < 2 ? '1px dashed' : 0 },
                    borderBottom: { xs: index < 2 ? '1px dashed' : 0, sm: 0 },
                    borderColor: (theme) => alpha(theme.palette.success.main, 0.3),
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {fact.label}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
                    {fact.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fact.detail}
                  </Typography>
                </Box>
              ))}
            </Box>
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
      </Stack>
    </Box>
  );
}
