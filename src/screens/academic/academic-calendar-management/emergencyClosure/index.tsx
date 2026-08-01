'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { Label } from 'src/components/label';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { alpha, useTheme, keyframes } from '@mui/material/styles';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { academicPermissions, academicPaths } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { CalendarDayStatus, CALENDAR_DAY_STATUS_LABELS } from 'src/enums/academic-calendar';
import {
  useGetEmergencyClosuresQuery,
  useCreateEmergencyClosureMutation,
  useCancelEmergencyClosureMutation,
  useUpdateEmergencyClosureMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';
import {
  Box,
  Tab,
  Tabs,
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

const shakeKeyframes = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
`;

const emergencyClosureSchema = Yup.object().shape({
  startDate: Yup.mixed().required('Start date is required'),
  endDate: Yup.mixed()
    .required('End date is required')
    .test(
      'not-before-start',
      'End date cannot be before start date',
      function validateEndDate(value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return (
          dayjs(value as string).isSame(dayjs(startDate as string), 'day') ||
          dayjs(value as string).isAfter(dayjs(startDate as string), 'day')
        );
      }
    ),
  startTime: Yup.string().when('hasTimeRange', {
    is: true,
    then: (schema) => schema.required('Start time is required'),
  }),
  endTime: Yup.string().when('hasTimeRange', {
    is: true,
    then: (schema) =>
      schema
        .required('End time is required')
        .test(
          'after-start-time',
          'End time must be after start time',
          function validateEndTime(value) {
            const { startTime } = this.parent;
            if (!startTime || !value) return true;
            return value > startTime;
          }
        ),
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
  const confirmDiscardDialog = useBoolean();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );
  const [selectedClosure, setSelectedClosure] = useState<any>(null);
  const [viewingClosure, setViewingClosure] = useState<any>(null);
  const [editingClosureId, setEditingClosureId] = useState<string | null>(null);
  const [activeStatusTab, setActiveStatusTab] = useState<number | 'all'>('all');

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

  // API calls via useQueryAndMutation (SKILL.md Section 4)
  const { data: closuresData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmergencyClosuresQuery,
    params: {
      academicYearId: currentYear?.id,
      skipCount: 0,
      maxResultCount: 200,
    },
    options: { skip: !currentYear?.id },
  });

  const [createEmergencyClosure, { isLoading: creating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateEmergencyClosureMutation,
  });

  const [updateEmergencyClosure, { isLoading: updating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmergencyClosureMutation,
  });

  const [cancelEmergencyClosure, { isLoading: cancelling }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCancelEmergencyClosureMutation,
  });

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
          await updateEmergencyClosure({
            id: editingClosureId,
            body: {
              startDate: formattedStartDate,
              endDate: formattedEndDate,
              startTime: payload.startTime,
              endTime: payload.endTime,
              title: values.title,
              description: values.description,
              appliesToAll: values.appliesToAll,
              standardIds: values.appliesToAll ? [] : values.standardIds,
              notifyParents: values.notifyParents,
              notifyTeachers: values.notifyTeachers,
              notifyStudents: values.notifyStudents,
              notifyStaff: values.notifyStaff,
              autoScanImpacts: payload.autoScanImpacts,
            },
          }).unwrap();
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

  // Status Filter Tabs (SKILL.md Section 2.9.5)
  const statusTabs = useMemo(() => [
    { label: 'All', value: 'all', count: tableData.length, color: 'default' },
    { label: 'Active', value: CalendarDayStatus.Active, count: tableData.filter((r: any) => Number(r.status) === CalendarDayStatus.Active).length, color: 'success' },
    { label: 'Cancelled', value: CalendarDayStatus.Cancelled, count: tableData.filter((r: any) => Number(r.status) === CalendarDayStatus.Cancelled).length, color: 'default' },
    { label: 'Rescheduled', value: CalendarDayStatus.Rescheduled, count: tableData.filter((r: any) => Number(r.status) === CalendarDayStatus.Rescheduled).length, color: 'warning' },
  ], [tableData]);

  const filteredData = useMemo(() => {
    if (activeStatusTab === 'all') return tableData;
    return tableData.filter((r: any) => Number(r.status) === activeStatusTab);
  }, [tableData, activeStatusTab]);

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

  const handleAttemptCloseAddDialog = () => {
    if (formik.dirty) {
      confirmDiscardDialog.onTrue();
    } else {
      closeAddDialog();
    }
  };

  const handleConfirmDiscard = () => {
    confirmDiscardDialog.onFalse();
    closeAddDialog();
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
      sticky: true,
      width: '34%',
      minWidth: 280,
      maxWidth: 420,
      cellSx: { maxWidth: 420 },
      render: (value, row) => {
        const sColor = statusColor[Number(row.status)] ?? 'default';
        const accentHex =
          sColor === 'success'
            ? theme.palette.success.main
            : sColor === 'warning'
              ? theme.palette.warning.main
              : theme.palette.grey[400];
        return (
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            sx={{
              pl: 1,
              borderLeft: `3px solid ${alpha(accentHex, 0.7)}`,
              minWidth: 0,
            }}
          >
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
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
          </Stack>
        );
      },
    },
    {
      id: 'date',
      label: 'Closure Date',
      filterType: 'date',
      isFilter: true,
      width: 150,
      minWidth: 150,
      render: (value) => dayjs(value).format('DD-MM-YYYY'),
    },
    {
      id: 'timeRange',
      label: 'Time',
      width: 120,
      minWidth: 120,
      isSort: false,
      isFilter: false,
      render: (_, row) => (
        <Typography
          variant="caption"
          color={row.startTime && row.endTime ? 'text.primary' : 'text.secondary'}
        >
          {formatTimeRange(row)}
        </Typography>
      ),
    },
    {
      id: 'scope',
      label: 'Scope',
      filterType: 'string',
      isFilter: true,
      width: 170,
      minWidth: 170,
      maxWidth: 190,
      cellSx: { maxWidth: 190 },
      render: (_, row) => getScopeLabel(row),
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'enum',
      enumOptions: Object.values(CALENDAR_DAY_STATUS_LABELS).map((label) => ({
        label,
        value: label,
      })),
      isFilter: true,
      sticky: true,
      width: 128,
      minWidth: 128,
      render: (value) => (
        <Label color={statusColor[Number(value)] ?? 'default'}>
          {CALENDAR_DAY_STATUS_LABELS[Number(value) as CalendarDayStatus] ?? 'Unknown'}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'left',
      sticky: true,
      stickyPosition: 'right',
      width: 50,
      minWidth: 50,
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) => (
        <ThreeDotsActions
          showViewIcon
          showEditIcon={canDeclare && Number(row.status) === CalendarDayStatus.Active}
          showDeleteIcon={canCancel && Number(row.status) === CalendarDayStatus.Active}
          deleteLabel="Cancel closure"
          handleViewClick={() => handleViewClick(row)}
          handleEditClick={() => handleEditClick(row)}
          handleDeleteClick={() => handleCancelClick(row)}
          showThreeDots={false}
        />
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      <CustomBreadcrumbs
        heading="Emergency Closure"
        description="Review declared emergency closures and add a new closure when school operations need to pause."
        links={[
          { name: 'Academics', href: academicPaths.dashboard },
          { name: 'Academic Calendar', href: academicPaths.academicCalendar.dashboard },
          { name: 'Emergency Closure' },
        ]}
        action={
          <SubmitButton
            type="button"
            buttonText="Declare Closure"
            disabled={!canDeclare}
            startIcon={<Iconify icon="mdi:alert-octagon-outline" width={18} />}
            onClick={addDialog.onTrue}
          />
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

      {/* Status Filter Tab Bar (SKILL.md Section 2.9.5) */}
      <Tabs
        value={activeStatusTab}
        onChange={(_, v) => setActiveStatusTab(v)}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 0.5,
        }}
      >
        {statusTabs.map((tab) => (
          <Tab
            key={String(tab.value)}
            value={tab.value}
            label={
              <Box display="flex" gap={1} alignItems="center">
                <span>{tab.label}</span>
                <Label color={tab.color as any}>{tab.count}</Label>
              </Box>
            }
          />
        ))}
      </Tabs>

      <CustomizableTable
        tableId="emergency-closure-table"
        isLoading={isLoading}
        isPagination
        isSearch
        isFilter
        isShowedDense={true}
        columns={columns}
        data={filteredData}
        noDataText={' No emergency closures declared yet'}
      />

      <CustomDialog
        open={addDialog.value}
        handleClose={handleAttemptCloseAddDialog}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center" component="span">
            <Typography variant="h6" fontWeight={700}>
              {editingClosureId ? 'Edit Emergency Closure' : 'Declare Emergency Closure'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Declaring a closure marks the selected date range as emergency non-working time, notifies the selected audiences, and flags affected academic activities when auto-scan is on."
            >
              <Iconify icon={GlobalIcons.info} color="info.main" width={16} height={16} sx={{ cursor: 'pointer' }} />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
      >
        <DialogScrollContent>
          <Grid container spacing={2}>
            <Grid
              size={{ xs: 12, sm: 6 }}
              sx={{
                animation:
                  formik.touched.startDate && Boolean(formik.errors.startDate)
                    ? `${shakeKeyframes} 0.4s ease-in-out`
                    : 'none',
              }}
            >
              <DatePicker
                label="Start Date *"
                value={formik.values.startDate ? dayjs(formik.values.startDate) : null}
                blockedDayTypes={[]}
                helperText={
                  formik.touched.startDate ? (formik.errors.startDate as string) : undefined
                }
                onChange={(val) => {
                  const nextValue = val ? val.format('YYYY-MM-DDTHH:mm:ssZ') : null;
                  formik.setFieldValue('date', nextValue);
                  formik.setFieldValue('startDate', nextValue);
                  if (
                    !formik.values.endDate ||
                    (nextValue && dayjs(formik.values.endDate).isBefore(val, 'day'))
                  ) {
                    formik.setFieldValue('endDate', nextValue);
                  }
                }}
                disablePast
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: formik.touched.startDate && Boolean(formik.errors.startDate),
                    helperText:
                      formik.touched.startDate ? (formik.errors.startDate as string) : undefined,
                  },
                }}
              />
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6 }}
              sx={{
                animation:
                  formik.touched.endDate && Boolean(formik.errors.endDate)
                    ? `${shakeKeyframes} 0.4s ease-in-out`
                    : 'none',
              }}
            >
              <DatePicker
                label="End Date *"
                value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
                blockedDayTypes={[]}
                helperText={
                  formik.touched.endDate ? (formik.errors.endDate as string) : undefined
                }
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
                    helperText:
                      formik.touched.endDate ? (formik.errors.endDate as string) : undefined,
                  },
                }}
              />
            </Grid>

            <Grid
              size={{ xs: 12 }}
              sx={{
                animation:
                  formik.touched.title && Boolean(formik.errors.title)
                    ? `${shakeKeyframes} 0.4s ease-in-out`
                    : 'none',
              }}
            >
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

            <Grid
              size={{ xs: 12 }}
              sx={{
                animation:
                  formik.touched.description && Boolean(formik.errors.description)
                    ? `${shakeKeyframes} 0.4s ease-in-out`
                    : 'none',
              }}
            >
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
                    <Grid container spacing={2}>
                      <Grid
                        size={{ xs: 12, sm: 6 }}
                        sx={{
                          animation:
                            formik.touched.startTime && Boolean(formik.errors.startTime)
                              ? `${shakeKeyframes} 0.4s ease-in-out`
                              : 'none',
                        }}
                      >
                        <TimePicker
                          label="Start Time *"
                          value={
                            formik.values.startTime
                              ? dayjs(`2000-01-01T${formik.values.startTime}`)
                              : null
                          }
                          onChange={(val) =>
                            formik.setFieldValue(
                              'startTime',
                              val && val.isValid() ? val.format('HH:mm') : ''
                            )
                          }
                          viewRenderers={{
                            hours: renderTimeViewClock,
                            minutes: renderTimeViewClock,
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              name: 'startTime',
                              onBlur: formik.handleBlur,
                              error: formik.touched.startTime && Boolean(formik.errors.startTime),
                              helperText:
                                formik.touched.startTime
                                  ? (formik.errors.startTime as string)
                                  : undefined,
                            },
                          }}
                        />
                      </Grid>
                      <Grid
                        size={{ xs: 12, sm: 6 }}
                        sx={{
                          animation:
                            formik.touched.endTime && Boolean(formik.errors.endTime)
                              ? `${shakeKeyframes} 0.4s ease-in-out`
                              : 'none',
                        }}
                      >
                        <TimePicker
                          label="End Time *"
                          value={
                            formik.values.endTime
                              ? dayjs(`2000-01-01T${formik.values.endTime}`)
                              : null
                          }
                          onChange={(val) =>
                            formik.setFieldValue(
                              'endTime',
                              val && val.isValid() ? val.format('HH:mm') : ''
                            )
                          }
                          viewRenderers={{
                            hours: renderTimeViewClock,
                            minutes: renderTimeViewClock,
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              name: 'endTime',
                              onBlur: formik.handleBlur,
                              error: formik.touched.endTime && Boolean(formik.errors.endTime),
                              helperText:
                                formik.touched.endTime
                                  ? (formik.errors.endTime as string)
                                  : undefined,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Stack>
              </Paper>
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
                      color="success"
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
              <Grid
                size={{ xs: 12 }}
                sx={{
                  animation:
                    formik.touched.standardIds && Boolean(formik.errors.standardIds)
                      ? `${shakeKeyframes} 0.4s ease-in-out`
                      : 'none',
                }}
              >
                <CustomSelect<'name' | 'id', true>
                  label="Classes *"
                  options={standards}
                  labelKey="name"
                  valueKey="id"
                  multiple
                  value={formik.values.standardIds}
                  onChange={(selected) => formik.setFieldValue('standardIds', selected)}
                  error={formik.touched.standardIds && Boolean(formik.errors.standardIds)}
                  helperText={
                    formik.touched.standardIds
                      ? (formik.errors.standardIds as string)
                      : undefined
                  }
                  formControlProps={{ fullWidth: true, size: 'small' }}
                />
              </Grid>
            )}

            {[
              ['notifyTeachers', 'Teachers', 'mdi:account-tie-outline'],
              ['notifyParents', 'Parents', 'mdi:account-heart-outline'],
              ['notifyStudents', 'Students', 'mdi:school-outline'],
              ['notifyStaff', 'Staff', 'mdi:account-wrench-outline'],
            ].map(([key, label, icon]) => {
              const isSelected = Boolean(formik.values[key as keyof typeof formik.values]);
              return (
                <Grid size={{ xs: 6, sm: 3 }} key={key}>
                  <Paper
                    variant="outlined"
                    onClick={() =>
                      formik.setFieldValue(key, !isSelected)
                    }
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: isSelected ? '2px solid' : '1px solid',
                      borderColor: isSelected ? 'success.main' : 'divider',
                      bgcolor: isSelected
                        ? alpha(theme.palette.success.main, 0.05)
                        : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: isSelected ? 'success.main' : 'primary.main',
                      },
                    }}
                  >
                    <Iconify icon={icon} width={24} color={isSelected ? 'success.main' : 'text.secondary'} />
                    <Typography
                      variant="caption"
                      display="block"
                      fontWeight={700}
                      mt={0.5}
                      color={isSelected ? 'success.main' : 'text.secondary'}
                    >
                      {label}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </DialogScrollContent>

        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <CancelButton onClick={handleAttemptCloseAddDialog} />
          <SubmitButton
            type="button"
            buttonText={editingClosureId ? 'Update Closure' : 'Declare Closure'}
            loading={creating || updateEmergencyClosure}
            startIcon={<Iconify icon={editingClosureId ? GlobalIcons.edit : 'mdi:alert-octagon-outline'} />}
            onClick={() => formik.handleSubmit()}
          />
        </DialogActions >
      </CustomDialog >

      <CustomDialog
        open={viewDialog.value}
        handleClose={viewDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center" component="span">
            <Typography variant="h6" fontWeight={700}>
              Emergency Closure Details
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="View details and notified audiences for this emergency closure."
            >
              <Iconify icon={GlobalIcons.info} color="info.main" width={16} height={16} sx={{ cursor: 'pointer' }} />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <DialogScrollContent>
          {viewingClosure && (
            <Stack spacing={1.5}>
              {(() => {
                const sColor = statusColor[Number(viewingClosure.status)] ?? 'default';
                const accentColor =
                  sColor === 'success'
                    ? theme.palette.success.main
                    : sColor === 'warning'
                      ? theme.palette.warning.main
                      : theme.palette.grey[400];

                return (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: alpha(accentColor, 0.04),
                      borderColor: alpha(accentColor, 0.2),
                      boxShadow: `inset 3px 0 0 ${accentColor}`,
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      gap={1}
                    >
                      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary">
                          Closure Title
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{ wordBreak: 'break-word' }}
                        >
                          {viewingClosure.title}
                        </Typography>
                      </Stack>
                      <Label color={sColor} sx={{ flexShrink: 0 }}>
                        {CALENDAR_DAY_STATUS_LABELS[
                          Number(viewingClosure.status) as CalendarDayStatus
                        ] ?? 'Unknown'}
                      </Label>
                    </Stack>
                  </Paper>
                );
              })()}

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.background.neutral, 0.3),
                }}
              >
                <Stack spacing={2}>
                  <Grid container spacing={2}>
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
                      {
                        icon: 'mdi:radar',
                        label: 'Impact Scan',
                        value:
                          viewingClosure.autoScanImpacts === false ? 'Manual review' : 'Auto-scan on',
                      },
                    ].map((item) => (
                      <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                        <Stack direction="row" spacing={1.25} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              display: 'grid',
                              placeItems: 'center',
                              color: 'info.main',
                              bgcolor: alpha(theme.palette.info.main, 0.08),
                              flexShrink: 0,
                            }}
                          >
                            <Iconify icon={item.icon} width={18} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {item.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ wordBreak: 'break-word' }}
                            >
                              {item.value}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider />

                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Reason / Description
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {viewingClosure.description || 'No reason provided'}
                    </Typography>
                  </Stack>

                  <Divider />

                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Notified Audiences
                    </Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      {[
                        ['notifyTeachers', 'Teachers', 'mdi:account-tie-outline'],
                        ['notifyParents', 'Parents', 'mdi:account-heart-outline'],
                        ['notifyStudents', 'Students', 'mdi:school-outline'],
                        ['notifyStaff', 'Staff', 'mdi:account-wrench-outline'],
                      ].map(([key, label, icon]) => {
                        const isNotified = Boolean(
                          viewingClosure[key as keyof typeof viewingClosure]
                        );
                        return (
                          <Label
                            key={key}
                            color={isNotified ? 'success' : 'default'}
                            variant="soft"
                            startIcon={<Iconify icon={icon} width={15} />}
                            sx={{
                              py: 0.75,
                              px: 1.25,
                              borderRadius: 1,
                              fontWeight: isNotified ? 600 : 400,
                              opacity: isNotified ? 1 : 0.6,
                            }}
                          >
                            {label}
                          </Label>
                        );
                      })}
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          )}
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <CancelButton buttonText="Close" onClick={viewDialog.onFalse} />
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
          <SubmitButton
            buttonText="Cancel Closure"
            loading={cancelling}
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={handleCancelClosure}
          />
        }
      />

      <ConfirmDialog
        open={confirmDiscardDialog.value}
        onClose={confirmDiscardDialog.onFalse}
        title="Unsaved Changes"
        content="You have unsaved changes in this form. Closing now will discard all your edits. Are you sure you want to proceed?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDiscard}
          >
            Discard Changes
          </Button>
        }
      />
    </Box >
  );
};

export default EmergencyClosureScreen;
