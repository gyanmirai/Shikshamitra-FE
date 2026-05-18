'use client';

import type { RootState } from 'src/redux/store';
import type {
  SaturdayWorkPolicy,
  DayCalculationRequest,
  PayrollHolidayOverride,
  PayrollResolvedHoliday,
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
import CustomSelect from 'src/components/custom-select';
import { CustomTabs } from 'src/components/custom-tabs';
import React, { useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetDayCalculationSettingsQuery,
  useSaveDayCalculationSettingsMutation,
  usePreviewDayCalculationSettingsMutation,
} from 'src/redux/hr/employee-payroll-api';
import {
  Box,
  Tab,
  Card,
  Chip,
  Stack,
  Paper,
  Table,
  Alert,
  Button,
  Switch,
  Divider,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  ButtonGroup,
  DialogActions,
  TableContainer,
  LinearProgress,
  FormControlLabel,
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

const saturdayOptions: Array<{
  value: SaturdayWorkPolicy;
  label: string;
  icon: string;
}> = [
  { value: 'full-day', label: 'Full day', icon: 'mdi:calendar-check-outline' },
  { value: 'half-day', label: 'Half day', icon: 'mdi:calendar-clock-outline' },
  { value: 'off', label: 'Off', icon: 'mdi:calendar-remove-outline' },
];

const modeLabelMap: Record<DayCalculationMode, string> = modeOptions.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {} as Record<DayCalculationMode, string>
);

const saturdayLabelMap: Record<SaturdayWorkPolicy, string> = saturdayOptions.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {} as Record<SaturdayWorkPolicy, string>
);

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

const holidayKey = (holiday: Pick<PayrollHolidayOverride, 'date' | 'calendarHolidayId'>) =>
  `${dayjs(holiday.date).format('YYYY-MM-DD')}::${holiday.calendarHolidayId || 'payroll'}`;

const normalizeHolidayOverrides = (items: PayrollHolidayOverride[]) =>
  [...items]
    .map((item) => ({
      ...item,
      date: dayjs(item.date).format('YYYY-MM-DD'),
      calendarHolidayId: item.calendarHolidayId || null,
    }))
    .sort((a, b) => holidayKey(a).localeCompare(holidayKey(b)));

const areHolidayOverridesEqual = (
  first: PayrollHolidayOverride[],
  second: PayrollHolidayOverride[]
) =>
  JSON.stringify(normalizeHolidayOverrides(first)) ===
  JSON.stringify(normalizeHolidayOverrides(second));

type SaveIntent = 'policy' | 'holiday' | 'manual';
type PayrollConfigTab = 'preview' | 'holidays';

const PayrollConfiguration = () => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = currentYear?.id;

  const [mode, setMode] = useState<DayCalculationMode>('working-days');
  const [saturdayWorkPolicy, setSaturdayWorkPolicy] = useState<SaturdayWorkPolicy>('full-day');
  const [savedMode, setSavedMode] = useState<DayCalculationMode>('working-days');
  const [savedSaturdayWorkPolicy, setSavedSaturdayWorkPolicy] =
    useState<SaturdayWorkPolicy>('full-day');
  const [manualByMonth, setManualByMonth] = useState<Record<string, number | ''>>({});
  const [savedManualByMonth, setSavedManualByMonth] = useState<Record<string, number | ''>>({});
  const [holidayOverrides, setHolidayOverrides] = useState<PayrollHolidayOverride[]>([]);
  const [savedHolidayOverrides, setSavedHolidayOverrides] = useState<PayrollHolidayOverride[]>([]);
  const [preview, setPreview] = useState<DayCalculationMonthPreview[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [setAllDays, setSetAllDays] = useState('');
  const [saveIntent, setSaveIntent] = useState<SaveIntent | null>(null);
  const [activeTab, setActiveTab] = useState<PayrollConfigTab>('preview');
  const [holidayDialogMonth, setHolidayDialogMonth] = useState<DayCalculationMonthPreview | null>(
    null
  );
  const [holidayForm, setHolidayForm] = useState({
    date: '',
    holidayName: '',
    includedInPayroll: true,
  });

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
    setSavedMode(savedSetting.dayCalculationType);
    setSaturdayWorkPolicy(savedSetting.saturdayWorkPolicy || 'full-day');
    setSavedSaturdayWorkPolicy(savedSetting.saturdayWorkPolicy || 'full-day');
    setHolidayOverrides(savedSetting.holidayOverrides || []);
    setSavedHolidayOverrides(savedSetting.holidayOverrides || []);
    setPreview(savedSetting.months || []);
    const nextManualByMonth = (savedSetting.months || []).reduce<Record<string, number | ''>>(
      (acc, item) => {
        acc[monthKey(item.year, item.month)] =
          item.manualDays ??
          (savedSetting.dayCalculationType === 'manual-days' ? item.workingDays : '');
        return acc;
      },
      {}
    );
    setManualByMonth(nextManualByMonth);
    setSavedManualByMonth(nextManualByMonth);
  }, [savedSetting]);

  const fillManualFromPreview = (overwrite = false) => {
    setManualByMonth((current) =>
      preview.reduce<Record<string, number | ''>>((acc, item) => {
        const key = monthKey(item.year, item.month);
        acc[key] =
          !overwrite && current[key] !== undefined && current[key] !== ''
            ? current[key]
            : Math.floor(item.workingDays);
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
    const weeklyOff = displayedPreview.reduce((sum, item) => sum + item.weeklyOffDays, 0);
    const holidays = displayedPreview.reduce((sum, item) => sum + item.payrollHolidayUnits, 0);
    const average = displayedPreview.length
      ? Math.round((basisDays / displayedPreview.length) * 10) / 10
      : 0;
    return { basisDays, weeklyOff, holidays, average };
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

  const isPolicyDirty = mode !== savedMode || saturdayWorkPolicy !== savedSaturdayWorkPolicy;
  const isManualDirty =
    mode === 'manual-days' && JSON.stringify(manualByMonth) !== JSON.stringify(savedManualByMonth);
  const isHolidayDirty = !areHolidayOverridesEqual(holidayOverrides, savedHolidayOverrides);
  const hasUnsavedChanges = isPolicyDirty || isManualDirty || isHolidayDirty;

  const holidayRows = useMemo(
    () =>
      displayedPreview.flatMap((item) =>
        (item.holidays || []).map((holiday) => ({
          ...holiday,
          monthLabel: formatMonth(item.year, item.month),
          monthKey: monthKey(item.year, item.month),
          locked: item.locked,
        }))
      ),
    [displayedPreview]
  );

  const editableMonthOptions = useMemo(
    () =>
      displayedPreview
        .filter((item) => !item.locked)
        .map((item) => ({
          label: formatMonth(item.year, item.month),
          value: monthKey(item.year, item.month),
        })),
    [displayedPreview]
  );

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
        saturdayWorkPolicy,
        holidaySyncMode: 'synced-with-overrides',
        manualMonthDays: mode === 'manual-days' ? toManualMonths(manualByMonth) : [],
        holidayOverrides,
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
    saturdayWorkPolicy,
    holidayOverrides,
    previewDayCalculation,
    savedSetting?.months?.length,
  ]);

  const fillManual = (source: 'working' | 'calendar' | 'blank', fixedValue?: number) => {
    setManualByMonth(
      preview.reduce<Record<string, number | ''>>((acc, item) => {
        const key = monthKey(item.year, item.month);
        if (fixedValue !== undefined) acc[key] = Math.min(fixedValue, item.calendarDays);
        else if (source === 'working') acc[key] = Math.floor(item.workingDays);
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

  const requestSave = (intent: SaveIntent) => {
    if (!academicYearId) {
      toast.error('Select an academic year first.');
      return;
    }
    if (!hasCompleteManualValues) {
      toast.error('Enter valid manual days for every month.');
      return;
    }
    setSaveIntent(intent);
  };

  const updateHolidayOverride = (holiday: PayrollResolvedHoliday, includedInPayroll: boolean) => {
    const override: PayrollHolidayOverride = {
      date: dayjs(holiday.date).format('YYYY-MM-DD'),
      holidayName: holiday.holidayName,
      includedInPayroll,
      calendarHolidayId: holiday.calendarHolidayId || null,
    };

    setHolidayOverrides((current) => [
      ...current.filter((item) => holidayKey(item) !== holidayKey(override)),
      override,
    ]);
    requestSave('holiday');
  };

  const removePayrollHoliday = (holiday: PayrollResolvedHoliday) => {
    setHolidayOverrides((current) =>
      current.filter(
        (item) =>
          !(
            !item.calendarHolidayId &&
            dayjs(item.date).isSame(dayjs(holiday.date), 'day') &&
            item.holidayName === holiday.holidayName
          )
      )
    );
    requestSave('holiday');
  };

  const openHolidayDialog = (item?: DayCalculationMonthPreview) => {
    const targetMonth = item || displayedPreview.find((month) => !month.locked) || null;
    if (!targetMonth) {
      toast.error('No editable payroll month is available.');
      return;
    }

    const key = monthKey(targetMonth.year, targetMonth.month);
    setHolidayDialogMonth(targetMonth);
    setHolidayForm({
      date: `${key}-01`,
      holidayName: '',
      includedInPayroll: true,
    });
  };

  const closeHolidayDialog = () => {
    setHolidayDialogMonth(null);
    setHolidayForm({ date: '', holidayName: '', includedInPayroll: true });
  };

  const addPayrollHoliday = () => {
    if (!holidayDialogMonth) return;

    const key = monthKey(holidayDialogMonth.year, holidayDialogMonth.month);
    if (!holidayForm.holidayName.trim()) {
      toast.error('Enter a holiday name.');
      return;
    }
    if (!dayjs(holidayForm.date).isValid() || dayjs(holidayForm.date).format('YYYY-MM') !== key) {
      toast.error('Select a date in the same month.');
      return;
    }

    const override: PayrollHolidayOverride = {
      date: dayjs(holidayForm.date).format('YYYY-MM-DD'),
      holidayName: holidayForm.holidayName.trim(),
      includedInPayroll: holidayForm.includedInPayroll,
      calendarHolidayId: null,
    };

    setHolidayOverrides((current) => [
      ...current.filter((existing) => holidayKey(existing) !== holidayKey(override)),
      override,
    ]);
    closeHolidayDialog();
    requestSave('holiday');
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
      saturdayWorkPolicy,
      holidaySyncMode: 'synced-with-overrides',
      manualMonthDays: mode === 'manual-days' ? toManualMonths(manualByMonth) : [],
      holidayOverrides,
    };

    try {
      const response = await saveDayCalculation({ body }).unwrap();
      if (response.setting?.months) {
        setPreview(response.setting.months);
      }
      setSavedMode(mode);
      setSavedSaturdayWorkPolicy(saturdayWorkPolicy);
      setSavedManualByMonth(manualByMonth);
      setSavedHolidayOverrides(holidayOverrides);
      setLastSavedAt(dayjs().format('DD MMM YYYY, hh:mm A'));
      setSaveIntent(null);
      toast.success(response.message || 'Payroll configuration saved.');
    } catch {
      toast.error('Could not save payroll configuration.');
    }
  };

  const saveIntentTitle =
    saveIntent === 'policy'
      ? 'Apply payroll policy changes?'
      : saveIntent === 'holiday'
        ? 'Apply holiday changes?'
        : 'Save manual day changes?';

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
                <Stack spacing={2.5}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Stack spacing={0.75}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="h6">Payroll policies</Typography>
                        <Chip
                          size="small"
                          label={currentYear?.name || 'No academic year selected'}
                          color={academicYearId ? 'primary' : 'default'}
                          variant="outlined"
                        />
                        {savedSetting?.usedFallbackSetting && (
                          <Chip size="small" label="Using tenant default" color="warning" />
                        )}
                        {isPolicyDirty && <Chip size="small" label="Pending" color="warning" />}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {currentYear?.startDate && currentYear?.endDate
                          ? `${dayjs(currentYear.startDate).format('DD MMM YYYY')} - ${dayjs(
                              currentYear.endDate
                            ).format('DD MMM YYYY')}`
                          : 'Select an academic year from the global selector.'}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      {isPreviewing && <Chip size="small" label="Updating preview" />}
                      <LoadingButton
                        size="small"
                        variant="contained"
                        loading={isSaving && saveIntent === 'policy'}
                        disabled={!isPolicyDirty || !academicYearId || !hasCompleteManualValues}
                        startIcon={<Iconify icon="mdi:clipboard-check-outline" />}
                        onClick={() => requestSave('policy')}
                      >
                        Review & apply
                      </LoadingButton>
                    </Stack>
                  </Stack>

                  {isPolicyDirty && (
                    <Alert severity="warning" variant="outlined">
                      Policy changes are only a preview until reviewed and applied.
                    </Alert>
                  )}

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Stack spacing={0.75} sx={{ flex: 1 }}>
                      <CustomSelect
                        label="Day calculation policy"
                        value={mode}
                        options={modeOptions.map((option) => ({
                          label: option.label,
                          value: option.value,
                        }))}
                        onChange={(value) => setMode(value as DayCalculationMode)}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Current saved: {modeLabelMap[savedMode]}
                        {mode !== savedMode ? `, pending: ${modeLabelMap[mode]}` : ''}
                      </Typography>
                    </Stack>

                    <Stack spacing={0.75} sx={{ flex: 1 }}>
                      <CustomSelect
                        label="Saturday payroll policy"
                        value={saturdayWorkPolicy}
                        options={saturdayOptions.map((option) => ({
                          label: option.label,
                          value: option.value,
                        }))}
                        onChange={(value) => setSaturdayWorkPolicy(value as SaturdayWorkPolicy)}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Current saved: {saturdayLabelMap[savedSaturdayWorkPolicy]}
                        {saturdayWorkPolicy !== savedSaturdayWorkPolicy
                          ? `, pending: ${saturdayLabelMap[saturdayWorkPolicy]}`
                          : ''}
                        . Sunday is always treated as weekly off.
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ borderRadius: 1 }}>
                <CustomTabs
                  value={activeTab}
                  onChange={(_, value) => setActiveTab(value)}
                  sx={{ '& .MuiTabs-flexContainer': { gap: 1 } }}
                >
                  <Tab
                    value="preview"
                    label="Payroll Preview"
                    icon={<Iconify icon="mdi:table-eye" width={18} />}
                  />
                  <Tab
                    value="holidays"
                    label="Holiday Setup"
                    icon={<Iconify icon="mdi:calendar-star-outline" width={18} />}
                  />
                </CustomTabs>
              </Paper>

              {activeTab === 'preview' && (
                <>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    {[
                      { label: 'Annual basis days', value: summary.basisDays, icon: 'mdi:sigma' },
                      {
                        label: 'Average per month',
                        value: summary.average,
                        icon: 'mdi:calendar-range',
                      },
                      {
                        label: 'Weekly off units',
                        value: summary.weeklyOff,
                        icon: 'mdi:calendar-weekend',
                      },
                      {
                        label: 'Holiday units',
                        value: summary.holidays,
                        icon: 'mdi:calendar-star',
                      },
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
                          <TableCell align="right">Saturdays</TableCell>
                          <TableCell align="right">Holiday units</TableCell>
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
                                {item.saturdays} / {item.saturdayUnits}
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip
                                  title={
                                    item.holidayNames?.length
                                      ? item.holidayNames.join(', ')
                                      : 'No payroll holidays'
                                  }
                                >
                                  <Chip
                                    size="small"
                                    label={`${item.payrollHolidayDays} / ${item.payrollHolidayUnits}`}
                                    variant="outlined"
                                  />
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
                                    disabled={item.locked}
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
                </>
              )}

              {activeTab === 'holidays' && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent="space-between"
                      spacing={1.5}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="mdi:calendar-star-outline" width={20} />
                        <Box>
                          <Typography variant="subtitle1">Payroll holidays</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Synced calendar holidays and payroll-only adjustments.
                          </Typography>
                        </Box>
                        {isHolidayDirty && <Chip size="small" label="Pending" color="warning" />}
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={!editableMonthOptions.length}
                          startIcon={<Iconify icon="mdi:calendar-plus-outline" />}
                          onClick={() => openHolidayDialog()}
                        >
                          Add holiday
                        </Button>
                        <LoadingButton
                          size="small"
                          variant="contained"
                          loading={isSaving && saveIntent === 'holiday'}
                          disabled={!isHolidayDirty || !academicYearId || !hasCompleteManualValues}
                          startIcon={<Iconify icon="mdi:clipboard-check-outline" />}
                          onClick={() => requestSave('holiday')}
                        >
                          Review & apply
                        </LoadingButton>
                      </Stack>
                    </Stack>

                    {isHolidayDirty && (
                      <Alert severity="warning" variant="outlined">
                        Holiday changes are previewed in the table and need confirmation before they
                        are saved.
                      </Alert>
                    )}

                    <TableContainer variant="outlined" component={Paper} sx={{ borderRadius: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Month</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Holiday</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell align="center">Count in payroll</TableCell>
                            <TableCell align="right">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {holidayRows.length ? (
                            holidayRows.map((holiday) => (
                              <TableRow
                                key={`${holiday.monthKey}-${holiday.date}-${
                                  holiday.calendarHolidayId || holiday.holidayName
                                }`}
                                hover
                              >
                                <TableCell>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="body2">{holiday.monthLabel}</Typography>
                                    {holiday.locked && (
                                      <Chip size="small" label="Locked" color="default" />
                                    )}
                                  </Stack>
                                </TableCell>
                                <TableCell>{dayjs(holiday.date).format('DD MMM YYYY')}</TableCell>
                                <TableCell>
                                  <Typography variant="subtitle2">{holiday.holidayName}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={
                                      holiday.source === 'payroll'
                                        ? 'Payroll only'
                                        : 'Tenant calendar'
                                    }
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  {holiday.source === 'payroll' ? (
                                    <Chip
                                      size="small"
                                      label={holiday.includedInPayroll ? 'Yes' : 'No'}
                                      color={holiday.includedInPayroll ? 'success' : 'default'}
                                      variant="outlined"
                                    />
                                  ) : (
                                    <FormControlLabel
                                      sx={{ m: 0 }}
                                      control={
                                        <Switch
                                          size="small"
                                          checked={holiday.includedInPayroll}
                                          disabled={!holiday.isEditable}
                                          onChange={(event) =>
                                            updateHolidayOverride(holiday, event.target.checked)
                                          }
                                        />
                                      }
                                      label=""
                                    />
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  {holiday.source === 'payroll' ? (
                                    <Tooltip
                                      title={holiday.locked ? 'Past month is locked' : 'Remove'}
                                    >
                                      <span>
                                        <IconButton
                                          size="small"
                                          disabled={holiday.locked}
                                          onClick={() => removePayrollHoliday(holiday)}
                                        >
                                          <Iconify icon="mdi:delete-outline" width={18} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      Synced
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <Typography variant="body2" color="text.secondary" align="center">
                                  No payroll holidays found for this academic year.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Box>
        </Scrollbar>

        <Divider />
        <DialogActions
          sx={{
            px: 3,
            py: 1.5,
            justifyContent: 'space-between',
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={0.25}>
            <Typography
              variant="caption"
              color={hasUnsavedChanges ? 'warning.main' : 'text.secondary'}
            >
              {hasUnsavedChanges
                ? [
                    isPolicyDirty ? 'Unsaved policy changes' : null,
                    isManualDirty ? 'Unsaved manual day changes' : null,
                    isHolidayDirty ? 'Unsaved holiday changes' : null,
                  ]
                    .filter(Boolean)
                    .join(', ')
                : lastSavedAt
                  ? `Last saved ${lastSavedAt}`
                  : 'Changes apply to future payroll runs.'}
            </Typography>
            {hasUnsavedChanges && (
              <Typography variant="caption" color="text.secondary">
                Preview is updated. Use Review & apply to save policy or holiday changes.
              </Typography>
            )}
          </Stack>
          <LoadingButton
            variant="contained"
            size="small"
            loading={isSaving && saveIntent === 'manual'}
            disabled={!isManualDirty || !academicYearId || !hasCompleteManualValues}
            startIcon={<Iconify icon="mdi:content-save" />}
            onClick={() => requestSave('manual')}
          >
            Save manual days
          </LoadingButton>
        </DialogActions>
      </Card>

      <CustomDialog
        open={!!holidayDialogMonth}
        handleClose={closeHolidayDialog}
        title="Add payroll holiday"
        maxWidth="sm"
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <CustomSelect
              label="Month"
              value={
                holidayDialogMonth
                  ? monthKey(holidayDialogMonth.year, holidayDialogMonth.month)
                  : ''
              }
              options={editableMonthOptions}
              onChange={(value) => {
                const selectedMonth = displayedPreview.find(
                  (item) => monthKey(item.year, item.month) === value
                );
                if (!selectedMonth) return;

                const key = monthKey(selectedMonth.year, selectedMonth.month);
                setHolidayDialogMonth(selectedMonth);
                setHolidayForm((current) => ({ ...current, date: `${key}-01` }));
              }}
            />
            <TextField
              size="small"
              type="date"
              label="Payroll holiday date"
              value={holidayForm.date}
              inputProps={
                holidayDialogMonth
                  ? {
                      min: `${monthKey(holidayDialogMonth.year, holidayDialogMonth.month)}-01`,
                      max: `${monthKey(holidayDialogMonth.year, holidayDialogMonth.month)}-${String(
                        holidayDialogMonth.calendarDays
                      ).padStart(2, '0')}`,
                    }
                  : undefined
              }
              onChange={(event) =>
                setHolidayForm((current) => ({ ...current, date: event.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="Holiday name"
              value={holidayForm.holidayName}
              onChange={(event) =>
                setHolidayForm((current) => ({ ...current, holidayName: event.target.value }))
              }
              required
              autoFocus
            />
            <FormControlLabel
              control={
                <Switch
                  checked={holidayForm.includedInPayroll}
                  onChange={(event) =>
                    setHolidayForm((current) => ({
                      ...current,
                      includedInPayroll: event.target.checked,
                    }))
                  }
                />
              }
              label="Count in payroll"
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button variant="outlined" color="inherit" size="small" onClick={closeHolidayDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mdi:calendar-plus-outline" />}
            onClick={addPayrollHoliday}
          >
            Add holiday
          </Button>
        </DialogActions>
      </CustomDialog>

      <ConfirmDialog
        open={!!saveIntent}
        onClose={() => setSaveIntent(null)}
        icon="warning"
        title={saveIntentTitle}
        content={
          <Stack spacing={1.25}>
            <Typography variant="body2">
              Academic year: {currentYear?.name || 'No academic year selected'}
            </Typography>
            {(saveIntent === 'policy' || isPolicyDirty) && (
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                <Stack spacing={0.75}>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="caption" color="text.secondary">
                      Day calculation
                    </Typography>
                    <Typography variant="body2">
                      {modeLabelMap[savedMode]} to {modeLabelMap[mode]}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="caption" color="text.secondary">
                      Saturday payroll
                    </Typography>
                    <Typography variant="body2">
                      {saturdayLabelMap[savedSaturdayWorkPolicy]} to{' '}
                      {saturdayLabelMap[saturdayWorkPolicy]}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            )}
            {saveIntent === 'holiday' && (
              <Typography variant="body2" color="text.secondary">
                Payroll holiday changes will be saved and used for future payroll previews.
              </Typography>
            )}
            {saveIntent === 'manual' && (
              <Typography variant="body2" color="text.secondary">
                Manual month-day values will be saved for the selected academic year.
              </Typography>
            )}
          </Stack>
        }
        action={
          <LoadingButton
            variant="contained"
            size="small"
            loading={isSaving}
            startIcon={<Iconify icon="mdi:check" />}
            onClick={handleSave}
          >
            Apply changes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default PayrollConfiguration;
