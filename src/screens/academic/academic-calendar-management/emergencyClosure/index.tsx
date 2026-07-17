'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { alpha, useTheme } from '@mui/material/styles';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { academicPermissions } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { CalendarDayStatus, CALENDAR_DAY_STATUS_LABELS } from 'src/enums/academic-calendar';
import {
  useGetEmergencyClosuresQuery,
  useCreateEmergencyClosureMutation,
  useCancelEmergencyClosureMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';
import {
  Box,
  Grid,
  Stack,
  Alert,
  Paper,
  Switch,
  Button,
  Select,
  Divider,
  Tooltip,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

const statusColor: Record<number, 'success' | 'warning' | 'default'> = {
  [CalendarDayStatus.Active]: 'success',
  [CalendarDayStatus.Cancelled]: 'default',
  [CalendarDayStatus.Rescheduled]: 'warning',
};

const emergencyClosureSchema = Yup.object().shape({
  startDate: Yup.mixed().required('Start date is required'),
  endDate: Yup.mixed()
    .required('End date is required')
    .test('not-before-start', 'End date cannot be before start date', function validateEndDate(value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      return dayjs(value as string).isSame(dayjs(startDate as string), 'day') || dayjs(value as string).isAfter(dayjs(startDate as string), 'day');
    }),
  startTime: Yup.string().when('hasTimeRange', {
    is: true,
    then: (schema) => schema.required('Start time is required'),
  }),
  endTime: Yup.string().when('hasTimeRange', {
    is: true,
    then: (schema) =>
      schema
        .required('End time is required')
        .test('after-start-time', 'End time must be after start time', function validateEndTime(value) {
          const { startTime } = this.parent;
          if (!startTime || !value) return true;
          return value > startTime;
        }),
  }),
  title: Yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  description: Yup.string().required('Reason/description is required'),
  standardIds: Yup.array().when('appliesToAll', {
    is: false,
    then: (schema) => schema.min(1, 'Select at least one class'),
    otherwise: (schema) => schema,
  }),
});

const EmergencyClosureScreen = () => {
  const theme = useTheme();
  const addDialog = useBoolean();
  const cancelDialog = useBoolean();
  const viewDialog = useBoolean();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );
  const [selectedClosure, setSelectedClosure] = useState<any>(null);
  const [viewingClosure, setViewingClosure] = useState<any>(null);
  const [editingClosureId, setEditingClosureId] = useState<string | null>(null);

  const standards =
    medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [];

  const canDeclare = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.emergencyClosure}.Add`
  );
  const canCancel = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.emergencyClosure}.Delete`
  );

  const { data: closuresData, isLoading } = useGetEmergencyClosuresQuery(
    {
      academicYearId: currentYear?.id,
      skipCount: 0,
      maxResultCount: 200,
    },
    { skip: !currentYear?.id }
  );
  const [createEmergencyClosure, { isLoading: creating }] = useCreateEmergencyClosureMutation();
  const [cancelEmergencyClosure, { isLoading: cancelling }] = useCancelEmergencyClosureMutation();

  const formik = useFormik({
    initialValues: {
      date: null as string | null,
      startDate: null as string | null,
      endDate: null as string | null,
      hasTimeRange: false,
      startTime: '',
      endTime: '',
      title: '',
      description: '',
      appliesToAll: true,
      standardIds: [] as string[],
      notifyParents: true,
      notifyTeachers: true,
      notifyStudents: true,
      notifyStaff: false,
      autoScanImpacts: true,
    },
    validationSchema: emergencyClosureSchema,
    onSubmit: async (values, helpers) => {
      const formattedStartDate = values.startDate
        ? dayjs(values.startDate).format('YYYY-MM-DDTHH:mm:ssZ')
        : null;
      const formattedEndDate = values.endDate
        ? dayjs(values.endDate).format('YYYY-MM-DDTHH:mm:ssZ')
        : formattedStartDate;
      const payload = {
        ...values,
        date: formattedStartDate,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        startTime: values.hasTimeRange ? values.startTime : null,
        endTime: values.hasTimeRange ? values.endTime : null,
        standardIds: values.appliesToAll ? [] : values.standardIds,
        divisionIds: [],
        autoScanImpacts: Boolean(values.autoScanImpacts),
      };

      try {
        if (editingClosureId) {
          // No dedicated update endpoint exists — an edit is applied as
          // cancel-the-original then declare-a-new-one with the updated values.
          await cancelEmergencyClosure(editingClosureId).unwrap();
          await createEmergencyClosure(payload).unwrap();
          shikshaMitraToast.success({ message: 'Emergency closure updated successfully' });
        } else {
          await createEmergencyClosure(payload).unwrap();
          shikshaMitraToast.success({ message: 'Emergency closure declared successfully' });
        }
        helpers.resetForm();
        setEditingClosureId(null);
        addDialog.onFalse();
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.detail || 'Failed to save emergency closure',
        });
      }
    },
  });

  const tableData = Array.isArray(closuresData) ? closuresData : (closuresData?.items ?? []);

  const getScopeLabel = (row: any) => {
    if (row.appliesToAll) return 'Entire school';
    const standard = standards.find((item: any) => item.id === row.standardId);
    return standard?.name ?? 'Selected classes';
  };

  const formatTimeInput = (value?: string | null) => {
    if (!value) return '';
    return value.slice(0, 5);
  };

  const formatTimeRange = (row: any) => {
    if (!row.startTime || !row.endTime) return 'Full day';
    return `${formatTimeInput(row.startTime)} - ${formatTimeInput(row.endTime)}`;
  };

  const closeAddDialog = () => {
    addDialog.onFalse();
    formik.resetForm();
    setEditingClosureId(null);
  };

  const handleCancelClick = (row: any) => {
    setSelectedClosure(row);
    cancelDialog.onTrue();
  };

  const handleViewClick = (row: any) => {
    setViewingClosure(row);
    viewDialog.onTrue();
  };

  const handleEditClick = (row: any) => {
    setEditingClosureId(row.id);
    const hasTimeRange = Boolean(row.startTime && row.endTime);
    formik.setValues({
      date: row.date ?? null,
      startDate: row.date ?? null,
      endDate: row.date ?? null,
      hasTimeRange,
      startTime: hasTimeRange ? formatTimeInput(row.startTime) : '',
      endTime: hasTimeRange ? formatTimeInput(row.endTime) : '',
      title: row.title ?? '',
      description: row.description ?? '',
      appliesToAll: Boolean(row.appliesToAll),
      standardIds: row.appliesToAll ? [] : [row.standardId].filter(Boolean),
      notifyParents: row.notifyParents ?? true,
      notifyTeachers: row.notifyTeachers ?? true,
      notifyStudents: row.notifyStudents ?? true,
      notifyStaff: row.notifyStaff ?? false,
      autoScanImpacts: row.autoScanImpacts ?? true,
    });
    addDialog.onTrue();
  };

  const handleCancelClosure = async () => {
    if (!selectedClosure?.id) return;

    try {
      await cancelEmergencyClosure(selectedClosure.id).unwrap();
      shikshaMitraToast.success({ message: 'Emergency closure cancelled successfully' });
      cancelDialog.onFalse();
      setSelectedClosure(null);
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.detail || 'Failed to cancel emergency closure',
      });
    }
  };

  const columns: IColumn[] = [
    {
      id: 'title',
      label: 'Title',
      filterType: 'string',
      isFilter: true,
      minWidth: 280,
      render: (value, row) => (
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {value}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ display: 'block', maxWidth: 360 }}
          >
            {row.description || 'No reason provided'}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'date',
      label: 'Closure Date',
      filterType: 'date',
      isFilter: true,
      minWidth: 150,
      render: (value) => dayjs(value).format('DD MMM YYYY'),
    },
    {
      id: 'timeRange',
      label: 'Time',
      minWidth: 130,
      isSort: false,
      render: (_, row) => (
        <Typography variant="caption" color={row.startTime && row.endTime ? 'text.primary' : 'text.secondary'}>
          {formatTimeRange(row)}
        </Typography>
      ),
    },
    {
      id: 'scope',
      label: 'Scope',
      filterType: 'string',
      isFilter: true,
      minWidth: 160,
      render: (_, row) => getScopeLabel(row),
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'enum',
      enumOptions: Object.entries(CALENDAR_DAY_STATUS_LABELS).map(([value, label]) => ({
        label,
        value: Number(value),
      })),
      isFilter: true,
      align: 'center',
      sticky: true,
      minWidth: 130,
      render: (value) => (
        <Label color={statusColor[Number(value)] ?? 'default'}>
          {CALENDAR_DAY_STATUS_LABELS[Number(value) as CalendarDayStatus] ?? 'Unknown'}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      sticky: true,
      minWidth: 120,
      isSort: false,
      isFilter: false,
      render: (_, row) => (
        <Stack direction="row" justifyContent="center" gap={0.5}>
          <Tooltip title="View details">
            <IconButton size="small" onClick={() => handleViewClick(row)}>
              <Iconify icon="mdi:eye-outline" width={18} />
            </IconButton>
          </Tooltip>
          {canDeclare && Number(row.status) === CalendarDayStatus.Active && (
            <Tooltip title="Edit closure">
              <IconButton size="small" color="primary" onClick={() => handleEditClick(row)}>
                <Iconify icon="mdi:pencil-outline" width={18} />
              </IconButton>
            </Tooltip>
          )}
          {canCancel && Number(row.status) === CalendarDayStatus.Active && (
            <Tooltip title="Cancel closure">
              <IconButton size="small" color="error" onClick={() => handleCancelClick(row)}>
                <Iconify icon="mdi:close-circle-outline" width={18} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Emergency Closure"
        description="Review declared emergency closures and add a new closure when school operations need to pause."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Academic Calendar', href: '/academic/academicCalendarDashboard' },
          { name: 'Emergency Closure' },
        ]}
        action={
          <Button
            variant="contained"
            color="error"
            disabled={!canDeclare}
            startIcon={<Iconify icon="mdi:alert-octagon-outline" width={18} />}
            onClick={addDialog.onTrue}
          >
            Declare Closure
          </Button>
        }
      />

      {!canDeclare && (
        <Alert
          severity="warning"
          icon={<Iconify icon="mdi:lock-outline" />}
          sx={{ borderRadius: 2 }}
        >
          You do not have permission to declare an emergency closure.
        </Alert>
      )}

      <CustomizableTable
        tableId="emergency-closure-table"
        isLoading={isLoading}
        isPagination
        isSearch
        isFilter
        isShowedDense={false}
        columns={columns}
        data={tableData}
        noDataText={
          <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mdi:alert-octagon-outline" width={32} color="error.main" />
            </Box>
            <Typography variant="subtitle2" color="text.secondary">
              No emergency closures declared yet
            </Typography>
          </Stack>
        }
      />

      <CustomDialog
        open={addDialog.value}
        handleClose={closeAddDialog}
        title={
          <Stack direction="row" alignItems="center" gap={1}>
            <span>{editingClosureId ? 'Edit Emergency Closure' : 'Declare Emergency Closure'}</span>
            <CustomTooltip
              arrow
              placement="right"
              title="Declaring a closure marks the selected date range as emergency non-working time, notifies the selected audiences, and flags affected academic activities when auto-scan is on."
            >
              <Iconify icon="lucide:info" width={16} sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Stack>
        }
        maxWidth="md"
      >
        <DialogScrollContent>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Start Date *"
                value={formik.values.startDate ? dayjs(formik.values.startDate) : null}
                blockedDayTypes={[]}
                onChange={(val) => {
                  const nextValue = val ? val.format('YYYY-MM-DDTHH:mm:ssZ') : null;
                  formik.setFieldValue('date', nextValue);
                  formik.setFieldValue('startDate', nextValue);
                  if (!formik.values.endDate || (nextValue && dayjs(formik.values.endDate).isBefore(val, 'day'))) {
                    formik.setFieldValue('endDate', nextValue);
                  }
                }}
                disablePast
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: formik.touched.startDate && Boolean(formik.errors.startDate),
                    helperText: formik.touched.startDate && (formik.errors.startDate as string),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="End Date *"
                value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
                blockedDayTypes={[]}
                onChange={(val) =>
                  formik.setFieldValue('endDate', val ? val.format('YYYY-MM-DDTHH:mm:ssZ') : null)
                }
                disablePast
                minDate={formik.values.startDate ? dayjs(formik.values.startDate) : undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: formik.touched.endDate && Boolean(formik.errors.endDate),
                    helperText: formik.touched.endDate && (formik.errors.endDate as string),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Title *"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                label="Reason / Description *"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={1.5}>
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Switch
                        checked={formik.values.hasTimeRange}
                        onChange={(e) => {
                          formik.setFieldValue('hasTimeRange', e.target.checked);
                          if (!e.target.checked) {
                            formik.setFieldValue('startTime', '');
                            formik.setFieldValue('endTime', '');
                          }
                        }}
                        color="warning"
                      />
                    }
                    label={
                      <Box ml={1}>
                        <Typography variant="body2" fontWeight={700}>
                          Partial-day closure
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Turn on when school is closed only for selected hours.
                        </Typography>
                      </Box>
                    }
                  />

                  {formik.values.hasTimeRange && (
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="time"
                          label="Start Time *"
                          name="startTime"
                          value={formik.values.startTime}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.startTime && Boolean(formik.errors.startTime)}
                          helperText={formik.touched.startTime && formik.errors.startTime}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="time"
                          label="End Time *"
                          name="endTime"
                          value={formik.values.endTime}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.endTime && Boolean(formik.errors.endTime)}
                          helperText={formik.touched.endTime && formik.errors.endTime}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      checked={formik.values.appliesToAll}
                      onChange={(e) => {
                        formik.setFieldValue('appliesToAll', e.target.checked);
                        if (e.target.checked) formik.setFieldValue('standardIds', []);
                      }}
                    />
                  }
                  label={
                    <Box ml={1}>
                      <Typography variant="body2" fontWeight={700}>
                        Applies to entire school
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Turn off to restrict this closure to selected classes.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      checked={formik.values.autoScanImpacts}
                      onChange={(e) => formik.setFieldValue('autoScanImpacts', e.target.checked)}
                      color="info"
                    />
                  }
                  label={
                    <Box ml={1}>
                      <Typography variant="body2" fontWeight={700}>
                        Auto-scan activities
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Create impact logs for affected academic activities.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </Grid>

            {!formik.values.appliesToAll && (
              <Grid size={{ xs: 12 }}>
                <FormControl
                  fullWidth
                  size="small"
                  error={formik.touched.standardIds && Boolean(formik.errors.standardIds)}
                >
                  <InputLabel>Classes *</InputLabel>
                  <Select
                    multiple
                    label="Classes *"
                    name="standardIds"
                    value={formik.values.standardIds}
                    onChange={(e) => {
                      const { value } = e.target;
                      formik.setFieldValue(
                        'standardIds',
                        typeof value === 'string' ? value.split(',') : value
                      );
                    }}
                    renderValue={(selected) =>
                      (selected as string[])
                        .map((id) => standards.find((item: any) => item.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')
                    }
                  >
                    {standards.map((item: any) => (
                      <MenuItem key={item.id} value={item.id}>
                        <Checkbox checked={formik.values.standardIds.includes(item.id)} />
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.standardIds && formik.errors.standardIds && (
                    <FormHelperText>{formik.errors.standardIds as string}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {[
              ['notifyTeachers', 'Teachers', 'mdi:account-tie-outline'],
              ['notifyParents', 'Parents', 'mdi:account-heart-outline'],
              ['notifyStudents', 'Students', 'mdi:school-outline'],
              ['notifyStaff', 'Staff', 'mdi:account-wrench-outline'],
            ].map(([key, label, icon]) => (
              <Grid size={{ xs: 6, sm: 3 }} key={key}>
                <Paper
                  variant="outlined"
                  onClick={() =>
                    formik.setFieldValue(key, !formik.values[key as keyof typeof formik.values])
                  }
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    textAlign: 'center',
                    borderColor: formik.values[key as keyof typeof formik.values]
                      ? 'primary.main'
                      : 'divider',
                    backgroundColor: formik.values[key as keyof typeof formik.values]
                      ? alpha(theme.palette.primary.main, 0.04)
                      : 'transparent',
                  }}
                >
                  <Iconify icon={icon} width={22} color="primary.main" />
                  <Typography variant="caption" display="block" fontWeight={700} mt={0.5}>
                    {label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogScrollContent>

        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={closeAddDialog}
            disabled={creating}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={creating || cancelling}
            onClick={(e: any) => formik.handleSubmit(e)}
            startIcon={<Iconify icon="mdi:alert-octagon-outline" />}
          >
            {editingClosureId ? 'Update Closure' : 'Declare Closure'}
          </LoadingButton>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        open={viewDialog.value}
        handleClose={viewDialog.onFalse}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                color: 'error.main',
                bgcolor: alpha(theme.palette.error.main, 0.1),
              }}
            >
              <Iconify icon="mdi:information-outline" width={18} />
            </Box>
            <span>Emergency Closure Details</span>
          </Stack>
        }
        maxWidth="sm"
      >
        <DialogScrollContent>
          {viewingClosure && (
            <Stack spacing={1.5}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.error.main, 0.04),
                  borderColor: alpha(theme.palette.error.main, 0.18),
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      Closure title
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {viewingClosure.title}
                    </Typography>
                  </Stack>
                  <Label color={statusColor[Number(viewingClosure.status)] ?? 'default'}>
                    {CALENDAR_DAY_STATUS_LABELS[
                      Number(viewingClosure.status) as CalendarDayStatus
                    ] ?? 'Unknown'}
                  </Label>
                </Stack>
              </Paper>

              <Grid container spacing={1}>
                {[
                  {
                    icon: 'mdi:calendar-alert-outline',
                    label: 'Closure Date',
                    value: dayjs(viewingClosure.date).format('DD MMM YYYY'),
                  },
                  {
                    icon: 'mdi:account-school-outline',
                    label: 'Scope',
                    value: getScopeLabel(viewingClosure),
                  },
                  {
                    icon: 'mdi:clock-time-four-outline',
                    label: 'Time',
                    value: formatTimeRange(viewingClosure),
                  },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, height: '100%' }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                            display: 'grid',
                            placeItems: 'center',
                            color: 'text.secondary',
                            bgcolor: alpha(theme.palette.grey[500], 0.12),
                            flexShrink: 0,
                          }}
                        >
                          <Iconify icon={item.icon} width={16} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" color="text.secondary">
                            {item.label}
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                <Stack spacing={0.75}>
                  <Typography variant="caption" color="text.secondary">
                    Reason / Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {viewingClosure.description || 'No reason provided'}
                  </Typography>
                </Stack>
              </Paper>

              <Divider />

              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Notified Audiences
                </Typography>
                <Stack direction="row" gap={0.75} flexWrap="wrap">
                  {[
                    ['notifyTeachers', 'Teachers'],
                    ['notifyParents', 'Parents'],
                    ['notifyStudents', 'Students'],
                    ['notifyStaff', 'Staff'],
                  ].map(([key, label]) => {
                    const isNotified = Boolean(viewingClosure[key]);
                    return (
                      <Label
                        key={key}
                        variant="soft"
                        color={isNotified ? 'success' : 'default'}
                        startIcon={
                          <Iconify
                            icon={isNotified ? 'mdi:check-circle-outline' : 'mdi:minus-circle-outline'}
                            width={14}
                          />
                        }
                      >
                        {label}
                      </Label>
                    );
                  })}
                </Stack>
              </Paper>
            </Stack>
          )}
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button variant="outlined" size="small" onClick={viewDialog.onFalse}>
            Close
          </Button>
        </DialogActions>
      </CustomDialog>

      <ConfirmDialog
        open={cancelDialog.value}
        onClose={cancelDialog.onFalse}
        title="Cancel Closure"
        content={
          <>
            Are you sure you want to cancel <strong>{selectedClosure?.title}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={cancelling}
            variant="contained"
            color="error"
            size="small"
            onClick={handleCancelClosure}
          >
            Cancel Closure
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default EmergencyClosureScreen;
