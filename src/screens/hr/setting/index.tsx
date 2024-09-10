'use client';

import { useFormik } from 'formik';
import React, { useCallback } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Card,
  Grid,
  Radio,
  Button,
  Checkbox,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  RadioGroup,
  CardContent,
  DialogActions,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const HrAttendanceSettingScreen = () => {
  const dialog = useBoolean(false);

  const actions = useCallback(
    ({ popover }: any) => (
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
            // modal.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
        {/* {children && (
          <MenuItem
            onClick={() => {
              childModal.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="ic:baseline-add" sx={{ height: '16px', width: '16px' }} />
            Create {childEditData?.name}
          </MenuItem>
        )} */}
      </MenuList>
    ),
    []
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        links={[{ name: 'HR' }, { name: 'Attendance and Leave Management' }, { name: 'Setting' }]}
        sx={{ px: 1, mb: 2 }}
      />

      <Card sx={{ p: 1, my: 2 }}>
        <Typography variant="h6" gutterBottom>
          Automated Notifications
        </Typography>

        <Box>
          <FormControlLabel control={<Checkbox />} label="Absent" />
          <FormControlLabel control={<Checkbox />} label="Late" />
          <FormControlLabel control={<Checkbox />} label="Half-day" />
        </Box>
      </Card>

      <Card sx={{ p: 1, my: 2 }}>
        <Typography variant="h6" gutterBottom>
          Method
        </Typography>
        <RadioGroup
          aria-label="notification-method"
          name="notification-method"
          defaultValue="email"
          row
        >
          <FormControlLabel value="email" control={<Radio />} label="Email" />
          <FormControlLabel value="sms" control={<Radio />} label="SMS" />
          <FormControlLabel value="push" control={<Radio />} label="Push Notification" />
        </RadioGroup>
      </Card>

      <Card sx={{ p: 1, my: 2 }}>
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
                  return <ThreeDotsActions actions={actions} />;
                },
              },
            ]}
            data={[
              {
                name: 'Regular School Day',
                type: 'Default',
                lateThreshold: '15',
                lateThresholdUnit: 'minutes',
                halfDayThreshold: '180',
                halfDayThresholdUnit: 'minutes',
                enableNotification: true,
              },
              {
                name: 'Early Dismissal',
                type: 'Special',
                lateThreshold: '10',
                lateThresholdUnit: 'minutes',
                halfDayThreshold: '120',
                halfDayThresholdUnit: 'minutes',
                enableNotification: false,
              },
              {
                name: 'Assembly Day',
                type: 'Special',
                lateThreshold: '5',
                lateThresholdUnit: 'minutes',
                halfDayThreshold: '150',
                halfDayThresholdUnit: 'minutes',
                enableNotification: true,
              },
            ]}
          />
        </CardContent>
      </Card>

      <CustomDialog title="Add Rule" open={dialog.value} handleClose={dialog.onFalse}>
        <AttendanceRuleForm />
      </CustomDialog>
    </Box>
  );
};

export default HrAttendanceSettingScreen;

const AttendanceRuleForm = () => {
  const formik = useFormik({
    initialValues: {
      name: '',
      type: '',
      lateThreshold: '',
      lateThresholdUnit: 'minutes',
      halfDayThreshold: '',
      halfDayThresholdUnit: 'minutes',
      enableNotification: false,
    },
    onSubmit: () => {},
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
                  { id: 'half-day', name: 'Half-day' },
                  { id: 'late', name: 'Late' },
                ]}
                label="Attendance Type"
                labelKey="name"
                valueKey="id"
                value={formik.values.type}
                fullWidth
                formControlProps={{ fullWidth: true }}
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
                          { id: 'minutes', name: 'Min' },
                          { id: 'hours', name: 'Hrs' },
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
                          { id: 'minutes', name: 'Min' },
                          { id: 'hours', name: 'Hrs' },
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
                label="Enable notification for parents or students if the rule is violated."
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
