'use client';

import React from 'react';
import * as Yup from 'yup';
import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles/utils';
import { useBoolean } from 'src/hooks/useBoolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import { Form, Field, Formik, useFormik } from 'formik';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Card,
  Stack,
  Radio,
  Button,
  Switch,
  FormLabel,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  Autocomplete,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

const initialValues = { report: '', category: 'All', year: 'All', startDate: null, endDate: null };

const validationSchema = Yup.object().shape({
  report: Yup.string().required('Report is required'),
  bookCategory: Yup.string().required('Book Category is required'),
  publisher: Yup.string().required('Publisher is required'),
  year: Yup.string().required('Year is required'),
  startDate: Yup.string().required('Start Date is required'),
  endDate: Yup.string().required('End Date is required'),
});

const LibraryReportsScreen = () => {
  const categoryOptions = [
    { value: 'All', label: 'All Categories' },
    { value: 'fiction', label: 'Fiction' },
    { value: 'non-fiction', label: 'Non-fiction' },
    { value: 'science', label: 'Science' },
  ];

  const yearOptions = [
    { value: 'All', label: 'All Years' },
    { value: '2020', label: '2020' },
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
  ];

  const reportOptions = [
    { value: 'circulation', label: 'Circulation and Usage Reports' },
    { value: 'inventory', label: 'Inventory and Catalog Reports' },
    { value: 'member', label: 'Member Activity Reports' },
    { value: 'reservation', label: 'Reservation and Availability Reports' },
    { value: 'financial', label: 'Financial Reports' },
  ];

  const handleGenerateReport = (values: any) => {
    // Logic to generate or fetch the report from the backend can be added here
  };
  const dialog = useBoolean();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Library Reports"
        links={[{ name: 'Library' }, { name: 'Reports' }]}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          handleGenerateReport(values);
        }}
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form>
            <Card sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Field as={FormControl} error={touched.report && errors.report} fullWidth>
                    <CustomSelect
                      label="Select Report Type"
                      name="report"
                      options={reportOptions}
                      value={values.report}
                      onChange={(value) => setFieldValue('report', value)}
                    />
                    <FormHelperText>{touched.report && errors.report}</FormHelperText>
                  </Field>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Field as={FormControl} error={touched.startDate && errors.startDate} fullWidth>
                    <DatePicker
                      label="Start Date"
                      value={values.startDate}
                      onChange={(date) => setFieldValue('startDate', date)}
                      format="DD-MM-YYYY"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                    <FormHelperText>{touched.startDate && errors.startDate}</FormHelperText>
                  </Field>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Field as={FormControl} error={touched.endDate && errors.endDate} fullWidth>
                    <DatePicker
                      label="End Date"
                      value={values.endDate}
                      onChange={(date) => setFieldValue('endDate', date)}
                      format="DD-MM-YYYY"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                    <FormHelperText>{touched.endDate && errors.endDate}</FormHelperText>
                  </Field>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    label="Standard"
                    name="category"
                    options={[]}
                    value={values.category}
                    onChange={(value) => setFieldValue('category', value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    label="Division"
                    name="category"
                    options={[]}
                    value={values.category}
                    onChange={(value) => setFieldValue('category', value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Autocomplete
                    loading={false}
                    noOptionsText="No Student Found"
                    fullWidth
                    onChange={(e, value: any) => {}}
                    options={[]}
                    getOptionLabel={(option: any) => `${option.name} (${option.role})`} // Use the formatted label
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Student Name"
                        placeholder="Search Student Name"
                        fullWidth
                        disabled
                      />
                    )}
                    renderOption={(prop: any, option: any) => (
                      <li {...prop} key={option.id}>
                        {option.name} ({option.role}) {/* Display formatted name and role */}
                      </li>
                    )}
                  />
                </Grid>

                {(values.report === 'inventory' || values.report === 'circulation') && (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Field as={FormControl} fullWidth>
                      <CustomSelect
                        label="Book Category"
                        name="category"
                        options={categoryOptions}
                        value={values.category}
                        onChange={(value) => setFieldValue('category', value)}
                      />
                    </Field>
                  </Grid>
                )}

                {(values.report === 'inventory' || values.report === 'reservation') && (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Field as={FormControl} fullWidth>
                      <CustomSelect
                        label="Year"
                        name="year"
                        options={yearOptions}
                        value={values.year}
                        onChange={(value) => setFieldValue('year', value)}
                      />
                    </Field>
                  </Grid>
                )}
              </Grid>
              <Box pt="20px" />
              <Grid size={12} justifyContent="flex-end" display="flex" gap={3}>
                <Button
                  startIcon={<Iconify icon="ion:download" />}
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: (theme) =>
                      varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: (theme) =>
                        varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
                    },
                  }}
                >
                  Download PDF
                </Button>

                <Button
                  startIcon={<Iconify icon="ion:download" />}
                  variant="contained"
                  color="warning"
                  sx={{
                    backgroundColor: (theme) =>
                      varAlpha(theme.vars.palette.warning.mainChannel, 0.1),
                    color: 'warning.main',
                    '&:hover': {
                      backgroundColor: (theme) =>
                        varAlpha(theme.vars.palette.warning.mainChannel, 0.1),
                    },
                  }}
                >
                  Download Excel
                </Button>
                <Button
                  startIcon={<Iconify icon="ion:print" />}
                  variant="contained"
                  color="secondary"
                  sx={{
                    backgroundColor: (theme) =>
                      varAlpha(theme.vars.palette.secondary.mainChannel, 0.1),
                    color: 'secondary.main',
                    '&:hover': {
                      backgroundColor: (theme) =>
                        varAlpha(theme.vars.palette.secondary.mainChannel, 0.1),
                    },
                  }}
                >
                  Generate Report
                </Button>
                <Button
                  onClick={dialog.onTrue}
                  startIcon={<Iconify icon="ion:download" />}
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: (theme) =>
                      varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: (theme) =>
                        varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
                    },
                  }}
                >
                  Scheduled Report
                </Button>
              </Grid>
            </Card>
          </Form>
        )}
      </Formik>
      <CustomDialog title="Schedule Report" open={dialog.value} handleClose={dialog.onFalse}>
        <ScheduledReportsFrom handleClose={dialog.onFalse} />
      </CustomDialog>
    </Box>
  );
};
const ScheduledReportsFrom = ({ handleClose }: { handleClose: () => void }) => {
  const { values, handleChange, setFieldValue, handleSubmit } = useFormik({
    initialValues: {
      date: null,
      name: '',
      timeDuration: '',
      notificationType: '',
      active: false,
      weekday: 'monday',
    },
    onSubmit: () => {},
  });
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={2}>
          <TextField label="Name" value={values.name} onChange={handleChange} size="small" />
          <CustomSelect
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
            label="Time Duration"
            value={values.timeDuration}
            onChange={(val) => setFieldValue('timeDuration', val)}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset', width: '100%' } }}
          />
          {values.timeDuration === 'daily' && (
            <TimePicker
              value={values.date}
              onChange={(val) => setFieldValue('date', val)}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              slotProps={{ textField: { size: 'small' } }}
            />
          )}
          {values.timeDuration === 'weekly' && (
            <FormControl>
              <FormLabel>Select Day</FormLabel>
              <RadioGroup
                row
                value={values.weekday}
                onChange={(e) => setFieldValue('weekday', e.target.value)}
              >
                <FormControlLabel value="monday" control={<Radio />} label="Monday" />
                <FormControlLabel value="tuesday" control={<Radio />} label="Tuesday" />
                <FormControlLabel value="wednesday" control={<Radio />} label="Wednesday" />
                <FormControlLabel value="thursday" control={<Radio />} label="Thursday" />
                <FormControlLabel value="friday" control={<Radio />} label="Friday" />
                <FormControlLabel value="saturday" control={<Radio />} label="Saturday" />
                <FormControlLabel value="sunday" control={<Radio />} label="Sunday" />
              </RadioGroup>
            </FormControl>
          )}
          {values.timeDuration === 'monthly' && (
            <DatePicker
              value={values.date}
              onChange={(val) => setFieldValue('date', val)}
              label="Date"
              slotProps={{ textField: { size: 'small' } }}
            />
          )}

          <CustomSelect
            options={[
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
              { value: 'both', label: 'Both' },
            ]}
            label="Notification Type"
            value={values.notificationType}
            onChange={(val) => setFieldValue('notificationType', val)}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset', width: '100%' } }}
          />
          <Box display="flex" alignItems="center">
            <Switch
              checked={values.active}
              onChange={(e) => setFieldValue('active', e.target.checked)}
            />
            <Typography component="span">Enable</Typography>
          </Box>
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" type="submit">
          Save
        </Button>
      </DialogActions>
    </Box>
  );
};

export default LibraryReportsScreen;
