'use client';

import { useFormik } from 'formik';
import React, { useState, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import {
  Box,
  Card,
  Grid,
  Button,
  Checkbox,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  CardContent,
  DialogActions,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { TimeUnitType } from 'src/enums/time-units';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeAttendanceStatus } from 'src/enums/employee-attendance-status';
import {
  useGetEmployeeCustomAttendanceRuleQuery,
  useAddEmployeeCustomAttendanceRuleMutation,
  useUpdateEmployeeCustomAttendanceRuleMutation,
} from 'src/redux/employee/employeeApi';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const HrAttendanceSettingScreen = () => {
  const dialog = useBoolean(false);

  const [editData, setEditData] = useState<any>(null);

  const actions = useCallback(
    ({ popover }: any, row: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            // confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            setEditData(row);
            dialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
      </MenuList>
    ),
    [dialog]
  );
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeCustomAttendanceRuleQuery,
  });
  console.log(data, 'data');
  const handleClose = () => {
    setEditData(null);
    dialog.onFalse();
  };
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        links={[{ name: 'HR' }, { name: 'Attendance and Leave Management' }, { name: 'Setting' }]}
        sx={{ px: 1, mb: 2 }}
      />

      <Card sx={{ p: 2, my: 2, boxShadow: 'var(--shadows-3)' }}>
        <Typography variant="h6" gutterBottom>
          Automated Notifications
        </Typography>

        <Box>
          <FormControlLabel control={<Checkbox />} label="Absent" />
          <FormControlLabel control={<Checkbox />} label="Late" />
          <FormControlLabel control={<Checkbox />} label="Half-day" />
        </Box>
      </Card>

      <Card sx={{ p: 2, my: 2, boxShadow: 'var(--shadows-3)' }}>
        <Typography variant="h6" gutterBottom>
          Method
        </Typography>
        <Box>
          <FormControlLabel value="email" control={<Checkbox />} label="Email" />
          <FormControlLabel value="sms" control={<Checkbox />} label="SMS" />
          <FormControlLabel value="push" control={<Checkbox />} label="Push Notification" />
        </Box>
      </Card>

      <Card elevation={3} sx={{ p: 2, my: 2, boxShadow: 'var(--shadows-3)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" gutterBottom>
            Custom Attendance Rules
          </Typography>
          <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
            Add Rule
          </Button>
        </Box>

        <CardContent>
          <CustomizableTable
            isLoading={isLoading}
            columns={[
              { label: 'Name', id: 'name' },
              { label: 'Type', id: 'type' },
              { label: 'Late Threshold', id: 'lateThreshold' },
              { label: 'Late Threshold Unit', id: 'lateThresholdUnit' },
              { label: 'Half Day Threshold', id: 'halfDayThreshold' },
              { label: 'Half Day Threshold Unit', id: 'halfDayThresholdUnit' },
              {
                label: 'Enable Notification',
                id: 'enableNotification',
                render(value, row) {
                  return value ? 'Yes' : 'No';
                },
              },
              {
                label: 'Actions',
                id: 'action',
                isSort: false,
                render(value, row) {
                  return <ThreeDotsActions actions={(props) => actions(props, row)} />;
                },
              },
            ]}
            data={[
              {
                name: 'Regular School Day',
                type: 'Default',
                lateThreshold: '15',
                lateThresholdUnit: 0,
                halfDayThreshold: '180',
                halfDayThresholdUnit: 0,
                enableNotification: true,
              },
              {
                name: 'Early Dismissal',
                type: 'Special',
                lateThreshold: '10',
                lateThresholdUnit: 0,
                halfDayThreshold: '120',
                halfDayThresholdUnit: 0,
                enableNotification: false,
              },
              {
                name: 'Assembly Day',
                type: 'Special',
                lateThreshold: '5',
                lateThresholdUnit: 0,
                halfDayThreshold: '150',
                halfDayThresholdUnit: 0,
                enableNotification: true,
              },
            ]}
          />
        </CardContent>
      </Card>

      <CustomDialog title="Add Rule" open={dialog.value} handleClose={handleClose}>
        <AttendanceRuleForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default HrAttendanceSettingScreen;

interface AttendanceRuleFormProps {
  handleClose: () => void;
  editData: any;
}

const AttendanceRuleForm = ({ handleClose, editData }: AttendanceRuleFormProps) => {
  const [addRule, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEmployeeCustomAttendanceRuleMutation,
  });

  const [updateRule] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeCustomAttendanceRuleMutation,
  });
  const formik = useFormik({
    initialValues: {
      name: editData?.name || '',
      type: editData?.type || '',
      lateThreshold: editData?.lateThreshold || '',
      lateThresholdUnit: editData?.lateThresholdUnit || TimeUnitType.Minutes,
      halfDayThreshold: editData?.halfDayThreshold || '',
      halfDayThresholdUnit: editData?.halfDayThresholdUnit || TimeUnitType.Minutes,
      enableNotification: editData?.enableNotificationForUpperAuthority || false,
    },
    onSubmit: async (values) => {
      try {
        if (editData) {
          await updateRule({
            id: editData.id,
            name: values.name,
            type: values.type,
            lateThreshold: values.lateThreshold,
            lateThresholdUnit: values.lateThresholdUnit,
            halfDayThreshold: values.halfDayThreshold,
            halfDayThresholdUnit: values.halfDayThresholdUnit,
            enableNotificationForUpperAuthority: values.enableNotification,
          });
        }
        await addRule({
          name: values.name,
          type: values.type,
          lateThreshold: values.lateThreshold,
          lateThresholdUnit: values.lateThresholdUnit,
          halfDayThreshold: values.halfDayThreshold,
          halfDayThresholdUnit: values.halfDayThresholdUnit,
          enableNotificationForUpperAuthority: values.enableNotification,
        });
        handleClose();
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar
          sx={{
            p: 3,
            bgcolor: 'background.neutral',
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Rule Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <CustomSelect
                options={[
                  { id: EmployeeAttendanceStatus.HalfDayLeave, name: 'Half-day' },
                  { id: 4, name: 'Late' },
                ]}
                label="Attendance Type"
                labelKey="name"
                valueKey="id"
                value={formik.values.type}
                fullWidth
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                onChange={(val: string | string[]) => formik.setFieldValue('type', val as string)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Late Threshold"
                name="lateThreshold"
                value={formik.values.lateThreshold}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { paddingRight: 0 } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CustomSelect
                        options={[
                          { id: TimeUnitType.Minutes, name: 'Min' },
                          { id: TimeUnitType.Hours, name: 'Hrs' },
                        ]}
                        label=""
                        labelKey="name"
                        valueKey="id"
                        value={formik.values.lateThresholdUnit}
                        fullWidth
                        formControlProps={{ fullWidth: true }}
                        onChange={(val: string | string[]) =>
                          formik.setFieldValue('lateThresholdUnit', val as string)
                        }
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Half Threshold"
                name="halfDayThreshold"
                value={formik.values.halfDayThreshold}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { paddingRight: 0 } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CustomSelect
                        options={[
                          { id: TimeUnitType.Minutes, name: 'Min' },
                          { id: TimeUnitType.Hours, name: 'Hrs' },
                        ]}
                        label=""
                        labelKey="name"
                        valueKey="id"
                        value={formik.values.halfDayThresholdUnit}
                        fullWidth
                        formControlProps={{ fullWidth: true }}
                        onChange={(val: string | string[]) =>
                          formik.setFieldValue('halfDayThresholdUnit', val as string)
                        }
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.enableNotification}
                    onChange={formik.handleChange}
                    name="enableNotification"
                  />
                }
                label="Enable notification for Upper Authority if the rule is violated."
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <LoadingButton loading={isLoading} type="submit" variant="contained">
            Submit
          </LoadingButton>
        </DialogActions>
      </form>
    </Box>
  );
};
