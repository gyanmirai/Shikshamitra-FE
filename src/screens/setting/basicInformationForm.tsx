'use client';

// @ts-nocheck

import type { FormikValues } from 'formik';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, Card, Stack, TextField, Typography } from '@mui/material';

import { fData } from 'src/utils/format-number';

import { useAddTenantMutation } from 'src/redux/tenant/tenantApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { UploadAvatar } from 'src/components/upload';

interface FormValues {
  instituteName: string;
  instituteLogo: File | null;
  address: string;
  city: string;
  stateProvince: string;
  zipPostalCode: string;
  country: string;
  contactNumber: string;
  emailAddress: string;
  password: string;
}

const validationSchema = Yup.object().shape({
  instituteName: Yup.string()
    .required('Institute Name is required')
    .min(2, 'Institute Name must be at least 2 characters')
    .max(100, 'Institute Name must not exceed 100 characters'),
  instituteLogo: Yup.mixed()
    .required('Institute Logo is required')
    .test(
      'fileType',
      'Unsupported file format',
      (value: any) =>
        value &&
        value instanceof File &&
        ['image/jpeg', 'image/png', 'image/gif'].includes(value.type)
    )
    .test(
      'fileSize',
      'File size is too large',
      (value: any) => value && value instanceof File && value.size <= 5 * 1024 * 1024 // 5MB
    ),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  stateProvince: Yup.string().required('State/Province is required'),
  zipPostalCode: Yup.string()
    .required('ZIP/Postal Code is required')
    .matches(/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid ZIP/Postal Code format'),
  country: Yup.string().required('Country is required'),
  contactNumber: Yup.string()
    .required('Contact Number is required')
    .matches(
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      'Invalid phone number format'
    ),
  emailAddress: Yup.string().required('Email Address is required').email('Invalid email format'),
});

const BasicInformationForm: React.FC<any> = () => {
  const [addTenant, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddTenantMutation,
    popupConfig: {
      success: true,
      successMessage: 'Tenant Added Successfully',
    },
  });
  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } =
    useFormik<FormValues>({
      initialValues: {
        instituteName: '',
        instituteLogo: null,
        address: '',
        city: '',
        stateProvince: '',
        zipPostalCode: '',
        country: '',
        contactNumber: '',
        emailAddress: '',
        password: '',
      },
      validationSchema,
      onSubmit: (formValues: FormikValues) => {
        console.log(formValues);
        addTenant({
          name: formValues.instituteName,
          adminEmailAddress: formValues.emailAddress,
          adminPassword: formValues.password,
        });
      },
    });
  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Basic Information
      </Typography>
      <Grid container spacing={2}>
        {/* @ts-ignore */}
        <Grid xs={12} sm={3.5} md={3.5}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            <Box sx={{ mb: 5 }}>
              <UploadAvatar
                //   name="avatarUrl"
                maxSize={3145728}
                onDrop={(acceptedFiles: File[]) => {
                  const value = acceptedFiles[0];
                  setFieldValue('instituteLogo', value);
                }}
                value={values.instituteLogo}
                error={touched.instituteLogo && Boolean(errors.instituteLogo)}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>
          </Card>
        </Grid>

        <Grid xs={12} sm={8.5} md={8.5}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Grid container spacing={3}>
              <Grid xs={4}>
                <TextField
                  fullWidth
                  size="medium"
                  name="instituteName"
                  label="Institute Name"
                  value={values.instituteName}
                  onChange={handleChange}
                  error={touched.instituteName && Boolean(errors.instituteName)}
                  helperText={touched.instituteName && errors.instituteName}
                />
              </Grid>
              <Grid xs={4}>
                <TextField
                  fullWidth
                  size="medium"
                  name="address"
                  label="Address"
                  value={values.address}
                  onChange={handleChange}
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                />
              </Grid>
              <Grid xs={4}>
                <TextField
                  fullWidth
                  size="medium"
                  name="city"
                  label="City"
                  value={values.city}
                  onChange={handleChange}
                  error={touched.city && Boolean(errors.city)}
                  helperText={touched.city && errors.city}
                />
              </Grid>
              <Grid xs={4}>
                <TextField
                  fullWidth
                  size="medium"
                  name="stateProvince"
                  label="State/Province"
                  value={values.stateProvince}
                  onChange={handleChange}
                  error={touched.stateProvince && Boolean(errors.stateProvince)}
                  helperText={touched.stateProvince && errors.stateProvince}
                />
              </Grid>
              <Grid xs={4}>
                <TextField
                  fullWidth
                  size="medium"
                  name="zipPostalCode"
                  label="ZIP/Postal Code"
                  value={values.zipPostalCode}
                  onChange={handleChange}
                  error={touched.zipPostalCode && Boolean(errors.zipPostalCode)}
                  helperText={touched.zipPostalCode && errors.zipPostalCode}
                />
              </Grid>
              <Grid xs={4}>
                <TextField
                  fullWidth
                  size="medium"
                  name="country"
                  label="Country"
                  value={values.country}
                  onChange={handleChange}
                  error={touched.country && Boolean(errors.country)}
                  helperText={touched.country && errors.country}
                />
              </Grid>
              <Grid xs={4}>
                <TextField
                  fullWidth
                  size="medium"
                  name="contactNumber"
                  label="Contact Number"
                  value={values.contactNumber}
                  onChange={handleChange}
                  error={touched.contactNumber && Boolean(errors.contactNumber)}
                  helperText={touched.contactNumber && errors.contactNumber}
                />
              </Grid>
              <Grid xs={4}>
                <TextField
                  fullWidth
                  size="medium"
                  name="emailAddress"
                  label="Email Address"
                  value={values.emailAddress}
                  onChange={handleChange}
                  error={touched.emailAddress && Boolean(errors.emailAddress)}
                  helperText={touched.emailAddress && errors.emailAddress}
                  autoComplete="off"
                />
              </Grid>
              <Grid xs={4}>
                <TextField
                  fullWidth
                  size="medium"
                  name="password"
                  label="Password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  autoComplete="off"
                />
              </Grid>
            </Grid>

            <Stack alignItems="flex-end" sx={{ mt: 3, height: '100%', justifyContent: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isLoading}>
                Save changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </form>
  );
};
export default BasicInformationForm;
