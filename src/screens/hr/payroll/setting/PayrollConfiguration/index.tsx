'use client';

import type { RootState } from 'src/redux/store';
import type {
  DayCalculationRequest,
  DayCalculationManualMonth,
  DayCalculationMonthPreview,
} from 'src/redux/hr/employee-payroll-api';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import React, { useMemo, useState, useEffect } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetDayCalculationSettingsQuery,
  useSaveDayCalculationSettingsMutation,
  usePreviewDayCalculationSettingsMutation,
} from 'src/redux/hr/employee-payroll-api';
import {
  Box,
  Card,
  Chip,
  Stack,
  Paper,
  Table,
  Button,
  Divider,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  ButtonGroup,
  ToggleButton,
  DialogActions,
  TableContainer,
  LinearProgress,
  ToggleButtonGroup,
} from '@mui/material';

type DayCalculationMode = 'working-days' | 'total-month-days' | 'manual-days';

const modeOptions: Array<{
  value: DayCalculationMode;
  label: string;
  icon: string;
}> = [
  { value: 'working-days', label: 'Working days', icon: 'fluent:calendar-work-week-24-regular' },
  {
    value: 'total-month-days',
    label: 'Total month days',
    icon: 'fluent:calendar-month-24-regular',
  },
  { value: 'manual-days', label: 'Manual days', icon: 'solar:calendar-mark-bold-duotone' },
];

const monthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`;

const formatMonth = (year: number, month: number) =>
  dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('MMM YYYY');

const toManualMonths = (manualByMonth: Record<string, number | ''>): DayCalculationManualMonth[] =>
  Object.entries(manualByMonth)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => {
      const [year, month] = key.split('-').map(Number);
      return { year, month, manualDays: Number(value) };
    });

const PayrollConfiguration = () => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = currentYear?.id;

  const [mode, setMode] = useState<DayCalculationMode>('working-days');
  const [manualByMonth, setManualByMonth] = useState<Record<string, number | ''>>({});
  const [preview, setPreview] = useState<DayCalculationMonthPreview[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [setAllDays, setSetAllDays] = useState('');

  const { data: savedSetting, isFetching } = useGetDayCalculationSettingsQuery(
    { academicYearId },
    { skip: !academicYearId }
  );
  const [previewDayCalculation, { isLoading: isPreviewing }] =
    usePreviewDayCalculationSettingsMutation();
  const [saveDayCalculation, { isLoading: isSaving }] = useSaveDayCalculationSettingsMutation();

  useEffect(() => {
    if (!savedSetting) return;

    setMode(savedSetting.dayCalculationType);
    setPreview(savedSetting.months || []);
    setManualByMonth(
      (savedSetting.months || []).reduce<Record<string, number | ''>>((acc, item) => {
        acc[monthKey(item.year, item.month)] =
          item.manualDays ??
          (savedSetting.dayCalculationType === 'manual-days' ? item.workingDays : '');
        return acc;
      }, {})
    );
  }, [savedSetting]);

  const fillManualFromPreview = (overwrite = false) => {
    setManualByMonth((current) =>
      preview.reduce<Record<string, number | ''>>((acc, item) => {
        const key = monthKey(item.year, item.month);
        acc[key] =
          !overwrite && current[key] !== undefined && current[key] !== ''
            ? current[key]
            : item.workingDays;
        return acc;
      }, {})
    );
  };

  const displayedPreview = useMemo(
    () =>
      preview.map((item) => {
        const key = monthKey(item.year, item.month);
        const manualValue = manualByMonth[key];
        return mode === 'manual-days'
          ? {
              ...item,
              manualDays:
                manualValue === '' || manualValue === undefined ? null : Number(manualValue),
              basisDays: manualValue === '' || manualValue === undefined ? 0 : Number(manualValue),
              dayCalculationType: mode,
            }
          : item;
      }),
    [manualByMonth, mode, preview]
  );

  const summary = useMemo(() => {
    const basisDays = displayedPreview.reduce((sum, item) => sum + item.basisDays, 0);
    const sundays = displayedPreview.reduce((sum, item) => sum + item.sundays, 0);
    const holidays = displayedPreview.reduce((sum, item) => sum + item.holidayDays, 0);
    const average = displayedPreview.length
      ? Math.round((basisDays / displayedPreview.length) * 10) / 10
      : 0;
    return { basisDays, sundays, holidays, average };
  }, [displayedPreview]);

  const manualErrors = useMemo(
    () =>
      displayedPreview.reduce<Record<string, string>>((acc, item) => {
        const key = monthKey(item.year, item.month);
        const value = manualByMonth[key];
        if (mode !== 'manual-days') return acc;
        if (value === '' || value === undefined) {
          acc[key] = 'Required';
        } else if (Number(value) < 1 || Number(value) > item.calendarDays) {
          acc[key] = `1-${item.calendarDays}`;
        }
        return acc;
      }, {}),
    [displayedPreview, manualByMonth, mode]
  );

  const hasManualErrors = Object.keys(manualErrors).length > 0;
  const hasCompleteManualValues =
    mode !== 'manual-days' || (!hasManualErrors && displayedPreview.length > 0);

  useEffect(() => {
    if (mode === 'manual-days' && preview.length) {
      fillManualFromPreview(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, preview.length]);

  useEffect(() => {
    if (!academicYearId || !savedSetting?.months?.length) return undefined;
    if (mode === 'manual-days' && !hasCompleteManualValues) return undefined;

    const timer = window.setTimeout(async () => {
      const body: DayCalculationRequest = {
        academicYearId,
        dayCalculationType: mode,
        manualMonthDays: mode === 'manual-days' ? toManualMonths(manualByMonth) : [],
      };
      try {
        const nextPreview = await previewDayCalculation({ body }).unwrap();
        setPreview(nextPreview.months || []);
      } catch {
        // Toast is handled by save; preview can fail while the user is still editing manual cells.
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [
    academicYearId,
    hasCompleteManualValues,
    manualByMonth,
    mode,
    previewDayCalculation,
    savedSetting?.months?.length,
  ]);

  const fillManual = (source: 'working' | 'calendar' | 'blank', fixedValue?: number) => {
    setManualByMonth(
      preview.reduce<Record<string, number | ''>>((acc, item) => {
        const key = monthKey(item.year, item.month);
        if (fixedValue !== undefined) acc[key] = Math.min(fixedValue, item.calendarDays);
        else if (source === 'working') acc[key] = item.workingDays;
        else if (source === 'calendar') acc[key] = item.calendarDays;
        else acc[key] = '';
        return acc;
      }, {})
    );
  };

  const applySetAllDays = () => {
    const value = Number(setAllDays);
    if (!Number.isFinite(value) || value < 1) {
      toast.error('Enter a valid day count.');
      return;
    }
    fillManual('working', Math.floor(value));
  };

  const handleSave = async () => {
    if (!academicYearId) {
      toast.error('Select an academic year first.');
      return;
    }
    if (!hasCompleteManualValues) {
      toast.error('Enter valid manual days for every month.');
      return;
    }

    const body: DayCalculationRequest = {
      academicYearId,
      dayCalculationType: mode,
      manualMonthDays: mode === 'manual-days' ? toManualMonths(manualByMonth) : [],
    };

    try {
      const response = await saveDayCalculation({ body }).unwrap();
      if (response.setting?.months) {
        setPreview(response.setting.months);
      }
      setLastSavedAt(dayjs().format('DD MMM YYYY, hh:mm A'));
      toast.success(response.message || 'Payroll configuration saved.');
    } catch {
      toast.error('Could not save payroll configuration.');
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Payroll Configuration"
        description="Configure salary day basis for the selected academic year."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Management', href: hrPaths.payroll.runPayroll },
          { name: 'Settings', href: hrPaths.payroll.settings.earningComponents },
          { name: 'Payroll Configuration' },
        ]}
      />

      <Card
        sx={{
          height: '100%',
          boxShadow: theme.customShadows.z4,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {(isFetching || isPreviewing) && <LinearProgress />}

        <Scrollbar sx={{ flexGrow: 1 }}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1 }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Stack spacing={0.75}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="h6">Day calculation policy</Typography>
                      <Chip
                        size="small"
                        label={currentYear?.name || 'No academic year selected'}
                        color={academicYearId ? 'primary' : 'default'}
                        variant="outlined"
                      />
                      {savedSetting?.usedFallbackSetting && (
                        <Chip size="small" label="Using tenant default" color="warning" />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {currentYear?.startDate && currentYear?.endDate
                        ? `${dayjs(currentYear.startDate).format('DD MMM YYYY')} - ${dayjs(
                            currentYear.endDate
                          ).format('DD MMM YYYY')}`
                        : 'Select an academic year from the global selector.'}
                    </Typography>
                  </Stack>

                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={mode}
                    onChange={(_, value) => value && setMode(value)}
                    sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}
                  >
                    {modeOptions.map((option) => (
                      <ToggleButton key={option.value} value={option.value} sx={{ px: 1.5 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Iconify icon={option.icon} width={18} />
                          <Typography variant="button">{option.label}</Typography>
                        </Stack>
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Stack>
              </Paper>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                {[
                  { label: 'Annual basis days', value: summary.basisDays, icon: 'mdi:sigma' },
                  {
                    label: 'Average per month',
                    value: summary.average,
                    icon: 'mdi:calendar-range',
                  },
                  { label: 'Sundays', value: summary.sundays, icon: 'mdi:calendar-weekend' },
                  { label: 'Holidays counted', value: summary.holidays, icon: 'mdi:calendar-star' },
                ].map((item) => (
                  <Paper
                    key={item.label}
                    variant="outlined"
                    sx={{ p: 2, flex: 1, borderRadius: 1 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 1,
                          display: 'grid',
                          placeItems: 'center',
                          color: 'primary.main',
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        }}
                      >
                        <Iconify icon={item.icon} width={19} />
                      </Box>
                      <Box>
                        <Typography variant="h6" lineHeight={1.1}>
                          {item.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              {mode === 'manual-days' && (
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={1.5}
                  >
                    <Typography variant="subtitle2">Manual month tools</Typography>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'stretch', md: 'center' }}
                    >
                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          type="number"
                          value={setAllDays}
                          placeholder="Set all"
                          inputProps={{ min: 1, max: 31 }}
                          onChange={(event) => setSetAllDays(event.target.value)}
                          sx={{ width: 112 }}
                        />
                        <Button size="small" variant="contained" onClick={applySetAllDays}>
                          Apply
                        </Button>
                      </Stack>
                      <ButtonGroup size="small" variant="outlined">
                        <Button onClick={() => fillManual('working')}>Copy working</Button>
                        <Button onClick={() => fillManual('calendar')}>Copy calendar</Button>
                        <Button onClick={() => fillManual('blank')}>Clear</Button>
                      </ButtonGroup>
                    </Stack>
                  </Stack>
                </Paper>
              )}

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Calendar days</TableCell>
                      <TableCell align="right">Sundays</TableCell>
                      <TableCell align="right">Holidays</TableCell>
                      <TableCell align="right">Working days</TableCell>
                      <TableCell align="right">Manual days</TableCell>
                      <TableCell align="right">Payroll basis</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedPreview.map((item) => {
                      const key = monthKey(item.year, item.month);
                      const error = manualErrors[key];
                      return (
                        <TableRow key={key} hover>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {formatMonth(item.year, item.month)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{item.calendarDays}</TableCell>
                          <TableCell align="right">{item.sundays}</TableCell>
                          <TableCell align="right">
                            <Tooltip
                              title={
                                item.holidayNames?.length
                                  ? item.holidayNames.join(', ')
                                  : 'No payroll holidays'
                              }
                            >
                              <Chip size="small" label={item.holidayDays} variant="outlined" />
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">{item.workingDays}</TableCell>
                          <TableCell align="right" sx={{ width: 150 }}>
                            {mode === 'manual-days' ? (
                              <TextField
                                size="small"
                                type="number"
                                value={manualByMonth[key] ?? ''}
                                error={!!error}
                                helperText={error || ' '}
                                inputProps={{ min: 1, max: item.calendarDays }}
                                onChange={(event) => {
                                  const { value } = event.target;
                                  setManualByMonth((prev) => ({
                                    ...prev,
                                    [key]: value === '' ? '' : Number(value),
                                  }));
                                }}
                                sx={{ maxWidth: 112 }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2" color="primary.main">
                              {item.basisDays}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </Box>
        </Scrollbar>

        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {lastSavedAt ? `Last saved ${lastSavedAt}` : 'Changes apply to future payroll runs.'}
          </Typography>
          <LoadingButton
            variant="contained"
            size="small"
            loading={isSaving}
            disabled={!academicYearId || !hasCompleteManualValues}
            startIcon={<Iconify icon="mdi:content-save" />}
            onClick={handleSave}
          >
            Save configuration
          </LoadingButton>
        </DialogActions>
      </Card>
    </Box>
  );
};

export default PayrollConfiguration;
