'use client';

import React from 'react';
import * as Yup from 'yup';
import { Form, Field, Formik } from 'formik';
import { Grid, Button, TextField, Typography } from '@mui/material';

interface StudentFormValues {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  major: string;
  gpa: string;
  gender: string;
  nationality: string;
  emergencyContact: string;
  emergencyPhone: string;
  enrollmentDate: string;
  expectedGraduationDate: string;
  currentYear: string;
  currentSemester: string;
}

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  studentId: Yup.string().required('Student ID is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zipCode: Yup.string().required('Zip code is required'),
  major: Yup.string().required('Major is required'),
  gpa: Yup.number().min(0).max(4).required('GPA is required'),
  gender: Yup.string().required('Gender is required'),
  nationality: Yup.string().required('Nationality is required'),
  emergencyContact: Yup.string().required('Emergency contact is required'),
  emergencyPhone: Yup.string().required('Emergency phone is required'),
  enrollmentDate: Yup.date().required('Enrollment date is required'),
  expectedGraduationDate: Yup.date().required('Expected graduation date is required'),
  currentYear: Yup.string().required('Current year is required'),
  currentSemester: Yup.string().required('Current semester is required'),
});

const initialValues: StudentFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  studentId: '',
  dateOfBirth: '',
  phoneNumber: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  major: '',
  gpa: '',
  gender: '',
  nationality: '',
  emergencyContact: '',
  emergencyPhone: '',
  enrollmentDate: '',
  expectedGraduationDate: '',
  currentYear: '',
  currentSemester: '',
};

const StudentForm: React.FC = () => {
  const handleSubmit = (values: StudentFormValues, { setSubmitting }: any) => {
    // Handle form submission here
    console.log(values);
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h4" textAlign="center">
                Student Form
              </Typography>
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="firstName"
                label="First Name"
                error={touched.firstName && errors.firstName}
                helperText={touched.firstName && errors.firstName}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="lastName"
                label="Last Name"
                error={touched.lastName && errors.lastName}
                helperText={touched.lastName && errors.lastName}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="email"
                label="Email"
                error={touched.email && errors.email}
                helperText={touched.email && errors.email}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="studentId"
                label="Student ID"
                error={touched.studentId && errors.studentId}
                helperText={touched.studentId && errors.studentId}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={touched.dateOfBirth && errors.dateOfBirth}
                helperText={touched.dateOfBirth && errors.dateOfBirth}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="phoneNumber"
                label="Phone Number"
                error={touched.phoneNumber && errors.phoneNumber}
                helperText={touched.phoneNumber && errors.phoneNumber}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="address"
                label="Address"
                error={touched.address && errors.address}
                helperText={touched.address && errors.address}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="city"
                label="City"
                error={touched.city && errors.city}
                helperText={touched.city && errors.city}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="state"
                label="State"
                error={touched.state && errors.state}
                helperText={touched.state && errors.state}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="zipCode"
                label="Zip Code"
                error={touched.zipCode && errors.zipCode}
                helperText={touched.zipCode && errors.zipCode}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="major"
                label="Major"
                error={touched.major && errors.major}
                helperText={touched.major && errors.major}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="gpa"
                label="GPA"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 4 }}
                error={touched.gpa && errors.gpa}
                helperText={touched.gpa && errors.gpa}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="gender"
                label="Gender"
                error={touched.gender && errors.gender}
                helperText={touched.gender && errors.gender}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="nationality"
                label="Nationality"
                error={touched.nationality && errors.nationality}
                helperText={touched.nationality && errors.nationality}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="emergencyContact"
                label="Emergency Contact"
                error={touched.emergencyContact && errors.emergencyContact}
                helperText={touched.emergencyContact && errors.emergencyContact}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="emergencyPhone"
                label="Emergency Phone"
                error={touched.emergencyPhone && errors.emergencyPhone}
                helperText={touched.emergencyPhone && errors.emergencyPhone}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="enrollmentDate"
                label="Enrollment Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={touched.enrollmentDate && errors.enrollmentDate}
                helperText={touched.enrollmentDate && errors.enrollmentDate}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="expectedGraduationDate"
                label="Expected Graduation Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={touched.expectedGraduationDate && errors.expectedGraduationDate}
                helperText={touched.expectedGraduationDate && errors.expectedGraduationDate}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="currentYear"
                label="Current Year"
                error={touched.currentYear && errors.currentYear}
                helperText={touched.currentYear && errors.currentYear}
              />
            </Grid>
            <Grid size={4}>
              <Field
                as={TextField}
                fullWidth
                size="small"
                name="currentSemester"
                label="Current Semester"
                error={touched.currentSemester && errors.currentSemester}
                helperText={touched.currentSemester && errors.currentSemester}
              />
            </Grid>
            <Grid size={12} display="flex" justifyContent="end">
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default StudentForm;
