import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Grid, TextField, Autocomplete } from '@mui/material';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function DeductionReport() {
  const { employees, deductionComponents } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      employees: [],
      deductionTypes: [],
      month: null,
    },
    validationSchema: Yup.object({
      employees: Yup.array().min(1, 'At least one employee is required'),
      deductionTypes: Yup.array().min(1, 'At least one deduction type is required'),
      month: Yup.date().required('Month is required').nullable(),
    }),
    onSubmit: (values) => {
      console.info('Generate Deduction Report', values);
    },
  });

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            multiple
            size="small"
            options={employees}
            getOptionLabel={(option: any) =>
              `${option.firstName} ${option.lastName} (${option.employeeCode})`
            }
            value={formik.values.employees}
            onChange={(_, newValue) => formik.setFieldValue('employees', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Employees *"
                error={formik.touched.employees && Boolean(formik.errors.employees)}
                helperText={formik.touched.employees && (formik.errors.employees as string)}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            multiple
            size="small"
            options={deductionComponents}
            value={formik.values.deductionTypes}
            onChange={(_, newValue) => formik.setFieldValue('deductionTypes', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Deduction Types *"
                error={formik.touched.deductionTypes && Boolean(formik.errors.deductionTypes)}
                helperText={
                  formik.touched.deductionTypes && (formik.errors.deductionTypes as string)
                }
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DatePicker
            label="Select Month"
            minDate={dayjs(currentYear?.startDate)}
            maxDate={dayjs(currentYear?.endDate)}
            views={['month', 'year']}
            value={formik.values.month}
            onChange={(newValue) => formik.setFieldValue('month', newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: formik.touched.month && Boolean(formik.errors.month),
                helperText: formik.touched.month && (formik.errors.month as string),
              },
            }}
          />
        </Grid>
      </Grid>
    </ReportForm>
  );
}
