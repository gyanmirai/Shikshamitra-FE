'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Tab,
  Card,
  Chip,
  Grid,
  Tabs,
  Alert,
  Paper,
  Stack,
  Table,
  Button,
  Switch,
  Divider,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  InputAdornment,
  TablePagination,
  FormControlLabel,
} from '@mui/material';
import {
  useGetAttendanceConfigurationQuery,
  useGetAttendancePolicyEvaluationQuery,
  useGetAttendancePolicyEvaluationsQuery,
  useSaveAttendanceConfigurationMutation,
  usePreviewAttendanceConfigurationMutation,
  useCancelAttendancePolicyEvaluationMutation,
  useCreateAttendancePolicyEvaluationMutation,
  useGetAttendancePolicyEvaluationResultsQuery,
  useApproveAttendancePolicyEvaluationMutation,
  usePreviewAttendancePolicyEvaluationMutation,
  usePublishAttendancePolicyEvaluationMutation,
} from 'src/redux/hr/attendanceApi';

import { INITIAL_ATTENDANCE_CONFIG } from './types';
import {
  canCancelAttendanceEvaluation,
  shouldRenderEvaluationSummary,
  canApproveAttendanceEvaluation,
  canPublishAttendanceEvaluation,
  pickLatestAttendanceEvaluation,
  shouldRenderEvaluationEmptyState,
  buildAttendanceConfigurationRequest,
  buildAttendancePolicyEvaluationRequest,
  buildAttendanceConfigurationPreviewRequest,
} from './attendance-configuration-utils';

import type {
  AttendanceConfiguration,
  AttendancePolicyOverride,
  AttendanceOverrideTargetType,
  AttendancePolicyEvaluationRun,
  AttendancePolicyEvaluationResult,
} from './types';

const TAB_ITEMS = [
  { value: 'overview', label: 'Overview', icon: 'mdi:view-dashboard-outline' },
  { value: 'workday', label: 'Workday Rules', icon: 'mdi:calendar-week' },
  { value: 'punch', label: 'Punch Rules', icon: 'mdi:clock-check-outline' },
  { value: 'late', label: 'Late/Early', icon: 'mdi:timer-alert-outline' },
  { value: 'overtime', label: 'Overtime/Holidays', icon: 'mdi:calendar-star' },
  { value: 'overrides', label: 'Overrides', icon: 'mdi:account-switch-outline' },
  { value: 'preview', label: 'Preview', icon: 'mdi:chart-box-outline' },
  { value: 'evaluation', label: 'Evaluation & Publish', icon: 'mdi:publish' },
];

const WEEKDAY_OPTIONS = [
  { id: 0, name: 'Sunday' },
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
];

const validationSchema = Yup.object({
  policyName: Yup.string().trim().required('Policy name is required'),
  status: Yup.string().oneOf(['draft', 'active']).required('Required'),
  effectiveFrom: Yup.string()
    .nullable()
    .when('status', {
      is: 'active',
      then: (schema) => schema.required('Effective from is required for active policies'),
    }),
  effectiveTo: Yup.string().nullable(),
  punchRules: Yup.object({
    fullDayThresholdPercentage: Yup.number().min(0).max(100).required('Required'),
    halfDayThresholdPercentage: Yup.number()
      .min(0)
      .max(100)
      .required('Required')
      .test(
        'below-full-day',
        'Must be less than full-day threshold',
        function isBelowFullDay(value) {
          return Number(value) < Number(this.parent.fullDayThresholdPercentage);
        }
      ),
    absentThresholdPercentage: Yup.number()
      .min(0)
      .max(100)
      .required('Required')
      .test(
        'below-half-day',
        'Must be less than or equal to half-day threshold',
        function isBelowHalfDay(value) {
          return Number(value) <= Number(this.parent.halfDayThresholdPercentage);
        }
      ),
    missingPunchBehavior: Yup.string().required('Required'),
  }),
  dailyRules: Yup.object({
    hoursBasedPayPercentage: Yup.number().min(0).max(100).required('Required'),
  }),
  lateEarlyRules: Yup.object({
    graceTime: Yup.number().min(0).required('Required'),
    maxLateAllowedPerMonth: Yup.number().min(0).required('Required'),
    penaltyType: Yup.string().oneOf(['none', 'deduct_half_day', 'deduct_full_day']).required(),
    penaltyCountThreshold: Yup.number().min(0).required('Required'),
    earlyExitGraceTime: Yup.number().min(0).required('Required'),
  }),
  overtime: Yup.object({
    enabled: Yup.boolean().required(),
    rate: Yup.string().when('enabled', {
      is: true,
      then: (schema) => schema.oneOf(['1.5x', '2.0x', 'flat']).required('Required'),
    }),
    minOvertimeMinutes: Yup.number().when('enabled', {
      is: true,
      then: (schema) => schema.min(0).required('Required'),
    }),
  }),
  overrides: Yup.array().test(
    'unique-active-targets',
    'Duplicate active override target',
    (rows) => {
      const keys = new Set<string>();
      return (rows ?? []).every((row) => {
        if (!row?.isActive) return true;
        const key = `${row.targetType}:${row.targetId}`.toLowerCase();
        if (keys.has(key)) return false;
        keys.add(key);
        return true;
      });
    }
  ),
});

const toNumberOrEmpty = (value: string) => (value === '' ? '' : Number(value));

const mergeConfiguration = (source: Partial<AttendanceConfiguration> | undefined) => ({
  ...INITIAL_ATTENDANCE_CONFIG,
  ...source,
  effectiveFrom: source?.effectiveFrom ? dayjs(source.effectiveFrom).format('YYYY-MM-DD') : null,
  effectiveTo: source?.effectiveTo ? dayjs(source.effectiveTo).format('YYYY-MM-DD') : null,
  workdayRules: {
    ...INITIAL_ATTENDANCE_CONFIG.workdayRules,
    ...source?.workdayRules,
  },
  punchRules: {
    ...INITIAL_ATTENDANCE_CONFIG.punchRules,
    fullDayThresholdPercentage:
      source?.punchRules?.fullDayThresholdPercentage ??
      source?.dailyRules?.hoursBasedPayPercentage ??
      INITIAL_ATTENDANCE_CONFIG.punchRules.fullDayThresholdPercentage,
    ...source?.punchRules,
  },
  dailyRules: {
    ...INITIAL_ATTENDANCE_CONFIG.dailyRules,
    ...source?.dailyRules,
    hoursBasedPayPercentage:
      source?.punchRules?.fullDayThresholdPercentage ??
      source?.dailyRules?.hoursBasedPayPercentage ??
      INITIAL_ATTENDANCE_CONFIG.dailyRules.hoursBasedPayPercentage,
  },
  lateEarlyRules: {
    ...INITIAL_ATTENDANCE_CONFIG.lateEarlyRules,
    ...source?.lateEarlyRules,
  },
  overtime: {
    ...INITIAL_ATTENDANCE_CONFIG.overtime,
    ...source?.overtime,
    rate: source?.overtime?.rate ?? INITIAL_ATTENDANCE_CONFIG.overtime.rate,
    minOvertimeMinutes:
      source?.overtime?.minOvertimeMinutes ?? INITIAL_ATTENDANCE_CONFIG.overtime.minOvertimeMinutes,
  },
  holidayRules: {
    ...INITIAL_ATTENDANCE_CONFIG.holidayRules,
    ...source?.holidayRules,
  },
  manualCorrectionRules: {
    ...INITIAL_ATTENDANCE_CONFIG.manualCorrectionRules,
    ...source?.manualCorrectionRules,
  },
  payrollIntegrationMode:
    source?.payrollIntegrationMode ?? INITIAL_ATTENDANCE_CONFIG.payrollIntegrationMode,
  requirePublishedAttendanceForPayrollLock:
    source?.requirePublishedAttendanceForPayrollLock ??
    INITIAL_ATTENDANCE_CONFIG.requirePublishedAttendanceForPayrollLock,
  overrides: source?.overrides ?? [],
});

const AttendanceConfigurationScreen = () => {
  const { currentYear: academicYearId } = useSelector((state: RootState) => state.globalState);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [previewFilters, setPreviewFilters] = React.useState({
    fromDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    toDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    departmentId: '',
    roleId: '',
    employeeType: '',
    shiftId: '',
  });
  const [evaluationMonth, setEvaluationMonth] = React.useState(dayjs().format('YYYY-MM'));
  const [selectedEvaluationRunId, setSelectedEvaluationRunId] = React.useState<
    string | undefined
  >();
  const [evaluationViewMode, setEvaluationViewMode] = React.useState<'saved' | 'preview'>('saved');
  const [activePreviewEvaluation, setActivePreviewEvaluation] = React.useState<
    AttendancePolicyEvaluationRun | undefined
  >();
  const [evaluationResultsPage, setEvaluationResultsPage] = React.useState(0);
  const [evaluationResultsPageSize, setEvaluationResultsPageSize] = React.useState(25);
  const [evaluationResultFilters, setEvaluationResultFilters] = React.useState({
    search: '',
    fromDate: '',
    toDate: '',
    evaluatedStatus: '',
    hasWarnings: false,
    isLate: false,
    hasOvertime: false,
  });
  const [overrideDraft, setOverrideDraft] = React.useState<AttendancePolicyOverride>({
    targetType: 'department',
    targetId: '',
    targetName: '',
    isActive: true,
    hoursBasedPayPercentage: '',
    graceTime: '',
    maxLateAllowedPerMonth: '',
    penaltyType: '',
    overtimeEnabled: false,
    overtimeRate: '',
    minOvertimeMinutes: '',
  });

  const [saveAttendanceConfiguration, { isLoading: isSaveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveAttendanceConfigurationMutation,
    options: { skip: !academicYearId?.id },
    popupConfig: { error: false },
  });

  const {
    data: attendanceConfiguration,
    isLoading: isConfigLoading,
    isError: isConfigError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAttendanceConfigurationQuery,
    params: { academicYearId: academicYearId?.id },
    options: { skip: !academicYearId?.id },
    popupConfig: { error: false },
  });

  const [previewAttendanceConfiguration, previewState] =
    usePreviewAttendanceConfigurationMutation();
  const [previewAttendancePolicyEvaluation, evaluationPreviewState] =
    usePreviewAttendancePolicyEvaluationMutation();
  const [createAttendancePolicyEvaluation, createEvaluationState] =
    useCreateAttendancePolicyEvaluationMutation();
  const [approveAttendancePolicyEvaluation, approveEvaluationState] =
    useApproveAttendancePolicyEvaluationMutation();
  const [publishAttendancePolicyEvaluation, publishEvaluationState] =
    usePublishAttendancePolicyEvaluationMutation();
  const [cancelAttendancePolicyEvaluation, cancelEvaluationState] =
    useCancelAttendancePolicyEvaluationMutation();
  const selectedEvaluationMonth = React.useMemo(
    () => dayjs(`${evaluationMonth}-01`),
    [evaluationMonth]
  );
  const evaluationQueryParams = React.useMemo(
    () => ({
      academicYearId: academicYearId?.id ?? '',
      month: selectedEvaluationMonth.month() + 1,
      year: selectedEvaluationMonth.year(),
    }),
    [academicYearId?.id, selectedEvaluationMonth]
  );
  const { data: monthlyEvaluations = [] } = useGetAttendancePolicyEvaluationsQuery(
    evaluationQueryParams,
    {
      skip: !academicYearId?.id,
    }
  );
  const { data: selectedEvaluationDetail, isFetching: isEvaluationDetailLoading } =
    useGetAttendancePolicyEvaluationQuery(
      { runId: selectedEvaluationRunId ?? '' },
      { skip: !selectedEvaluationRunId }
    );
  const persistedEvaluationResultsQuery = {
    runId: selectedEvaluationRunId ?? '',
    skipCount: evaluationResultsPage * evaluationResultsPageSize,
    maxResultCount: evaluationResultsPageSize,
    search: evaluationResultFilters.search.trim() || undefined,
    fromDate: evaluationResultFilters.fromDate || undefined,
    toDate: evaluationResultFilters.toDate || undefined,
    evaluatedStatus: evaluationResultFilters.evaluatedStatus || undefined,
    hasWarnings: evaluationResultFilters.hasWarnings || undefined,
    isLate: evaluationResultFilters.isLate || undefined,
    hasOvertime: evaluationResultFilters.hasOvertime || undefined,
  };
  const { data: persistedEvaluationResults, isFetching: isEvaluationResultsLoading } =
    useGetAttendancePolicyEvaluationResultsQuery(persistedEvaluationResultsQuery, {
      skip: !selectedEvaluationRunId || evaluationViewMode === 'preview',
    });

  const formik = useFormik<AttendanceConfiguration>({
    initialValues: INITIAL_ATTENDANCE_CONFIG,
    validationSchema,
    onSubmit: async (values) => {
      await saveConfiguration('active');
    },
  });

  const { values, touched, errors, handleChange, setFieldValue, resetForm, validateForm } = formik;

  React.useEffect(() => {
    if (!attendanceConfiguration?.success || !attendanceConfiguration?.dailyRules) {
      return;
    }

    resetForm({ values: mergeConfiguration(attendanceConfiguration) });
  }, [attendanceConfiguration, resetForm]);

  const getFieldStatus = (field: string) => {
    const parts = field.split('.');
    const touchedVal = parts.reduce((obj: any, key) => obj?.[key], touched);
    const errorVal = parts.reduce((obj: any, key) => obj?.[key], errors);
    return {
      error: Boolean(touchedVal && errorVal),
      helperText: touchedVal && errorVal ? String(errorVal) : '',
    };
  };

  const saveConfiguration = async (status: 'draft' | 'active') => {
    if (!academicYearId?.id) {
      shikshaMitraToast.error({ message: 'Please select an academic year before saving' });
      return;
    }

    const nextValues = { ...values, status };
    if (status === 'active' && !nextValues.effectiveFrom) {
      nextValues.effectiveFrom = dayjs().format('YYYY-MM-DD');
    }

    setFieldValue('status', status);
    const validationErrors = await validateForm(nextValues);
    if (Object.keys(validationErrors).length > 0) {
      shikshaMitraToast.error({ message: 'Please fix validation errors before saving' });
      return;
    }

    try {
      await saveAttendanceConfiguration({
        academicYearId: academicYearId.id,
        body: buildAttendanceConfigurationRequest(nextValues),
      }).unwrap();
      shikshaMitraToast.success({
        message: status === 'active' ? 'Attendance policy activated' : 'Attendance draft saved',
      });
    } catch (error) {
      console.error('Failed to save attendance configuration:', error);
      shikshaMitraToast.error({ message: 'Failed to save attendance configuration' });
    }
  };

  const runPreview = async () => {
    if (!academicYearId?.id) {
      shikshaMitraToast.error({ message: 'Please select an academic year before previewing' });
      return;
    }

    try {
      await previewAttendanceConfiguration({
        academicYearId: academicYearId.id,
        body: buildAttendanceConfigurationPreviewRequest(previewFilters, values),
      }).unwrap();
    } catch (error) {
      console.error('Failed to preview attendance configuration:', error);
      shikshaMitraToast.error({ message: 'Failed to preview attendance configuration' });
    }
  };

  const buildEvaluationRequest = (includeFilters: boolean) =>
    buildAttendancePolicyEvaluationRequest(
      academicYearId.id,
      evaluationMonth,
      includeFilters
        ? {
            departmentId: previewFilters.departmentId,
            roleId: previewFilters.roleId,
            employeeType: previewFilters.employeeType,
            shiftId: previewFilters.shiftId,
          }
        : undefined
    );

  const runEvaluationPreview = async () => {
    if (!academicYearId?.id) {
      shikshaMitraToast.error({ message: 'Please select an academic year before evaluating' });
      return;
    }

    try {
      const previewEvaluation = await previewAttendancePolicyEvaluation({
        body: buildEvaluationRequest(true),
      }).unwrap();
      setActivePreviewEvaluation(previewEvaluation);
      setEvaluationViewMode('preview');
    } catch (error) {
      console.error('Failed to preview attendance evaluation:', error);
      shikshaMitraToast.error({ message: 'Failed to preview attendance evaluation' });
    }
  };

  const createEvaluation = async () => {
    if (!academicYearId?.id) {
      shikshaMitraToast.error({ message: 'Please select an academic year before evaluating' });
      return;
    }

    try {
      const created = await createAttendancePolicyEvaluation({
        body: buildEvaluationRequest(false),
      }).unwrap();
      setSelectedEvaluationRunId(created.id);
      setEvaluationViewMode('saved');
      shikshaMitraToast.success({ message: 'Attendance evaluation created' });
    } catch (error) {
      console.error('Failed to create attendance evaluation:', error);
      shikshaMitraToast.error({ message: 'Failed to create attendance evaluation' });
    }
  };

  const approveEvaluation = async () => {
    const runId = activePersistedEvaluation?.id;
    if (!runId) return;
    try {
      const approved = await approveAttendancePolicyEvaluation({ runId }).unwrap();
      setSelectedEvaluationRunId(approved.id);
      setEvaluationViewMode('saved');
      shikshaMitraToast.success({ message: 'Attendance evaluation approved' });
    } catch (error) {
      shikshaMitraToast.error({ message: 'Failed to approve attendance evaluation' });
    }
  };

  const publishEvaluation = async () => {
    const runId = activePersistedEvaluation?.id;
    if (!runId) return;
    try {
      const published = await publishAttendancePolicyEvaluation({ runId }).unwrap();
      setSelectedEvaluationRunId(published.id);
      setEvaluationViewMode('saved');
      shikshaMitraToast.success({ message: 'Attendance evaluation published to payroll inputs' });
    } catch (error) {
      shikshaMitraToast.error({ message: 'Failed to publish attendance evaluation' });
    }
  };

  const cancelEvaluation = async () => {
    const runId = activePersistedEvaluation?.id;
    if (!runId) return;
    try {
      const cancelled = await cancelAttendancePolicyEvaluation({ runId }).unwrap();
      setSelectedEvaluationRunId(cancelled.id);
      setEvaluationViewMode('saved');
      shikshaMitraToast.success({ message: 'Attendance evaluation cancelled' });
    } catch (error) {
      shikshaMitraToast.error({ message: 'Failed to cancel attendance evaluation' });
    }
  };

  const addOverride = () => {
    if (!overrideDraft.targetId.trim() || !overrideDraft.targetName.trim()) {
      shikshaMitraToast.error({ message: 'Override target id and name are required' });
      return;
    }

    const duplicate = values.overrides.some(
      (row) =>
        row.isActive &&
        row.targetType === overrideDraft.targetType &&
        row.targetId.toLowerCase() === overrideDraft.targetId.toLowerCase()
    );

    if (duplicate) {
      shikshaMitraToast.error({ message: 'An active override already exists for this target' });
      return;
    }

    setFieldValue('overrides', [
      ...values.overrides,
      {
        ...overrideDraft,
        id: crypto.randomUUID?.() ?? `${Date.now()}`,
        targetId: overrideDraft.targetId.trim(),
        targetName: overrideDraft.targetName.trim(),
      },
    ]);
    setOverrideDraft({
      targetType: 'department',
      targetId: '',
      targetName: '',
      isActive: true,
      hoursBasedPayPercentage: '',
      graceTime: '',
      maxLateAllowedPerMonth: '',
      penaltyType: '',
      overtimeEnabled: false,
      overtimeRate: '',
      minOvertimeMinutes: '',
    });
  };

  const removeOverride = (id?: string) => {
    setFieldValue(
      'overrides',
      values.overrides.filter((row) => row.id !== id)
    );
  };

  const toggleOverrideStatus = (id: string | undefined, isActive: boolean) => {
    setFieldValue(
      'overrides',
      values.overrides.map((row) => (row.id === id ? { ...row, isActive } : row))
    );
  };

  const statusColor = values.status === 'active' ? 'success' : 'warning';
  const preview = previewState.data;
  const evaluation = activePreviewEvaluation;
  const savedEvaluationOptions = React.useMemo(() => {
    const byId = new Map<string, AttendancePolicyEvaluationRun>();
    [
      createEvaluationState.data,
      approveEvaluationState.data,
      publishEvaluationState.data,
      cancelEvaluationState.data,
      ...monthlyEvaluations,
    ]
      .filter(Boolean)
      .forEach((run) =>
        byId.set((run as AttendancePolicyEvaluationRun).id, run as AttendancePolicyEvaluationRun)
      );
    return Array.from(byId.values()).sort(
      (a, b) =>
        new Date(
          b.lastUpdatedAt || b.publishedAt || b.approvedAt || b.createdAt || b.toDate
        ).getTime() -
        new Date(
          a.lastUpdatedAt || a.publishedAt || a.approvedAt || a.createdAt || a.toDate
        ).getTime()
    );
  }, [
    monthlyEvaluations,
    createEvaluationState.data,
    approveEvaluationState.data,
    publishEvaluationState.data,
    cancelEvaluationState.data,
  ]);
  const latestMonthlyEvaluation = pickLatestAttendanceEvaluation(savedEvaluationOptions);
  const selectedEvaluationSummary = savedEvaluationOptions.find(
    (run) => run.id === selectedEvaluationRunId
  );
  const persistedEvaluation: AttendancePolicyEvaluationRun | undefined =
    selectedEvaluationDetail || selectedEvaluationSummary || latestMonthlyEvaluation;
  const showPreviewEvaluation = evaluationViewMode === 'preview' && !!evaluation;
  const activePersistedEvaluation = showPreviewEvaluation ? undefined : persistedEvaluation;
  const activeEvaluation = showPreviewEvaluation ? evaluation : persistedEvaluation;
  const resultRows = showPreviewEvaluation
    ? (evaluation?.results ?? [])
    : (persistedEvaluationResults?.items ?? []);
  const resultTotalCount = !showPreviewEvaluation
    ? (persistedEvaluationResults?.totalCount ?? activeEvaluation?.totalResultCount ?? 0)
    : (activeEvaluation?.results?.length ?? 0);
  const hasPreviewFilters = Boolean(
    previewFilters.departmentId.trim() ||
    previewFilters.roleId.trim() ||
    previewFilters.employeeType.trim() ||
    previewFilters.shiftId.trim()
  );

  React.useEffect(() => {
    const selectedExists = savedEvaluationOptions.some((run) => run.id === selectedEvaluationRunId);
    if (!selectedExists) {
      setSelectedEvaluationRunId(latestMonthlyEvaluation?.id);
    }
  }, [latestMonthlyEvaluation?.id, savedEvaluationOptions, selectedEvaluationRunId]);

  React.useEffect(() => {
    setActivePreviewEvaluation(undefined);
    setEvaluationViewMode('saved');
  }, [academicYearId?.id, evaluationMonth]);

  React.useEffect(() => {
    setEvaluationResultsPage(0);
  }, [
    selectedEvaluationRunId,
    evaluationResultFilters.search,
    evaluationResultFilters.fromDate,
    evaluationResultFilters.toDate,
    evaluationResultFilters.evaluatedStatus,
    evaluationResultFilters.hasWarnings,
    evaluationResultFilters.isLate,
    evaluationResultFilters.hasOvertime,
  ]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Attendance Configuration"
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Attendance Management', href: hrPaths.attendance.biometricAttendance },
          { name: 'Settings', href: hrPaths.attendance.setting.root },
          { name: 'Attendance Configuration' },
        ]}
        description="Configure staff attendance policy, late rules, overtime, overrides, and preview payroll impact before activation."
        action={
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:clock-outline" />}
            href={hrPaths.attendance.setting.shiftManagement}
          >
            Shift Management
          </Button>
        }
      />

      {!academicYearId?.id && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Select an academic year to load and save attendance configuration.
        </Alert>
      )}

      {isConfigError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Attendance configuration could not be loaded. You can still review defaults, then retry.
        </Alert>
      )}

      <Card sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ px: 2, pt: 2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={1.5}
          >
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="h6">{values.policyName}</Typography>
                <Chip size="small" color={statusColor} label={values.status.toUpperCase()} />
                <Chip
                  size="small"
                  variant="outlined"
                  label={academicYearId?.name || 'No academic year'}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Last updated:{' '}
                {values.lastUpdatedAt
                  ? dayjs(values.lastUpdatedAt).format('DD MMM YYYY, hh:mm A')
                  : 'Not saved yet'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:chart-box-outline" />}
                onClick={() => {
                  setActiveTab('preview');
                  runPreview();
                }}
              >
                Preview impact
              </Button>
              <LoadingButton
                size="small"
                variant="contained"
                loading={isSaveLoading}
                startIcon={<Iconify icon="mdi:content-save-edit" />}
                onClick={() => saveConfiguration('draft')}
              >
                Save draft
              </LoadingButton>
            </Stack>
          </Stack>

          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ mt: 2, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            {TAB_ITEMS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={<Iconify icon={tab.icon} width={18} />}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        <form
          onSubmit={formik.handleSubmit}
          style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <Scrollbar sx={{ flex: 1, p: 2 }}>
            {isConfigLoading ? (
              <Alert severity="info">Loading attendance configuration...</Alert>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <Section
                    title="Policy Overview"
                    subtitle="Control policy lifecycle and academic-year scope."
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <ShakingTextField error={getFieldStatus('policyName').error}>
                          <TextField
                            fullWidth
                            size="small"
                            name="policyName"
                            label="Policy name"
                            value={values.policyName}
                            onChange={handleChange}
                            error={getFieldStatus('policyName').error}
                            helperText={getFieldStatus('policyName').helperText}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <CustomSelect
                          name="status"
                          label="Status"
                          options={[
                            { id: 'draft', name: 'Draft' },
                            { id: 'active', name: 'Active' },
                          ]}
                          labelKey="name"
                          valueKey="id"
                          value={values.status}
                          onChange={(value) => setFieldValue('status', value)}
                          formControlProps={{ fullWidth: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          name="effectiveFrom"
                          label="Effective from"
                          value={values.effectiveFrom ?? ''}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          error={getFieldStatus('effectiveFrom').error}
                          helperText={getFieldStatus('effectiveFrom').helperText}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          name="effectiveTo"
                          label="Effective to"
                          value={values.effectiveTo ?? ''}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Alert severity="info" variant="outlined">
                          Raw attendance records are not changed. Published monthly evaluations can
                          feed payroll only when approved-results mode is enabled.
                        </Alert>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <CustomSelect
                          name="payrollIntegrationMode"
                          label="Payroll integration"
                          options={[
                            { id: 'advisory', name: 'Advisory only' },
                            { id: 'approved_results', name: 'Use approved results' },
                          ]}
                          labelKey="name"
                          valueKey="id"
                          value={values.payrollIntegrationMode}
                          onChange={(value) => setFieldValue('payrollIntegrationMode', value)}
                          formControlProps={{ fullWidth: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.requirePublishedAttendanceForPayrollLock}
                              onChange={(event) =>
                                setFieldValue(
                                  'requirePublishedAttendanceForPayrollLock',
                                  event.target.checked
                                )
                              }
                              disabled={values.payrollIntegrationMode !== 'approved_results'}
                            />
                          }
                          label="Require published evaluation before payroll lock"
                        />
                      </Grid>
                    </Grid>
                  </Section>
                )}

                {activeTab === 'workday' && (
                  <Section
                    title="Workday & Shift Rules"
                    subtitle="Keep shift creation in Shift Management and use this page for policy-level defaults."
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <CustomSelect
                          name="workdayRules.weeklyOffPattern"
                          label="Weekly off pattern"
                          options={[
                            { id: 'sunday', name: 'Sunday' },
                            { id: 'saturday_sunday', name: 'Saturday + Sunday' },
                            { id: 'custom', name: 'Custom' },
                          ]}
                          labelKey="name"
                          valueKey="id"
                          value={values.workdayRules.weeklyOffPattern}
                          onChange={(value) =>
                            setFieldValue('workdayRules.weeklyOffPattern', value)
                          }
                          formControlProps={{ fullWidth: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {WEEKDAY_OPTIONS.map((day) => (
                            <Chip
                              key={day.id}
                              label={day.name}
                              clickable={values.workdayRules.weeklyOffPattern === 'custom'}
                              color={
                                values.workdayRules.customWeeklyOffs.includes(day.id)
                                  ? 'primary'
                                  : 'default'
                              }
                              variant={
                                values.workdayRules.customWeeklyOffs.includes(day.id)
                                  ? 'filled'
                                  : 'outlined'
                              }
                              onClick={() => {
                                if (values.workdayRules.weeklyOffPattern !== 'custom') return;
                                const next = values.workdayRules.customWeeklyOffs.includes(day.id)
                                  ? values.workdayRules.customWeeklyOffs.filter(
                                      (item) => item !== day.id
                                    )
                                  : [...values.workdayRules.customWeeklyOffs, day.id];
                                setFieldValue('workdayRules.customWeeklyOffs', next);
                              }}
                            />
                          ))}
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Box>
                              <Typography variant="subtitle2">Assigned shifts</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Shift definitions are managed separately. This policy consumes those
                                assignments during attendance evaluation.
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              href={hrPaths.attendance.setting.shiftManagement}
                              startIcon={<Iconify icon="mdi:open-in-new" />}
                            >
                              Open shifts
                            </Button>
                          </Stack>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Section>
                )}

                {activeTab === 'punch' && (
                  <Section
                    title="Punch & Attendance Rules"
                    subtitle="Define how raw punches become payable attendance."
                  >
                    <Grid container spacing={2}>
                      {[
                        ['punchRules.fullDayThresholdPercentage', 'Required hours for full day'],
                        ['punchRules.halfDayThresholdPercentage', 'Half-day threshold'],
                        ['punchRules.absentThresholdPercentage', 'Absent threshold'],
                      ].map(([name, label]) => (
                        <Grid key={name} size={{ xs: 12, md: 4 }}>
                          <PercentField
                            name={name}
                            label={label}
                            value={Number(
                              name.split('.').reduce((obj: any, key) => obj?.[key], values)
                            )}
                            onChange={(next) => {
                              setFieldValue(name, next);
                              if (name === 'punchRules.fullDayThresholdPercentage') {
                                setFieldValue('dailyRules.hoursBasedPayPercentage', next);
                              }
                            }}
                            error={getFieldStatus(name).error}
                            helperText={getFieldStatus(name).helperText}
                          />
                        </Grid>
                      ))}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <CustomSelect
                          name="punchRules.missingPunchBehavior"
                          label="Missing punch behavior"
                          options={[
                            { id: 'requires_review', name: 'Requires Review' },
                            { id: 'mark_half_day', name: 'Mark Half Day' },
                            { id: 'mark_absent', name: 'Mark Absent' },
                          ]}
                          labelKey="name"
                          valueKey="id"
                          value={values.punchRules.missingPunchBehavior}
                          onChange={(value) =>
                            setFieldValue('punchRules.missingPunchBehavior', value)
                          }
                          formControlProps={{ fullWidth: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.manualCorrectionRules.allowed}
                              onChange={(event) =>
                                setFieldValue('manualCorrectionRules.allowed', event.target.checked)
                              }
                            />
                          }
                          label="Allow manual attendance corrections"
                        />
                      </Grid>
                    </Grid>
                  </Section>
                )}

                {activeTab === 'late' && (
                  <Section
                    title="Late Entry & Early Exit"
                    subtitle="Control grace limits and penalties before they affect payable days."
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <NumberField
                          name="lateEarlyRules.graceTime"
                          label="Grace minutes"
                          values={values}
                          handleChange={handleChange}
                          status={getFieldStatus('lateEarlyRules.graceTime')}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <NumberField
                          name="lateEarlyRules.maxLateAllowedPerMonth"
                          label="Max late / month"
                          values={values}
                          handleChange={handleChange}
                          status={getFieldStatus('lateEarlyRules.maxLateAllowedPerMonth')}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <NumberField
                          name="lateEarlyRules.penaltyCountThreshold"
                          label="Apply after N lates"
                          values={values}
                          handleChange={handleChange}
                          status={getFieldStatus('lateEarlyRules.penaltyCountThreshold')}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <CustomSelect
                          name="lateEarlyRules.penaltyType"
                          label="Penalty action"
                          options={[
                            { id: 'none', name: 'No Penalty' },
                            { id: 'deduct_half_day', name: 'Deduct Half Day' },
                            { id: 'deduct_full_day', name: 'Deduct Full Day' },
                          ]}
                          labelKey="name"
                          valueKey="id"
                          value={values.lateEarlyRules.penaltyType}
                          onChange={(value) => setFieldValue('lateEarlyRules.penaltyType', value)}
                          formControlProps={{ fullWidth: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.lateEarlyRules.earlyExitEnabled}
                              onChange={(event) =>
                                setFieldValue(
                                  'lateEarlyRules.earlyExitEnabled',
                                  event.target.checked
                                )
                              }
                            />
                          }
                          label="Enable early-exit rule"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <NumberField
                          name="lateEarlyRules.earlyExitGraceTime"
                          label="Early-exit grace minutes"
                          values={values}
                          handleChange={handleChange}
                          status={getFieldStatus('lateEarlyRules.earlyExitGraceTime')}
                        />
                      </Grid>
                    </Grid>
                  </Section>
                )}

                {activeTab === 'overtime' && (
                  <Section
                    title="Overtime & Holiday Work"
                    subtitle="Keep payroll changes in preview mode until the policy is validated."
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Alert severity="warning" variant="outlined">
                          Overtime and holiday choices can change payroll outputs. V1 only previews
                          impact.
                        </Alert>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.overtime.enabled}
                              onChange={(event) => {
                                const enabled = event.target.checked;
                                setFieldValue('overtime.enabled', enabled);
                                if (!enabled) {
                                  setFieldValue('overtime.rate', '');
                                  setFieldValue('overtime.minOvertimeMinutes', '');
                                }
                              }}
                            />
                          }
                          label="Enable overtime calculation"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <CustomSelect
                          name="overtime.rate"
                          label="Overtime rate"
                          options={[
                            { id: '1.5x', name: '1.5x Standard' },
                            { id: '2.0x', name: '2.0x Double' },
                            { id: 'flat', name: 'Flat Rate' },
                          ]}
                          labelKey="name"
                          valueKey="id"
                          value={values.overtime.rate ?? ''}
                          onChange={(value) => setFieldValue('overtime.rate', value)}
                          disabled={!values.overtime.enabled}
                          formControlProps={{ fullWidth: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <NumberField
                          name="overtime.minOvertimeMinutes"
                          label="Minimum OT minutes"
                          values={values}
                          handleChange={handleChange}
                          status={getFieldStatus('overtime.minOvertimeMinutes')}
                          disabled={!values.overtime.enabled}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <CustomSelect
                          name="holidayRules.workOnHolidayBehavior"
                          label="Holiday work behavior"
                          options={[
                            { id: 'paid', name: 'Paid' },
                            { id: 'comp_off', name: 'Comp-off' },
                            { id: 'ot_payout', name: 'Overtime Payout' },
                          ]}
                          labelKey="name"
                          valueKey="id"
                          value={values.holidayRules.workOnHolidayBehavior}
                          onChange={(value) =>
                            setFieldValue('holidayRules.workOnHolidayBehavior', value)
                          }
                          formControlProps={{ fullWidth: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.holidayRules.sandwichRule}
                              onChange={(event) =>
                                setFieldValue('holidayRules.sandwichRule', event.target.checked)
                              }
                            />
                          }
                          label="Enable sandwich rule"
                        />
                      </Grid>
                    </Grid>
                  </Section>
                )}

                {activeTab === 'overrides' && (
                  <Section
                    title="Policy Overrides"
                    subtitle="Global policy applies first; overrides refine rules for specific groups."
                  >
                    <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
                      Priority: shift, role, department, then global policy. Employee-specific
                      overrides are reserved for a later phase.
                    </Alert>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, md: 2 }}>
                        <CustomSelect
                          name="overrideTargetType"
                          label="Target type"
                          options={[
                            { id: 'department', name: 'Department' },
                            { id: 'role', name: 'Role' },
                            { id: 'employee_type', name: 'Employee Type' },
                            { id: 'shift', name: 'Shift' },
                          ]}
                          labelKey="name"
                          valueKey="id"
                          value={overrideDraft.targetType}
                          onChange={(value) =>
                            setOverrideDraft((draft) => ({
                              ...draft,
                              targetType: value as AttendanceOverrideTargetType,
                            }))
                          }
                          formControlProps={{ fullWidth: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Target id"
                          value={overrideDraft.targetId}
                          onChange={(event) =>
                            setOverrideDraft((draft) => ({
                              ...draft,
                              targetId: event.target.value,
                            }))
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Target name"
                          value={overrideDraft.targetName}
                          onChange={(event) =>
                            setOverrideDraft((draft) => ({
                              ...draft,
                              targetName: event.target.value,
                            }))
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Full day %"
                          value={overrideDraft.hoursBasedPayPercentage}
                          onChange={(event) =>
                            setOverrideDraft((draft) => ({
                              ...draft,
                              hoursBasedPayPercentage: toNumberOrEmpty(event.target.value),
                            }))
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Grace min"
                          value={overrideDraft.graceTime}
                          onChange={(event) =>
                            setOverrideDraft((draft) => ({
                              ...draft,
                              graceTime: toNumberOrEmpty(event.target.value),
                            }))
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={addOverride}
                          startIcon={<Iconify icon="mdi:plus" />}
                        >
                          Add override
                        </Button>
                      </Grid>
                    </Grid>
                    <OverrideTable
                      rows={values.overrides}
                      onRemove={removeOverride}
                      onToggleStatus={toggleOverrideStatus}
                    />
                  </Section>
                )}

                {activeTab === 'preview' && (
                  <Section
                    title="Preview & Validation"
                    subtitle="Estimate impact without changing attendance or payroll records."
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          label="From date"
                          value={previewFilters.fromDate}
                          onChange={(event) =>
                            setPreviewFilters((prev) => ({ ...prev, fromDate: event.target.value }))
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          label="To date"
                          value={previewFilters.toDate}
                          onChange={(event) =>
                            setPreviewFilters((prev) => ({ ...prev, toDate: event.target.value }))
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Alert severity="info" variant="outlined">
                          Preview only. Payroll uses persisted attendance statuses until attendance
                          is reprocessed.
                        </Alert>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Department"
                          value={previewFilters.departmentId}
                          onChange={(event) =>
                            setPreviewFilters((prev) => ({
                              ...prev,
                              departmentId: event.target.value,
                            }))
                          }
                          helperText="Matches employee department"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Role id"
                          value={previewFilters.roleId}
                          onChange={(event) =>
                            setPreviewFilters((prev) => ({ ...prev, roleId: event.target.value }))
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <CustomSelect
                          name="previewEmployeeType"
                          label="Employee type"
                          options={[
                            { id: '', name: 'All employee types' },
                            { id: 'teaching', name: 'Teaching' },
                            { id: 'non_teaching', name: 'Non-teaching' },
                          ]}
                          labelKey="name"
                          valueKey="id"
                          value={previewFilters.employeeType}
                          onChange={(value) =>
                            setPreviewFilters((prev) => ({ ...prev, employeeType: String(value) }))
                          }
                          formControlProps={{ fullWidth: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Shift id"
                          value={previewFilters.shiftId}
                          onChange={(event) =>
                            setPreviewFilters((prev) => ({ ...prev, shiftId: event.target.value }))
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <LoadingButton
                          fullWidth
                          variant="contained"
                          loading={previewState.isLoading}
                          startIcon={<Iconify icon="mdi:play-circle-outline" />}
                          onClick={runPreview}
                        >
                          Test policy
                        </LoadingButton>
                      </Grid>
                      {preview && (
                        <Grid size={{ xs: 12 }}>
                          <Grid container spacing={2}>
                            <Metric
                              label="Affected employees"
                              value={preview.affectedEmployeeCount}
                            />
                            <Metric
                              label="Estimated late count"
                              value={preview.estimatedLateCount}
                            />
                            <Metric
                              label="Estimated absences"
                              value={preview.estimatedAbsenceCount}
                            />
                            <Metric label="OT minutes" value={preview.estimatedOvertimeMinutes} />
                            <Metric
                              label="Payable day delta"
                              value={preview.estimatedPayableDayDelta}
                            />
                          </Grid>
                          <Stack spacing={1} sx={{ mt: 2 }}>
                            {preview.warnings.map((warning) => (
                              <Alert key={warning} severity="warning" variant="outlined">
                                {warning}
                              </Alert>
                            ))}
                          </Stack>
                        </Grid>
                      )}
                    </Grid>
                  </Section>
                )}

                {activeTab === 'evaluation' && (
                  <Section
                    title="Evaluation & Publish"
                    subtitle="Approve monthly policy results before payroll uses them."
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Alert severity="warning" variant="outlined">
                          Publishing updates payroll attendance inputs for this month only. Raw
                          attendance records and locked/finalized payroll are not modified.
                        </Alert>
                      </Grid>
                      {hasPreviewFilters && (
                        <Grid size={{ xs: 12 }}>
                          <Alert severity="info" variant="outlined">
                            Current filters apply to preview only. Create evaluation will run for
                            the full monthly employee scope so it can be safely published to
                            payroll.
                          </Alert>
                        </Grid>
                      )}
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="month"
                          label="Payroll month"
                          value={evaluationMonth}
                          onChange={(event) => setEvaluationMonth(event.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 9 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                          <LoadingButton
                            variant="outlined"
                            loading={evaluationPreviewState.isLoading}
                            startIcon={<Iconify icon="mdi:chart-box-outline" />}
                            onClick={runEvaluationPreview}
                          >
                            Preview evaluation
                          </LoadingButton>
                          <LoadingButton
                            variant="contained"
                            loading={createEvaluationState.isLoading}
                            startIcon={<Iconify icon="mdi:playlist-check" />}
                            onClick={createEvaluation}
                          >
                            Create evaluation
                          </LoadingButton>
                          <LoadingButton
                            variant="outlined"
                            loading={approveEvaluationState.isLoading}
                            disabled={!canApproveAttendanceEvaluation(activePersistedEvaluation)}
                            startIcon={<Iconify icon="mdi:check-circle-outline" />}
                            onClick={approveEvaluation}
                          >
                            Approve
                          </LoadingButton>
                          <LoadingButton
                            variant="contained"
                            color="success"
                            loading={publishEvaluationState.isLoading}
                            disabled={!canPublishAttendanceEvaluation(activePersistedEvaluation)}
                            startIcon={<Iconify icon="mdi:publish" />}
                            onClick={publishEvaluation}
                          >
                            Publish
                          </LoadingButton>
                          <LoadingButton
                            variant="outlined"
                            color="error"
                            loading={cancelEvaluationState.isLoading}
                            disabled={!canCancelAttendanceEvaluation(activePersistedEvaluation)}
                            startIcon={<Iconify icon="mdi:cancel" />}
                            onClick={cancelEvaluation}
                          >
                            Cancel
                          </LoadingButton>
                        </Stack>
                      </Grid>
                      {!!savedEvaluationOptions.length && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Saved runs"
                            value={selectedEvaluationRunId ?? ''}
                            onChange={(event) => {
                              setSelectedEvaluationRunId(event.target.value);
                              setEvaluationViewMode('saved');
                            }}
                          >
                            {savedEvaluationOptions.map((run) => (
                              <MenuItem key={run.id} value={run.id}>
                                {run.status.replace('_', ' ').toUpperCase()} ·{' '}
                                {dayjs(
                                  run.lastUpdatedAt ||
                                    run.publishedAt ||
                                    run.approvedAt ||
                                    run.createdAt
                                ).format('DD MMM YYYY, HH:mm')}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      )}
                      {shouldRenderEvaluationEmptyState(
                        savedEvaluationOptions.length > 0,
                        showPreviewEvaluation,
                        persistedEvaluation
                      ) && (
                        <Grid size={{ xs: 12 }}>
                          <Alert severity="info" variant="outlined">
                            Select a saved run to load employee/day results.
                          </Alert>
                        </Grid>
                      )}

                      {shouldRenderEvaluationSummary(
                        showPreviewEvaluation,
                        persistedEvaluation
                      ) && (
                        <Grid size={{ xs: 12 }}>
                          <Stack spacing={2}>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {activePersistedEvaluation && (
                                <Chip
                                  size="small"
                                  color={
                                    activePersistedEvaluation.status === 'published'
                                      ? 'success'
                                      : activePersistedEvaluation.status === 'needs_review'
                                        ? 'warning'
                                        : activePersistedEvaluation.status === 'cancelled'
                                          ? 'default'
                                          : 'info'
                                  }
                                  label={`Saved: ${activePersistedEvaluation.status.replace('_', ' ').toUpperCase()}`}
                                />
                              )}
                              {showPreviewEvaluation && (
                                <Chip size="small" variant="outlined" label="Preview only" />
                              )}
                            </Stack>
                            <Grid container spacing={2}>
                              <Metric
                                label="Affected employees"
                                value={activeEvaluation?.affectedEmployeeCount ?? 0}
                              />
                              <Metric
                                label="Late count"
                                value={activeEvaluation?.estimatedLateCount ?? 0}
                              />
                              <Metric
                                label="Absences"
                                value={activeEvaluation?.estimatedAbsenceCount ?? 0}
                              />
                              <Metric
                                label="OT minutes"
                                value={activeEvaluation?.estimatedOvertimeMinutes ?? 0}
                              />
                              <Metric
                                label="Payable day delta"
                                value={activeEvaluation?.estimatedPayableDayDelta ?? 0}
                              />
                            </Grid>
                            {activePersistedEvaluation?.status === 'needs_review' && (
                              <Alert severity="warning" variant="outlined">
                                This evaluation needs review and cannot be approved or published.
                                Cancel it, fix the underlying attendance data or policy, then create
                                a new full-month evaluation.
                              </Alert>
                            )}
                            {activeEvaluation?.warnings?.map((warning: string) => (
                              <Alert key={warning} severity="warning" variant="outlined">
                                {warning}
                              </Alert>
                            ))}
                            {isEvaluationDetailLoading && activePersistedEvaluation && (
                              <Alert severity="info" variant="outlined">
                                Loading selected saved run summary.
                              </Alert>
                            )}
                            {activePersistedEvaluation && (
                              <Grid container spacing={1.5}>
                                <Grid size={{ xs: 12, md: 3 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Search employee"
                                    value={evaluationResultFilters.search}
                                    onChange={(event) =>
                                      setEvaluationResultFilters((prev) => ({
                                        ...prev,
                                        search: event.target.value,
                                      }))
                                    }
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                  <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    label="Evaluated status"
                                    value={evaluationResultFilters.evaluatedStatus}
                                    onChange={(event) =>
                                      setEvaluationResultFilters((prev) => ({
                                        ...prev,
                                        evaluatedStatus: event.target.value,
                                      }))
                                    }
                                  >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="Present">Present</MenuItem>
                                    <MenuItem value="HalfDayLeave">Half day</MenuItem>
                                    <MenuItem value="FullDayLeave">Absent</MenuItem>
                                  </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label="From"
                                    value={evaluationResultFilters.fromDate}
                                    onChange={(event) =>
                                      setEvaluationResultFilters((prev) => ({
                                        ...prev,
                                        fromDate: event.target.value,
                                      }))
                                    }
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label="To"
                                    value={evaluationResultFilters.toDate}
                                    onChange={(event) =>
                                      setEvaluationResultFilters((prev) => ({
                                        ...prev,
                                        toDate: event.target.value,
                                      }))
                                    }
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                  <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          size="small"
                                          checked={evaluationResultFilters.hasWarnings}
                                          onChange={(event) =>
                                            setEvaluationResultFilters((prev) => ({
                                              ...prev,
                                              hasWarnings: event.target.checked,
                                            }))
                                          }
                                        />
                                      }
                                      label="Warnings"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          size="small"
                                          checked={evaluationResultFilters.isLate}
                                          onChange={(event) =>
                                            setEvaluationResultFilters((prev) => ({
                                              ...prev,
                                              isLate: event.target.checked,
                                            }))
                                          }
                                        />
                                      }
                                      label="Late"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          size="small"
                                          checked={evaluationResultFilters.hasOvertime}
                                          onChange={(event) =>
                                            setEvaluationResultFilters((prev) => ({
                                              ...prev,
                                              hasOvertime: event.target.checked,
                                            }))
                                          }
                                        />
                                      }
                                      label="OT"
                                    />
                                  </Stack>
                                </Grid>
                              </Grid>
                            )}
                            {isEvaluationResultsLoading && activePersistedEvaluation && (
                              <Alert severity="info" variant="outlined">
                                Loading employee/day results.
                              </Alert>
                            )}
                            {!isEvaluationResultsLoading &&
                              activePersistedEvaluation &&
                              !resultRows.length && (
                                <Alert severity="info" variant="outlined">
                                  No row results for this run.
                                </Alert>
                              )}
                            {!!resultRows.length && (
                              <Stack spacing={1}>
                                <Typography variant="subtitle2">
                                  Employee/day results{' '}
                                  {activePersistedEvaluation
                                    ? `(${resultTotalCount} rows)`
                                    : 'preview only'}
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Date</TableCell>
                                      <TableCell>Employee</TableCell>
                                      <TableCell>Baseline</TableCell>
                                      <TableCell>Evaluated</TableCell>
                                      <TableCell>Late</TableCell>
                                      <TableCell>OT</TableCell>
                                      <TableCell>Warnings</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {resultRows.map((row: AttendancePolicyEvaluationResult) => (
                                      <TableRow key={row.id}>
                                        <TableCell>
                                          {dayjs(row.attendanceDate).format('DD MMM')}
                                        </TableCell>
                                        <TableCell>
                                          <Stack spacing={0.25}>
                                            <Typography variant="body2">
                                              {row.employeeName ||
                                                row.employeeCode ||
                                                row.employeeId}
                                            </Typography>
                                            {row.employeeCode && (
                                              <Typography variant="caption" color="text.secondary">
                                                {row.employeeCode}
                                              </Typography>
                                            )}
                                          </Stack>
                                        </TableCell>
                                        <TableCell>
                                          {row.baselineStatus} ({row.baselinePayableUnits})
                                        </TableCell>
                                        <TableCell>
                                          {row.evaluatedStatus} ({row.evaluatedPayableUnits})
                                        </TableCell>
                                        <TableCell>{row.isLate ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>{row.overtimeMinutes}</TableCell>
                                        <TableCell>{row.warnings.join(', ') || '-'}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                                {activePersistedEvaluation && (
                                  <TablePagination
                                    component="div"
                                    count={resultTotalCount}
                                    page={evaluationResultsPage}
                                    rowsPerPage={evaluationResultsPageSize}
                                    rowsPerPageOptions={[10, 25, 100]}
                                    onPageChange={(_, nextPage) =>
                                      setEvaluationResultsPage(nextPage)
                                    }
                                    onRowsPerPageChange={(event) => {
                                      setEvaluationResultsPageSize(Number(event.target.value));
                                      setEvaluationResultsPage(0);
                                    }}
                                  />
                                )}
                              </Stack>
                            )}
                          </Stack>
                        </Grid>
                      )}
                    </Grid>
                  </Section>
                )}
              </>
            )}
          </Scrollbar>

          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => resetForm()}
              startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
            >
              Reset
            </Button>
            <LoadingButton
              variant="outlined"
              size="small"
              loading={isSaveLoading}
              onClick={() => saveConfiguration('draft')}
              startIcon={<Iconify icon="mdi:content-save-edit" />}
            >
              Save Draft
            </LoadingButton>
            <LoadingButton
              variant="contained"
              size="small"
              type="submit"
              loading={isSaveLoading}
              startIcon={<Iconify icon="mdi:check-decagram-outline" />}
            >
              Activate
            </LoadingButton>
          </DialogActions>
        </form>
      </Card>
    </Box>
  );
};

const Section = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
    <Divider sx={{ mb: 2 }} />
    {children}
  </Paper>
);

const PercentField = ({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
}: {
  name: string;
  label: string;
  value: number;
  onChange: (value: number | '') => void;
  error: boolean;
  helperText: string;
}) => (
  <ShakingTextField error={error}>
    <TextField
      fullWidth
      size="small"
      name={name}
      label={label}
      type="number"
      value={value}
      onChange={(event) => {
        const next = event.target.value;
        if (next === '') {
          onChange('');
          return;
        }
        const parsed = Number(next);
        if (parsed >= 0 && parsed <= 100) {
          onChange(parsed);
        }
      }}
      InputProps={{
        endAdornment: <InputAdornment position="end">%</InputAdornment>,
        inputProps: { min: 0, max: 100 },
      }}
      error={error}
      helperText={helperText}
    />
  </ShakingTextField>
);

const NumberField = ({
  name,
  label,
  values,
  handleChange,
  status,
  disabled = false,
}: {
  name: string;
  label: string;
  values: AttendanceConfiguration;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  status: { error: boolean; helperText: string };
  disabled?: boolean;
}) => (
  <ShakingTextField error={status.error}>
    <TextField
      fullWidth
      size="small"
      name={name}
      label={label}
      type="number"
      value={name.split('.').reduce((obj: any, key) => obj?.[key], values)}
      onChange={handleChange}
      disabled={disabled}
      InputProps={{ inputProps: { min: 0 } }}
      error={status.error}
      helperText={status.helperText}
    />
  </ShakingTextField>
);

const OverrideTable = ({
  rows,
  onRemove,
  onToggleStatus,
}: {
  rows: AttendancePolicyOverride[];
  onRemove: (id?: string) => void;
  onToggleStatus: (id: string | undefined, isActive: boolean) => void;
}) => (
  <Paper variant="outlined" sx={{ mt: 2, overflow: 'hidden' }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Priority</TableCell>
          <TableCell>Target</TableCell>
          <TableCell>Full day %</TableCell>
          <TableCell>Grace</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6}>
              <Typography variant="body2" color="text.secondary" align="center">
                No overrides yet. Global policy applies to all employees.
              </Typography>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.id ?? `${row.targetType}-${row.targetId}`}>
              <TableCell>{row.priority ?? priorityLabel(row.targetType)}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {row.targetName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.targetType.replace('_', ' ')} · {row.targetId}
                </Typography>
              </TableCell>
              <TableCell>{row.hoursBasedPayPercentage || 'Global'}</TableCell>
              <TableCell>{row.graceTime || 'Global'}</TableCell>
              <TableCell>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={row.isActive}
                      onChange={(event) => onToggleStatus(row.id, event.target.checked)}
                    />
                  }
                  label={row.isActive ? 'Active' : 'Inactive'}
                />
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" color="error" onClick={() => onRemove(row.id)}>
                  <Iconify icon="mdi:delete-outline" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </Paper>
);

const priorityLabel = (targetType: AttendanceOverrideTargetType) =>
  targetType === 'shift' ? 2 : targetType === 'role' ? 3 : 4;

const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6">{value}</Typography>
    </Paper>
  </Grid>
);

export default AttendanceConfigurationScreen;
