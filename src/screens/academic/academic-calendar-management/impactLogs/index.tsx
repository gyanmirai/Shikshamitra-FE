'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { alpha, useTheme } from '@mui/material/styles';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  CalendarImpactType,
  CalendarImpactStatus,
  CALENDAR_IMPACT_TYPE_LABELS,
  CALENDAR_IMPACT_STATUS_LABELS,
  CALENDAR_IMPACT_STATUS_COLORS,
} from 'src/enums/academic-calendar';
import {
  useGetImpactLogsQuery,
  useIgnoreImpactLogMutation,
  useResolveImpactLogMutation,
  useRescheduleImpactLogMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';
import {
  Box,
  Grid,
  Card,
  Paper,
  Stack,
  Select,
  Button,
  Tooltip,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  CardContent,
  DialogActions,
} from '@mui/material';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_LOGS = {
  items: [
    {
      id: 'imp-1',
      affectedDate: '2025-08-15',
      impactType: CalendarImpactType.TimetableSlot,
      affectedEntityName: 'Math — Class 10A, Period 3',
      message: 'Timetable slot blocked due to Independence Day holiday',
      suggestedNewDate: '2025-08-18',
      status: CalendarImpactStatus.Pending,
    },
    {
      id: 'imp-2',
      affectedDate: '2025-08-15',
      impactType: CalendarImpactType.HomeworkDueDate,
      affectedEntityName: 'Science Chapter 5 Assignment',
      message: 'Homework due date falls on declared holiday',
      suggestedNewDate: '2025-08-16',
      status: CalendarImpactStatus.Suggested,
    },
    {
      id: 'imp-3',
      affectedDate: '2025-08-15',
      impactType: CalendarImpactType.OnlineClass,
      affectedEntityName: 'English Live Session — Class 9',
      message: 'Online class scheduled on school holiday',
      suggestedNewDate: null,
      status: CalendarImpactStatus.Pending,
    },
    {
      id: 'imp-4',
      affectedDate: '2025-10-02',
      impactType: CalendarImpactType.ExamSchedule,
      affectedEntityName: 'Unit Test 2 — Class 8',
      message: 'Exam scheduled on Gandhi Jayanti holiday',
      suggestedNewDate: '2025-10-03',
      status: CalendarImpactStatus.Resolved,
    },
    {
      id: 'imp-5',
      affectedDate: '2025-11-01',
      impactType: CalendarImpactType.LessonPlan,
      affectedEntityName: 'Physics Lesson Plan — Chapter 3',
      message: 'Lesson plan day affected by Diwali break',
      suggestedNewDate: '2025-11-04',
      status: CalendarImpactStatus.Rescheduled,
    },
  ],
  totalCount: 5,
};

// ─── Impact type icon/color maps ──────────────────────────────────────────────

const IMPACT_TYPE_ICON: Record<number, string> = {
  [CalendarImpactType.TimetableSlot]: 'mdi:calendar-clock-outline',
  [CalendarImpactType.HomeworkDueDate]: 'mdi:notebook-edit-outline',
  [CalendarImpactType.AssignmentDueDate]: 'mdi:clipboard-list-outline',
  [CalendarImpactType.ExamSchedule]: 'mdi:file-document-edit-outline',
  [CalendarImpactType.OnlineClass]: 'mdi:video-outline',
  [CalendarImpactType.AttendanceSession]: 'mdi:account-check-outline',
  [CalendarImpactType.LessonPlan]: 'mdi:book-open-outline',
  [CalendarImpactType.TeacherDiary]: 'mdi:book-edit-outline',
  [CalendarImpactType.PTMBooking]: 'mdi:account-group-outline',
  [CalendarImpactType.EventSchedule]: 'mdi:party-popper',
};

const IMPACT_TYPE_COLOR_KEY: Record<
  number,
  'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'default'
> = {
  [CalendarImpactType.TimetableSlot]: 'info',
  [CalendarImpactType.HomeworkDueDate]: 'secondary',
  [CalendarImpactType.AssignmentDueDate]: 'primary',
  [CalendarImpactType.ExamSchedule]: 'error',
  [CalendarImpactType.OnlineClass]: 'success',
  [CalendarImpactType.AttendanceSession]: 'secondary',
  [CalendarImpactType.LessonPlan]: 'warning',
  [CalendarImpactType.TeacherDiary]: 'default',
  [CalendarImpactType.PTMBooking]: 'primary',
  [CalendarImpactType.EventSchedule]: 'secondary',
};

const IMPACT_STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  ...Object.entries(CALENDAR_IMPACT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const IMPACT_TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  ...Object.entries(CALENDAR_IMPACT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

// ─── Validation schemas ────────────────────────────────----------------────────

const resolveSchema = Yup.object().shape({ resolutionNote: Yup.string() });
const ignoreSchema = Yup.object().shape({
  reason: Yup.string()
    .min(5, 'Reason must be at least 5 characters')
    .required('Reason is required'),
});
const rescheduleSchema = Yup.object().shape({
  newDate: Yup.mixed().required('New date is required'),
  note: Yup.string(),
});

// ─── Summary Strip ─────────────────────────────────────────────────────────────

const SummaryStrip = ({ logs }: { logs: any[] }) => {
  const theme = useTheme();
  const pending = logs.filter((l) => l.status === CalendarImpactStatus.Pending).length;
  const suggested = logs.filter((l) => l.status === CalendarImpactStatus.Suggested).length;
  const resolved = logs.filter(
    (l) =>
      l.status === CalendarImpactStatus.Resolved ||
      l.status === CalendarImpactStatus.IgnoredWithReason ||
      l.status === CalendarImpactStatus.Rescheduled
  ).length;

  const items = [
    {
      label: 'Pending Logs',
      value: pending,
      colorKey: 'error' as const,
      icon: 'mdi:clock-alert-outline',
      bgGradient: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
    },
    {
      label: 'Suggested Logs',
      value: suggested,
      colorKey: 'info' as const,
      icon: 'mdi:lightbulb-outline',
      bgGradient: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
    },
    {
      label: 'Resolved Logs',
      value: resolved,
      colorKey: 'success' as const,
      icon: 'mdi:check-circle-outline',
      bgGradient: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
    },
  ];

  return (
    <Grid container spacing={1}>
      {items.map((item) => {
        const color = theme.palette[item.colorKey].main;
        const channel = theme.palette[item.colorKey].mainChannel || color;
        return (
          <Grid size={{ xs: 12, sm: 4 }} key={item.label}>
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${varAlpha(channel, 0.15)}`,
                backgroundColor: 'background.paper',
                boxShadow: `0 2px 12px ${varAlpha(channel, 0.08)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 8px 24px ${varAlpha(channel, 0.18)}`,
                  borderColor: varAlpha(channel, 0.35),
                },
              }}
            >
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography
                      variant="h3"
                      fontWeight={800}
                      sx={{ color, lineHeight: 1, mb: 0.75 }}
                    >
                      {item.value}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 2,
                      background: item.bgGradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${varAlpha(channel, 0.25)}`,
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={item.icon} width={22} sx={{ color: '#fff' }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const CalendarImpactLogs = () => {
  const theme = useTheme();
  const { permissions } = useSelector((state: RootState) => state.auth);

  const canResolve = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.impactLogs}.Edit`
  );

  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const resolveDialog = useBoolean(false);
  const ignoreDialog = useBoolean(false);
  const rescheduleDialog = useBoolean(false);

  const [resolveLog, { isLoading: resolving }] = useResolveImpactLogMutation();
  const [ignoreLog, { isLoading: ignoring }] = useIgnoreImpactLogMutation();
  const [rescheduleLog, { isLoading: rescheduling }] = useRescheduleImpactLogMutation();

  const { data: logsRaw, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetImpactLogsQuery,
    params: {
      ...(statusFilter ? { status: Number(statusFilter) } : {}),
      ...(typeFilter ? { impactType: Number(typeFilter) } : {}),
      skipCount: page * rowsPerPage,
      maxResultCount: rowsPerPage,
    },
    popupConfig: { error: false },
  });

  const logsData = (logsRaw?.items?.length ?? 0) > 0 ? logsRaw : MOCK_LOGS;
  const logs: any[] = logsData?.items ?? [];
  const total: number = logsData?.totalCount ?? 0;

  // Formik instances
  const resolveFormik = useFormik({
    initialValues: { resolutionNote: '' },
    validationSchema: resolveSchema,
    onSubmit: async (values) => {
      try {
        await resolveLog({ id: selectedLog.id, body: values }).unwrap();
        shikshaMitraToast.success({ message: 'Impact log resolved' });
        resolveDialog.onFalse();
        resolveFormik.resetForm();
      } catch {
        shikshaMitraToast.error({ message: 'Failed to resolve' });
      }
    },
  });

  const ignoreFormik = useFormik({
    initialValues: { reason: '' },
    validationSchema: ignoreSchema,
    onSubmit: async (values) => {
      try {
        await ignoreLog({ id: selectedLog.id, body: values }).unwrap();
        shikshaMitraToast.success({ message: 'Impact log ignored' });
        ignoreDialog.onFalse();
        ignoreFormik.resetForm();
      } catch {
        shikshaMitraToast.error({ message: 'Failed to ignore' });
      }
    },
  });

  const rescheduleFormik = useFormik({
    initialValues: { newDate: null as string | null, note: '' },
    validationSchema: rescheduleSchema,
    onSubmit: async (values) => {
      try {
        await rescheduleLog({
          id: selectedLog.id,
          body: {
            newDate: values.newDate ? dayjs(values.newDate).format('YYYY-MM-DDTHH:mm:ssZ') : '',
            note: values.note,
          },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Activity rescheduled' });
        rescheduleDialog.onFalse();
        rescheduleFormik.resetForm();
      } catch {
        shikshaMitraToast.error({ message: 'Failed to reschedule' });
      }
    },
  });

  const openAction = (log: any, dialog: ReturnType<typeof useBoolean>) => {
    setSelectedLog(log);
    dialog.onTrue();
  };

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'affectedDate',
        label: 'Affected Date',
        align: 'left',
        minWidth: 140,
        render: (value, row) => (
          <Box>
            <Typography variant="body2" fontWeight={700}>
              {dayjs(row.affectedDate).format('DD MMM YYYY')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dayjs(row.affectedDate).format('dddd')}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'impactType',
        label: 'Impact Type',
        align: 'left',
        minWidth: 160,
        render: (value, row) => {
          const colorKey = IMPACT_TYPE_COLOR_KEY[row.impactType] ?? 'default';
          const typeColor =
            colorKey === 'default' ? theme.palette.text.secondary : theme.palette[colorKey].main;
          const typeIcon = IMPACT_TYPE_ICON[row.impactType] ?? 'mdi:alert-circle-outline';
          return (
            <Stack direction="row" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1.5,
                  backgroundColor: alpha(typeColor, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={typeIcon} width={16} sx={{ color: typeColor }} />
              </Box>
              <Typography variant="caption" fontWeight={600} sx={{ color: typeColor }}>
                {CALENDAR_IMPACT_TYPE_LABELS[row.impactType as CalendarImpactType] ?? '—'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'affectedEntityName',
        label: 'Affected Item',
        align: 'left',
        minWidth: 240,
        render: (value, row) => (
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
              {row.affectedEntityName}
            </Typography>
            {row.message && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ maxWidth: 220, display: 'block' }}
              >
                {row.message}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        id: 'suggestedNewDate',
        label: 'Suggested Date',
        align: 'left',
        minWidth: 140,
        render: (value, row) => {
          if (row.suggestedNewDate) {
            return (
              <Label
                variant="outlined"
                color="info"
                startIcon={<Iconify icon="mdi:calendar-check-outline" width={12} />}
                sx={{ fontWeight: 600 }}
              >
                {dayjs(row.suggestedNewDate).format('DD MMM')}
              </Label>
            );
          }
          return (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          );
        },
      },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        minWidth: 120,
        render: (value, row) => (
          <Label
            color={CALENDAR_IMPACT_STATUS_COLORS[row.status as CalendarImpactStatus] as any}
            sx={{ fontWeight: 600 }}
          >
            {CALENDAR_IMPACT_STATUS_LABELS[row.status as CalendarImpactStatus]}
          </Label>
        ),
      },
      ...(canResolve
        ? [
          {
            id: 'action',
            label: 'Actions',
            align: 'right' as const,
            isSort: false,
            isFilter: false,
            sticky: true,
            minWidth: 100,
            render: (value: any, row: any) => {
              if (
                row.status === CalendarImpactStatus.Resolved ||
                row.status === CalendarImpactStatus.IgnoredWithReason ||
                row.status === CalendarImpactStatus.Rescheduled
              ) {
                return null;
              }
              return (
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <Tooltip title="Mark Resolved">
                    <IconButton
                      size="small"
                      sx={{
                        color: 'success.main',
                        '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.1) },
                      }}
                      onClick={() => openAction(row, resolveDialog)}
                    >
                      <Iconify icon="mdi:check-circle-outline" width={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reschedule">
                    <IconButton
                      size="small"
                      sx={{
                        color: 'info.main',
                        '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.1) },
                      }}
                      onClick={() => openAction(row, rescheduleDialog)}
                    >
                      <Iconify icon="mdi:calendar-sync-outline" width={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ignore with Reason">
                    <IconButton
                      size="small"
                      sx={{
                        color: 'warning.main',
                        '&:hover': { backgroundColor: alpha(theme.palette.warning.main, 0.1) },
                      }}
                      onClick={() => openAction(row, ignoreDialog)}
                    >
                      <Iconify icon="mdi:eye-off-outline" width={18} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              );
            },
          },
        ]
        : []),
    ],
    [canResolve, theme, resolveDialog, rescheduleDialog, ignoreDialog]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Impact Logs"
        description="Review and resolve academic activities impacted by calendar changes."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Academic Calendar', href: '/academic/academicCalendarDashboard' },
          { name: 'Impact Logs' },
        ]}
      />

      {/* Summary strip */}
      <SummaryStrip logs={logs} />

      {/* Filters */}
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.customShadows?.card || '0px 2px 12px rgba(0, 0, 0, 0.03)',
          backgroundColor: 'background.paper',
        }}
      >
        <Grid container spacing={1} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                {IMPACT_STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Type</InputLabel>
              <Select
                label="Filter by Type"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(0);
                }}
              >
                {IMPACT_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={1}>
              {(statusFilter || typeFilter) && (
                <Label
                  variant="soft"
                  color="error"
                  onClick={() => {
                    setStatusFilter('');
                    setTypeFilter('');
                  }}
                  sx={{ cursor: 'pointer' }}
                  endIcon={<Iconify icon="mdi:close" width={12} />}
                >
                  Clear Filters
                </Label>
              )}
              <Label
                variant="outlined"
                color="default"
                startIcon={<Iconify icon="mdi:filter-outline" width={14} />}
                sx={{ py: 1.5, px: 1.5 }}
              >
                {`${total} records`}
              </Label>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <CustomizableTable
        tableId="impact-logs"
        isLoading={isLoading}
        isPagination
        serverSidePagination
        totalCount={total}
        onServerPagination={(p, r) => {
          setPage(p - 1);
          setRowsPerPage(r);
        }}
        isSearch
        isFilter
        isShowedDense={false}
        columns={columns}
        data={logs}
        noDataText={
          <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: varAlpha(theme.palette.success.mainChannel, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mdi:check-circle-outline" width={32} color="success.main" />
            </Box>
            <Typography variant="subtitle2" color="text.secondary">
              All clear! No impact logs found
            </Typography>
          </Stack>
        }
      />

      {/* ── Resolve Dialog ─────────────────────────────────────────── */}
      <CustomDialog
        open={resolveDialog.value}
        handleClose={resolveDialog.onFalse}
        title="Mark as Resolved"
        maxWidth="xs"
      >
        <DialogScrollContent>
          <Stack spacing={1}>
            {selectedLog && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: varAlpha(theme.palette.success.mainChannel, 0.04),
                  borderColor: varAlpha(theme.palette.success.mainChannel, 0.15),
                }}
              >
                <Typography variant="body2" fontWeight={700}>
                  {selectedLog.affectedEntityName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dayjs(selectedLog.affectedDate).format('DD MMM YYYY')}
                </Typography>
              </Paper>
            )}
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Resolution Note (optional)"
              name="resolutionNote"
              value={resolveFormik.values.resolutionNote}
              onChange={resolveFormik.handleChange}
              placeholder="How was this resolved?"
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            onClick={resolveDialog.onFalse}
            disabled={resolving}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            size="small"
            color="success"
            loading={resolving}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={(e: any) => resolveFormik.handleSubmit(e)}
          >
            Mark Resolved
          </LoadingButton>
        </DialogActions>
      </CustomDialog>

      {/* ── Ignore Dialog ─────────────────────────────────────────── */}
      <CustomDialog
        open={ignoreDialog.value}
        handleClose={ignoreDialog.onFalse}
        title="Ignore with Reason"
        maxWidth="xs"
      >
        <DialogScrollContent>
          <Stack spacing={1}>
            {selectedLog && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: varAlpha(theme.palette.warning.mainChannel, 0.04),
                  borderColor: varAlpha(theme.palette.warning.mainChannel, 0.15),
                }}
              >
                <Typography variant="body2" fontWeight={700}>
                  {selectedLog.affectedEntityName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dayjs(selectedLog.affectedDate).format('DD MMM YYYY')}
                </Typography>
              </Paper>
            )}
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Reason *"
              name="reason"
              value={ignoreFormik.values.reason}
              onChange={ignoreFormik.handleChange}
              onBlur={ignoreFormik.handleBlur}
              error={ignoreFormik.touched.reason && Boolean(ignoreFormik.errors.reason)}
              helperText={ignoreFormik.touched.reason && ignoreFormik.errors.reason}
              placeholder="Why is this impact being ignored?"
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            onClick={ignoreDialog.onFalse}
            disabled={ignoring}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            size="small"
            color="warning"
            loading={ignoring}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={(e: any) => ignoreFormik.handleSubmit(e)}
          >
            Ignore
          </LoadingButton>
        </DialogActions>
      </CustomDialog>

      {/* ── Reschedule Dialog ─────────────────────────────────────── */}
      <CustomDialog
        open={rescheduleDialog.value}
        handleClose={rescheduleDialog.onFalse}
        title="Reschedule Activity"
        maxWidth="xs"
      >
        <DialogScrollContent>
          <Stack spacing={1}>
            {selectedLog && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: varAlpha(theme.palette.info.mainChannel, 0.04),
                  borderColor: varAlpha(theme.palette.info.mainChannel, 0.15),
                }}
              >
                <Typography variant="body2" fontWeight={700}>
                  {selectedLog.affectedEntityName}
                </Typography>
                <Stack direction="row" gap={1} mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Original: {dayjs(selectedLog.affectedDate).format('DD MMM YYYY')}
                  </Typography>
                  {selectedLog.suggestedNewDate && (
                    <Typography variant="caption" color="info.main">
                      Suggested: {dayjs(selectedLog.suggestedNewDate).format('DD MMM YYYY')}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            )}
            <TextField
              fullWidth
              size="small"
              type="date"
              label="New Date *"
              name="newDate"
              InputLabelProps={{ shrink: true }}
              value={rescheduleFormik.values.newDate ?? ''}
              onChange={(e) => rescheduleFormik.setFieldValue('newDate', e.target.value)}
              error={rescheduleFormik.touched.newDate && Boolean(rescheduleFormik.errors.newDate)}
              helperText={
                rescheduleFormik.touched.newDate && (rescheduleFormik.errors.newDate as string)
              }
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Note (optional)"
              name="note"
              value={rescheduleFormik.values.note}
              onChange={rescheduleFormik.handleChange}
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            onClick={rescheduleDialog.onFalse}
            disabled={rescheduling}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            size="small"
            color="info"
            loading={rescheduling}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={(e: any) => rescheduleFormik.handleSubmit(e)}
          >
            Reschedule
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default CalendarImpactLogs;
