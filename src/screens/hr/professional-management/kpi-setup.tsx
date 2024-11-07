import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';
import type { UsePopoverReturn } from 'src/components/custom-popover';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Paper,
  Stack,
  Button,
  Slider,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  CardContent,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetRolesQuery } from 'src/redux/role/roleApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const KPISetup = () => {
  const dialog = useBoolean();
  const kpiTracingDialog = useBoolean();
  const [role, setRole] = useState<string>('');

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });

  const { currentMedium: medium, setCurrentMedium: setMedium } = useSelector(
    (state: RootState) => state.globalState
  );

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  const actions = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    ({ popover }: { popover: UsePopoverReturn }, row: any) => (
      <MenuList>
        <MenuItem
          onClick={async () => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={async () => {
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>
        <MenuItem
          onClick={async () => {
            popover.onClose();
            kpiTracingDialog.onTrue();
          }}
        >
          <Iconify
            icon="material-symbols:view-object-track"
            sx={{ height: '16px', width: '16px' }}
          />
          KPI Tracking
        </MenuItem>
      </MenuList>
    ),
    [kpiTracingDialog]
  );
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" gap={2} flexWrap="wrap" mb={2} flexGrow={1} alignItems="center">
          <CustomSelect
            isLoading={isLoading}
            options={data?.items || []}
            labelKey="name"
            valueKey="id"
            label="Role"
            value={role}
            onChange={(value) => {
              setRole(value as string);
            }}
          />
          <CustomSelect
            options={allOrganization}
            label="Organization"
            value={organization}
            onChange={(val: string | string[]) => setOrganization(val as string)}
            labelKey="name"
            valueKey="id"
            //   formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            disabled={!medium}
          />
          <CustomSelect
            options={[]}
            label="Status"
            value=""
            onChange={(val: string | string[]) => {}}
            labelKey="name"
            valueKey="id"
          />
        </Box>
        <Button startIcon={<Add />} variant="contained" size="small" onClick={dialog.onTrue}>
          Add New KPI
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'kpiName', label: 'KPI Name' },
          { id: 'description', label: 'Description' },
          { id: 'targetMetric', label: 'Target Metric' },
          { id: 'startDate', label: 'Start Date' },
          { id: 'endDate', label: 'End Date' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return <Label color={value === 'On Track' ? 'success' : 'error'}>{value}</Label>;
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            render(value, row) {
              return (
                <ThreeDotsActions placement="right-top" actions={(props) => actions(props, row)} />
              );
            },
          },
        ]}
        data={[
          {
            id: 1,
            kpiName: 'Sales Growth',
            description: 'Increase in total sales revenue',
            targetMetric: '15%',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'On Track',
          },
          {
            id: 2,
            kpiName: 'Employee Satisfaction',
            description: 'Employee satisfaction survey score',
            targetMetric: '4.5/5',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'On Track',
          },
          {
            id: 3,
            kpiName: 'Customer Retention',
            description: 'Percentage of retained customers',
            targetMetric: '90%',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'At Risk',
          },
          {
            id: 4,
            kpiName: 'Training Completion',
            description: 'Mandatory training completion rate',
            targetMetric: '100%',
            startDate: '2024-01-01',
            endDate: '2024-06-30',
            status: 'At Risk',
          },
        ]}
      />
      <CustomDialog title="New KPI" open={dialog.value} handleClose={dialog.onFalse}>
        <KPIForm />
      </CustomDialog>
      <CustomDialog
        title="KPI Tracking"
        open={kpiTracingDialog.value}
        handleClose={kpiTracingDialog.onFalse}
      >
        <KPITracking />
      </CustomDialog>
    </Box>
  );
};

export default KPISetup;

const KPIForm = () => {
  const formik = useFormik({
    initialValues: {
      kpiName: '',
      additionalComment: '',
      targetMetrics: '',
      startDate: null,
      endDate: null,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="KPI Name"
            name="kpiName"
            value={formik.values.kpiName}
            onChange={formik.handleChange}
            error={formik.touched.kpiName && Boolean(formik.errors.kpiName)}
            helperText={formik.touched.kpiName && formik.errors.kpiName}
            size="small"
          />

          <TextField
            fullWidth
            label="Additional Comment"
            name="additionalComment"
            multiline
            rows={4}
            value={formik.values.additionalComment}
            onChange={formik.handleChange}
            error={formik.touched.additionalComment && Boolean(formik.errors.additionalComment)}
            helperText={formik.touched.additionalComment && formik.errors.additionalComment}
            size="small"
          />

          <TextField
            fullWidth
            label="Target Metrics"
            name="targetMetrics"
            value={formik.values.targetMetrics}
            onChange={formik.handleChange}
            error={formik.touched.targetMetrics && Boolean(formik.errors.targetMetrics)}
            helperText={formik.touched.targetMetrics && formik.errors.targetMetrics}
            size="small"
          />

          <DatePicker
            label="Start Date"
            value={formik.values.startDate}
            onChange={(value) => formik.setFieldValue('startDate', value)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
              },
            }}
          />

          <DatePicker
            label="End Date"
            value={formik.values.endDate}
            onChange={(value) => formik.setFieldValue('endDate', value)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
              },
            }}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </DialogActions>
    </form>
  );
};

const KPITracking = () => (
  <Card>
    <CardContent>
      {/* KPI Title */}
      <Paper elevation={3} sx={{ padding: 1, borderRadius: 1, marginBottom: 1 }}>
        <Typography variant="h6" gutterBottom>
          ABC KPI
        </Typography>
      </Paper>

      {/* KPI Description */}
      <Paper elevation={3} sx={{ padding: 1, borderRadius: 1, marginBottom: 1 }}>
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          XYZ Description
        </Typography>
      </Paper>

      {/* Slider Section */}
      <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
        <Slider
          value={70}
          max={100}
          sx={{
            color: '#4CAF50', // Green color for the slider track
            '& .MuiSlider-track': { height: 8 },
            '& .MuiSlider-thumb': { width: 24, height: 24 },
          }}
        />
      </Box>

      {/* Current vs Target */}
      <Paper elevation={3} sx={{ padding: 1, borderRadius: 1, marginBottom: 1 }}>
        <Typography variant="body2">Current vs. Target - 70/100</Typography>
      </Paper>

      {/* Achieved Percentage */}
      <Paper elevation={3} sx={{ padding: 1, borderRadius: 1, marginBottom: 1 }}>
        <Typography variant="body2" sx={{ padding: 1, borderRadius: 1, marginBottom: 1 }}>
          Achieved Percentage - 70%
        </Typography>
      </Paper>

      {/* Due Date */}
      <Paper elevation={3} sx={{ padding: 1, borderRadius: 1, marginBottom: 1 }}>
        <Typography variant="body2" sx={{ padding: 1, borderRadius: 1 }}>
          Due Date - 01-01-2024
        </Typography>
      </Paper>
    </CardContent>
  </Card>
);
