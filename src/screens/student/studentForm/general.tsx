import type { Dayjs } from 'dayjs';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, TextField, Typography } from '@mui/material';

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  studentId: Yup.string().required('Student ID is required'),
});

const StudentGeneralForm = () => {
  const fields = useMemo(
    () => [
      { id: 'firstName', name: 'firstName', label: 'First Name', type: 'text', xs: 12, sm: 6 },
      { id: 'lastName', name: 'lastName', label: 'Last Name', type: 'text', xs: 12, sm: 6 },
      { id: 'email', name: 'email', label: 'Email Address', type: 'text', xs: 12 },
      {
        id: 'dateOfBirth',
        name: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        xs: 12,
        sm: 6,
      },
      { id: 'studentId', name: 'studentId', label: 'Student ID', type: 'text', xs: 12, sm: 6 },
    ],
    []
  );
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: null,
      studentId: '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      // Handle form submission
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Student General Information
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {fields.map((field) => (
          <Box maxWidth="320px" key={field.id} width="100%">
            {field.type === 'date' ? (
              <DatePicker
                label={field.label}
                value={formik.values[field.name as keyof typeof formik.values] as Dayjs | null}
                onChange={(value) => formik.setFieldValue(field.name, value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error:
                      formik.touched[field.name as keyof typeof formik.touched] &&
                      Boolean(formik.errors[field.name as keyof typeof formik.errors]),
                    helperText:
                      formik.touched[field.name as keyof typeof formik.touched] &&
                      (formik.errors[field.name as keyof typeof formik.errors] as string),
                    size: 'small',
                    disabled: true,
                  },
                }}
                disabled
              />
            ) : (
              <TextField
                fullWidth
                label={field.label}
                name={field.name}
                size="small"
                type={field.type || 'text'}
                value={formik.values[field.name as keyof typeof formik.values]}
                onChange={formik.handleChange}
                error={
                  formik.touched[field.name as keyof typeof formik.touched] &&
                  Boolean(formik.errors[field.name as keyof typeof formik.errors])
                }
                helperText={
                  formik.touched[field.name as keyof typeof formik.touched] &&
                  (formik.errors[field.name as keyof typeof formik.errors] as string)
                }
                disabled
              />
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default StudentGeneralForm;
