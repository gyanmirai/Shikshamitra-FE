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
import { Box, Grid, Alert, Paper, Stack, Button, Typography } from '@mui/material';

import ExposureAtlas from './ExposureAtlas';
import MoneyTransitMap from './MoneyTransitMap';
import { FinanceReportRail, FinanceAttentionQueue } from './FinanceActionRail';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
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
      label: 'Fee Payments Received',
      value: formatNumber(activity.received, 'INR'),
      info: 'Fee payments received within the selected activity dates.',
    },
    {
      label: 'Awaiting My Decision',
      value: String(financeQueuePreview.decisions),
      info: 'Requests awaiting an admin decision for the selected academic year. The activity date filter does not change this queue.',
    },
    {
      label: 'Refunds Awaiting Payment',
      value: formatNumber(financeQueuePreview.refundAmount, 'INR'),
      info: `${financeQueuePreview.refundRequests} refund requests awaiting payment for the selected academic year. The activity date filter does not change this queue.`,
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
            px: 1,
            py: 1,
            display: 'flex',
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'flex-end',
            gap: 1.5,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
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
            <Stack
              direction="row"
              spacing={1}
              sx={{
                flexShrink: 0,
                minWidth: 0,
                maxWidth: '100%',
                overflowX: 'auto',
                '& .MuiButton-root': { whiteSpace: 'nowrap', flexShrink: 0 },
              }}
            >
              <Button
                size="small"
                color="inherit"
                onClick={() => applyPreset('week')}
                disabled={!hasValidAcademicYear}
              >
                Last Seven Days
              </Button>
              <Button
                size="small"
                color="inherit"
                onClick={() => applyPreset('month')}
                disabled={!hasValidAcademicYear}
              >
                This Month
              </Button>
              <Button
                size="small"
                color="inherit"
                onClick={() => applyPreset('year')}
                disabled={!hasValidAcademicYear}
              >
                Full Year
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {!currentYear?.id ? (
          <Alert severity="info">
            Choose an academic year using the global selector on another Finance page, then return
            to this dashboard.
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
                alignItems: 'center',
                gap: { xs: 3, md: 4 },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" alignItems="center">
                  <Typography variant="overline" color="success.main" sx={{ letterSpacing: 2 }}>
                    Finance Statement
                  </Typography>
                  <InfoTooltipIcon
                    title={`Net movement is confirmed income less recorded expenses for the selected activity dates, not a bank balance. Outstanding fees cover ${yearLabel}. These figures use the existing dashboard preview data.`}
                    label="Finance Statement information"
                  />
                </Stack>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Net Movement
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    mt: 0.5,
                    lineHeight: 1.05,
                    fontVariantNumeric: 'tabular-nums',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {formatNumber(confirmedNet, 'INR')}
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
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  mx: { xs: 'auto', md: 0 },
                }}
              >
                <Stack direction="row" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Outstanding Fees
                  </Typography>
                  <InfoTooltipIcon
                    title={`Outstanding fees for ${yearLabel}; unaffected by activity dates.`}
                    label="Outstanding Fees information"
                  />
                </Stack>
                <Typography variant="h5">
                  {formatNumber(financeExposurePreview.outstanding, 'INR')}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                borderTop: '1px dashed',
                borderColor: 'success.main',
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
                  <Stack direction="row" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {fact.label}
                    </Typography>
                    <InfoTooltipIcon title={fact.info} label={`${fact.label} information`} />
                  </Stack>
                  <Typography variant="h5" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
                    {fact.value}
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
