import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, TextField } from '@mui/material';

interface AcademicYearSetupProps {
  values: any;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
}

const AcademicYearSetup: React.FC<AcademicYearSetupProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}) => (
  <Box sx={{ mt: 2, width: '100%' }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <TextField
          size="small"
          fullWidth
          name="academicYear.name"
          label="Academic Year Name"
          value={values.academicYear.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.academicYear?.name && Boolean(errors.academicYear?.name)}
          helperText={touched.academicYear?.name && errors.academicYear?.name}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <DatePicker
          label="Start Date"
          value={values.academicYear.startDate ? values.academicYear.startDate : null}
          onChange={(newValue) => setFieldValue('academicYear.startDate', newValue)}
          format="DD-MM-YYYY"
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              name: 'academicYear.startDate',
              error: touched.academicYear?.startDate && Boolean(errors.academicYear?.startDate),
              helperText: touched.academicYear?.startDate && errors.academicYear?.startDate,
              onBlur: handleBlur,
            },
          }}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <DatePicker
          label="End Date"
          format="DD-MM-YYYY"
          value={values.academicYear.endDate ? values.academicYear.endDate : null}
          onChange={(newValue) => setFieldValue('academicYear.endDate', newValue)}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              name: 'academicYear.endDate',
              error: touched.academicYear?.endDate && Boolean(errors.academicYear?.endDate),
              helperText: touched.academicYear?.endDate && errors.academicYear?.endDate,
              onBlur: handleBlur,
            },
          }}
        />
      </Grid>
    </Grid>
  </Box>
);

export default AcademicYearSetup;
