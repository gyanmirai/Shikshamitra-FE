'use client';

// @ts-nocheck

import type { FormikValues } from 'formik';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, Card, Stack, Divider, TextField, Typography } from '@mui/material';

import { fData } from 'src/utils/format-number';

import { useAddTenantMutation } from 'src/redux/tenant/tenantApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { UploadAvatar } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import { useStandardAddress } from 'src/components/stardard-address';

interface FormValues {
  instituteName: string;
  instituteLogo: File | null;
  instituteBanner: File | null;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
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
  instituteBanner: Yup.mixed()
    .required('Institute Banner is required')
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
  addressLine1: Yup.string().required('Address Line 1 is required'),
  addressLine2: Yup.string().required('Address Line 2 is required'),
  addressLine3: Yup.string().required('Address Line 3 is required'),
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
  const { RenderCountry, RenderState, RenderCity } = useStandardAddress();
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
        instituteBanner: null,
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
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
    <Scrollbar sx={{ height: 'calc(100vh - 150px)', overflow: 'auto' }}>
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            zIndex: 10,
            py: 2,
          }}
        >
          <Typography variant="h5" sx={{ mb: 1 }}>
            Basic Information
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {/* @ts-ignore */}
          <Grid xs={12} md={6}>
            <Card sx={{ pt: 10, pb: 5, px: 3 }}>
              <Box sx={{ mb: 5 }}>
                <UploadAvatar
                  // name="avatarUrl"
                  title="Upload Institute Logo"
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

          <Grid xs={12} md={6}>
            <Card sx={{ pt: 10, pb: 5, px: 3 }}>
              <Box sx={{ mb: 5 }}>
                <UploadAvatar
                  // name="avatarUrl"
                  title="Upload Institute Banner"
                  maxSize={3145728}
                  onDrop={(acceptedFiles: File[]) => {
                    const value = acceptedFiles[0];
                    setFieldValue('instituteBanner', value);
                  }}
                  value={values.instituteBanner}
                  error={touched.instituteBanner && Boolean(errors.instituteBanner)}
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

          <Grid xs={12}>
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
                    size="small"
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
                    size="small"
                    name="addressLine1"
                    label="Address Line 1"
                    value={values.addressLine1}
                    onChange={handleChange}
                    error={touched.addressLine1 && Boolean(errors.addressLine1)}
                    helperText={touched.addressLine1 && errors.addressLine1}
                  />
                </Grid>
                <Grid xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="addressLine2"
                    label="Address Line 2"
                    value={values.addressLine2}
                    onChange={handleChange}
                    error={touched.addressLine2 && Boolean(errors.addressLine2)}
                    helperText={touched.addressLine2 && errors.addressLine2}
                  />
                </Grid>
                <Grid xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="addressLine3"
                    label="Address Line 3"
                    value={values.addressLine3}
                    onChange={handleChange}
                    error={touched.addressLine3 && Boolean(errors.addressLine3)}
                    helperText={touched.addressLine3 && errors.addressLine3}
                  />
                </Grid>
                <Grid xs={4}>
                  <RenderCountry
                    onChange={(_e, value) => {
                      setFieldValue('stateProvince', null);
                      setFieldValue('country', value);
                    }}
                    size="small"
                    // fieldProps={{ size: 'small' }}
                  />
                </Grid>
                <Grid xs={4}>
                  <RenderState
                    onChange={(_e, value) => {
                      setFieldValue('city', null);
                      setFieldValue('stateProvince', value);
                    }}
                  />
                </Grid>
                <Grid xs={4}>
                  <RenderCity onChange={(_e, value) => setFieldValue('city', value)} />
                </Grid>
                <Grid xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="zipPostalCode"
                    label="ZIP/Postal Code"
                    value={values.zipPostalCode}
                    onChange={handleChange}
                    type="number"
                    error={touched.zipPostalCode && Boolean(errors.zipPostalCode)}
                    helperText={touched.zipPostalCode && errors.zipPostalCode}
                  />
                </Grid>

                <Grid xs={4}>
                  <PhoneInput
                    name="contactNumber"
                    value={values.contactNumber}
                    onChange={(value) => {
                      setFieldValue('contactNumber', value);
                    }}
                    placeholder="Contact No."
                    error={touched.contactNumber && Boolean(errors.contactNumber)}
                    helperText={touched.contactNumber && errors.contactNumber}
                    variant="outlined"
                    label="Contact No."
                    size="small"
                  />
                </Grid>
                <Grid xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="emailAddress"
                    label="Email Address"
                    value={values.emailAddress}
                    onChange={handleChange}
                    error={touched.emailAddress && Boolean(errors.emailAddress)}
                    helperText={touched.emailAddress && errors.emailAddress}
                    autoComplete="off"
                    InputProps={{
                      startAdornment: (
                        <>
                          <Iconify icon="mdi-light:email" />{' '}
                          <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                        </>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={4}>
                  <TextField
                    fullWidth
                    size="small"
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
            </Card>
          </Grid>
        </Grid>

        <Stack
          alignItems="flex-end"
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 10,
            py: 2,
            textAlign: 'right',
          }}
        >
          <LoadingButton type="submit" variant="contained" loading={isLoading}>
            Save changes
          </LoadingButton>
        </Stack>
      </form>
    </Scrollbar>
  );
};
export default BasicInformationForm;
