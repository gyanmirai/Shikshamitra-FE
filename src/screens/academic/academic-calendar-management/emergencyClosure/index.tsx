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
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { alpha, useTheme } from '@mui/material/styles';
import { shikshaMitraToast } from 'src/components/toast';
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
  date: Yup.mixed().required('Closure date is required'),
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
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );
  const [selectedClosure, setSelectedClosure] = useState<any>(null);

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
      const payload = {
        ...values,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DDTHH:mm:ssZ') : null,
        standardIds: values.appliesToAll ? [] : values.standardIds,
        divisionIds: [],
      };

      try {
        await createEmergencyClosure(payload).unwrap();
        shikshaMitraToast.success({ message: 'Emergency closure declared successfully' });
        helpers.resetForm();
        addDialog.onFalse();
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.detail || 'Failed to declare emergency closure',
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

  const closeAddDialog = () => {
    addDialog.onFalse();
    formik.resetForm();
  };

  const handleCancelClick = (row: any) => {
    setSelectedClosure(row);
    cancelDialog.onTrue();
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
      id: 'date',
      label: 'Closure Date',
      filterType: 'date',
      isFilter: true,
      render: (value) => dayjs(value).format('DD MMM YYYY'),
    },
    {
      id: 'title',
      label: 'Title',
      filterType: 'string',
      isFilter: true,
      render: (value, row) => (
        <Stack spacing={0.3}>
          <Typography variant="body2" fontWeight={700}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.description || 'No reason provided'}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'scope',
      label: 'Scope',
      filterType: 'string',
      isFilter: true,
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
      render: (value) => (
        <Label color={statusColor[Number(value)] ?? 'default'}>
          {CALENDAR_DAY_STATUS_LABELS[Number(value) as CalendarDayStatus] ?? 'Unknown'}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <Stack direction="row" justifyContent="flex-end" gap={0.5}>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <CustomBreadcrumbs
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
          <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
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
        title="Declare Emergency Closure"
        maxWidth="md"
      >
        <DialogScrollContent>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Closure Date *"
                value={formik.values.date ? dayjs(formik.values.date) : null}
                onChange={(val) => formik.setFieldValue('date', val ? val.format('YYYY-MM-DDTHH:mm:ssZ') : null)}
                disablePast
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: formik.touched.date && Boolean(formik.errors.date),
                    helperText: formik.touched.date && (formik.errors.date as string),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
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
            loading={creating}
            onClick={(e: any) => formik.handleSubmit(e)}
            startIcon={<Iconify icon="mdi:alert-octagon-outline" />}
          >
            Declare Closure
          </LoadingButton>
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
