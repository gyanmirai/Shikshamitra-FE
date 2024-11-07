'use client';

import type { Dayjs } from 'dayjs';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { Form, Field, Formik } from 'formik';

import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, MenuList, MenuItem, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CommunicationForm } from '../follow-up';

const dummyData = [
  {
    inquiryNumber: 'INQ001',
    organization: 'ABC School',
    batchName: 'Batch 2023',
    class: '10th Grade',
    studentName: 'John Doe',
    dateOfBirth: '2005-05-15',
    age: 18,
    dateOfInquiry: '2023-06-01',
    gender: 'Male',
    address: '123 Main St, City',
    parentsContactNo: '123-456-7890',
    alternateContact: '987-654-3210',
    previousSchool: 'XYZ High School',
    inquiryPreferences: 'Science Stream',
  },
  {
    inquiryNumber: 'INQ002',
    organization: 'XYZ Academy',
    batchName: 'Batch 2023',
    class: '11th Grade',
    studentName: 'Jane Smith',
    dateOfBirth: '2004-08-22',
    age: 19,
    dateOfInquiry: '2023-06-02',
    gender: 'Female',
    address: '456 Elm St, Town',
    parentsContactNo: '234-567-8901',
    alternateContact: '876-543-2109',
    previousSchool: 'PQR Secondary School',
    inquiryPreferences: 'Commerce Stream',
  },
  {
    inquiryNumber: 'INQ003',
    organization: 'LMN Institute',
    batchName: 'Batch 2023',
    class: '12th Grade',
    studentName: 'Mike Johnson',
    dateOfBirth: '2003-11-10',
    age: 20,
    dateOfInquiry: '2023-06-03',
    gender: 'Male',
    address: '789 Oak St, Village',
    parentsContactNo: '345-678-9012',
    alternateContact: '765-432-1098',
    previousSchool: 'DEF High School',
    inquiryPreferences: 'Arts Stream',
  },
];
const InquiryScreen = () => {
  const dialog = useBoolean();
  const followUpDialog = useBoolean();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Inquiry"
        links={[{ name: 'Student' }, { name: 'Inquiry' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
            Add New Inquiry
          </Button>
        }
      />
      <CustomDialog
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="Inquiry"
        paperProps={{
          sx: { maxWidth: '600px', width: '100%' },
        }}
      >
        <InquiryForm handleClose={dialog.onFalse} />
      </CustomDialog>

      <CustomizableTable
        columns={[
          { id: 'inquiryNumber', label: 'Enquiry Number', sticky: true },
          { id: 'organization', label: 'Organization' },
          { id: 'batchName', label: 'Batch Name' },
          { id: 'class', label: 'Class' },
          { id: 'studentName', label: 'Student Name' },
          { id: 'dateOfBirth', label: 'DOB' },
          { id: 'age', label: 'Age' },
          { id: 'dateOfInquiry', label: 'DOI' },
          { id: 'gender', label: 'Gender' },
          { id: 'address', label: 'Address' },
          { id: 'parentsContactNo', label: 'Parents Co. No.' },
          { id: 'alternateContact', label: 'Alternate Contact Details' },
          { id: 'previousSchool', label: 'Previous School' },
          { id: 'inquiryPreferences', label: 'Enquiry Preferences' },
          {
            id: 'actions',
            label: 'Actions',
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  actions={() => (
                    <MenuList>
                      <MenuItem>
                        <Iconify icon="mdi:arrow-right-circle" sx={{ mr: 2 }} />
                        Move To Registration
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          followUpDialog.onTrue();
                        }}
                      >
                        <Iconify icon="icon-park:follow-up-date-sort" sx={{ mr: 2 }} />
                        Follow Up
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={dummyData}
      />
      <CustomDialog
        open={followUpDialog.value}
        handleClose={followUpDialog.onFalse}
        title="Follow Up"
      >
        <CommunicationForm handleCloseDialog={followUpDialog.onFalse} />{' '}
      </CustomDialog>
    </Box>
  );
};

export default InquiryScreen;

const validationSchema = Yup.object().shape({
  inquiryNumber: Yup.string().required('Inquiry number is required'),
  organization: Yup.string().required('Organization is required'),
  academicYear: Yup.string().required('Academic Year is required'),
  class: Yup.string().required('Class is required'),
  lastName: Yup.string().required('Last name is required'),
  firstName: Yup.string().required('First name is required'),
  middleName: Yup.string(),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  age: Yup.number()
    .positive('Age must be positive')
    .integer('Age must be an integer')
    .required('Age is required'),
  dateOfInquiry: Yup.date().required('Date of inquiry is required'),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .required('Gender is required'),
  address: Yup.string().required('Address is required'),
  parentsContactNo: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(10, 'Must be at least 10 digits')
    .required('Parents contact number is required'),
  alternateContactDetails: Yup.string(),
  previousSchool: Yup.string(),
  inquiryPreferences: Yup.string(),
});

interface FormikValues {
  inquiryNumber: string;
  organization: string;
  academicYear: string;
  class: string;
  lastName: string;
  firstName: string;
  middleName: string;
  dateOfBirth: Dayjs | null;
  age: string;
  dateOfInquiry: Dayjs | null;
  gender: string;
  address: string;
  parentsContactNo: string;
  alternateContactDetails: string;
  previousSchool: string;
  inquiryPreferences: string;
  city: string;
  state: string;
  pinCode: string;
  medium: string;
}

const InquiryForm = ({ handleClose }: any) => {
  const initialValues = {
    inquiryNumber: '12345',
    organization: '',
    medium: '',
    academicYear: '',
    class: '',
    lastName: '',
    city: '',
    state: '',
    pinCode: '',
    firstName: '',
    middleName: '',
    dateOfBirth: null,
    age: '',
    dateOfInquiry: dayjs(new Date()),
    gender: '',
    address: '',
    parentsContactNo: '',
    alternateContactDetails: '',
    previousSchool: '',
    inquiryPreferences: '',
  };

  const handleSubmit = (
    values: FormikValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    // Handle form submission here
    console.log(values);
    setSubmitting(false);
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }
    return age.toString();
  };
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting, setFieldValue, values }) => (
        <Form>
          <Scrollbar
            sx={{
              p: 3,
              bgcolor: 'background.neutral',
              height: 'calc(100vh - 150px)',
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Field
                  as={TextField}
                  fullWidth
                  size="small"
                  name="inquiryNumber"
                  label="Enquiry Number"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <CustomSelect
                  name="medium"
                  label="Medium"
                  options={[]}
                  value={values.medium}
                  onChange={(value) => setFieldValue('medium', value)}
                  error={!!(touched.organization && errors.organization) || false}
                  helperText={(touched.organization && errors.organization) || ''}
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <CustomSelect
                  name="academicYear"
                  label="Academic Year"
                  options={[]}
                  value={values.academicYear}
                  onChange={(value) => setFieldValue('academicYear', value)}
                  error={!!(touched.academicYear && errors.academicYear) || false}
                  helperText={(touched.academicYear && errors.academicYear) || ''}
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomSelect
                  name="class"
                  label="Class"
                  options={[]}
                  value={values.class}
                  onChange={(value) => setFieldValue('class', value)}
                  error={!!(touched.class && errors.class) || false}
                  helperText={(touched.class && errors.class) || ''}
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  size="small"
                  name="previousSchool"
                  label="Previous School"
                  error={touched.previousSchool && errors.previousSchool}
                  helperText={touched.previousSchool && errors.previousSchool}
                />
              </Grid>
              <Grid item xs={4}>
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
              <Grid item xs={4}>
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
              <Grid item xs={4}>
                <Field
                  as={TextField}
                  fullWidth
                  size="small"
                  name="middleName"
                  label="Middle Name"
                  error={touched.middleName && errors.middleName}
                  helperText={touched.middleName && errors.middleName}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Date of Birth"
                  name="dateOfBirth"
                  value={values.dateOfBirth}
                  format="DD/MM/YYYY"
                  onChange={(newValue) => {
                    const date = newValue?.format();
                    if (date) {
                      const age = calculateAge(date);
                      setFieldValue('age', age);
                    }
                    setFieldValue('dateOfBirth', newValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      helperText: touched.dateOfBirth && (errors.dateOfBirth as string),
                      error: touched.dateOfBirth && Boolean(errors.dateOfBirth),
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  value={values.age}
                  fullWidth
                  size="small"
                  name="age"
                  label="Age"
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Date of Inquiry"
                  name="dateOfInquiry"
                  value={values.dateOfInquiry}
                  format="DD/MM/YYYY"
                  onChange={(newValue) => setFieldValue('dateOfInquiry', newValue)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      helperText: touched.dateOfInquiry && (errors.dateOfInquiry as string),
                      error: touched.dateOfInquiry && Boolean(errors.dateOfInquiry),
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Field
                  as={TextField}
                  select
                  fullWidth
                  size="small"
                  name="gender"
                  label="Gender"
                  error={touched.gender && errors.gender}
                  helperText={touched.gender && errors.gender}
                >
                  {/* Add gender options here */}
                </Field>
              </Grid>

              <Grid item xs={4}>
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
              <Grid item xs={4}>
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
              <Grid item xs={4}>
                <Field
                  as={TextField}
                  fullWidth
                  size="small"
                  name="pinCode"
                  label="Pincode"
                  error={touched.pinCode && errors.pinCode}
                  helperText={touched.pinCode && errors.pinCode}
                />
              </Grid>

              <Grid item xs={6}>
                <Field
                  as={TextField}
                  fullWidth
                  size="small"
                  name="parentsContactNo"
                  label="Parents Co. No."
                  error={touched.parentsContactNo && errors.parentsContactNo}
                  helperText={touched.parentsContactNo && errors.parentsContactNo}
                />
              </Grid>
              <Grid item xs={6}>
                <Field
                  as={TextField}
                  fullWidth
                  size="small"
                  name="alternateContactDetails"
                  label="Alternate Contact Details"
                  error={touched.alternateContactDetails && errors.alternateContactDetails}
                  helperText={touched.alternateContactDetails && errors.alternateContactDetails}
                />
              </Grid>

              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  size="small"
                  name="inquiryPreferences"
                  label="Enquiry Preferences"
                  multiline
                  rows={3}
                  error={touched.inquiryPreferences && errors.inquiryPreferences}
                  helperText={touched.inquiryPreferences && errors.inquiryPreferences}
                />
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions sx={{ flexShrink: 0 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  );
};
