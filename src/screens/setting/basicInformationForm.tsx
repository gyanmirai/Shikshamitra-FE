'use client';

// @ts-nocheck

import type { FormikValues } from 'formik';
import type { ICity, IState, ICountry } from 'country-state-city';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  List,
  Card,
  Stack,
  Button,
  Divider,
  ListItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAddTenantMutation } from 'src/redux/tenant/tenantApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { EmptyContent } from 'src/components/empty-content';
import { RemoveButton } from 'src/components/file-thumbnail';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import { fileThumbnailClasses } from 'src/components/file-thumbnail/classes';
import CountryComponent from 'src/components/stardard-address/country-component';

interface FormValues {
  instituteName: string;
  instituteLogo: string[];
  instituteBanner: string[];
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city?: Partial<ICity>;
  stateProvince?: Partial<IState>;
  zipPostalCode: string;
  country?: Partial<ICountry>;
  contactNumber: string;
  emailAddress: string;
  password: string;
  principleSign: string[];
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
  const [addTenant, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddTenantMutation,
    popupConfig: {
      success: true,
      successMessage: 'Tenant Added Successfully',
    },
  });
  const formik = useFormik<FormValues>({
    initialValues: {
      instituteName: '',
      instituteLogo: [],
      instituteBanner: [],
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      city: undefined,
      stateProvince: undefined,
      zipPostalCode: '',
      country: undefined,
      contactNumber: '',
      emailAddress: '',
      password: '',
      principleSign: [],
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
  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } = formik;
  return (
    <Box
      component="form"
      sx={{ height: 'calc(100% - 74px)', display: 'flex', flexDirection: 'column' }}
      onSubmit={handleSubmit}
    >
      <Scrollbar
        sx={{
          p: 2,
          height: '100%',
        }}
      >
        <Grid container spacing={2}>
          {/* <Grid xs={12} sm={6} md={4}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardHeader title="Upload Institute Logo" sx={{ textAlign: 'center' }} />
            <Upload
              multiple
              accept={{ 'image/*': [] }}
              thumbnail
              value={values.instituteLogo}
              onDrop={(acceptedFiles) => {
                const files = acceptedFiles;
                const promises = files.map(
                  (file) =>
                    new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = () => resolve(reader.result);
                    })
                );
                Promise.all(promises).then((base64Strings) => {
                  setFieldValue('instituteLogo', base64Strings);
                });
              }}
              onRemove={(file) => {
                setFieldValue(
                  'instituteLogo',
                  values.instituteLogo.filter((uploadFile) => file !== uploadFile)
                );
              }}
              onRemoveAll={() => {
                setFieldValue('instituteLogo', []);
              }}
              sx={{
                '&>div': {
                  bgcolor: 'unset',
                  border: 'none',
                  boxShadow: 'none',
                },
              }}
            />
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardHeader title="Upload Institute Banner" sx={{ textAlign: 'center' }} />
            <CardContent>
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
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardHeader title="Principle sign" sx={{ textAlign: 'center' }} />
            <UploadAvatar
              // name="avatarUrl"
              title="Principle sign"
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
          </Card>
        </Grid> */}

          <Grid xs={12}>
            <Box>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6} md={4} lg={3}>
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
                <Grid xs={12} sm={6} md={4} lg={3}>
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
                <Grid xs={12} sm={6} md={4} lg={3}>
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
                <Grid xs={12} sm={6} md={4} lg={3}>
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
                <Grid xs={12} sm={6} md={4} lg={3}>
                  <CountryComponent
                    onChange={(_e, value) => {
                      setFieldValue('stateProvince', null);
                      setFieldValue('country', value);
                    }}
                    size="small"
                    value={values.country}
                    fullWidth
                    // fieldProps={{ size: 'small' }}
                  />
                </Grid>
                <Grid xs={12} sm={6} md={4} lg={3}>
                  <StateComponent
                    onChange={(_e, value) => {
                      setFieldValue('city', null);
                      setFieldValue('stateProvince', value);
                    }}
                    value={values.stateProvince}
                    countryValue={values.country}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={6} md={4} lg={3}>
                  <CityComponent
                    value={values.city}
                    onChange={(_e, value) => setFieldValue('city', value)}
                    stateValue={values.stateProvince}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={6} md={4} lg={3}>
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

                <Grid xs={12} sm={6} md={4} lg={3}>
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
                <Grid xs={12} sm={6} md={4} lg={3}>
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
                <Grid xs={12} sm={6} md={4} lg={3}>
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
            </Box>
          </Grid>
          <Grid xs={12}>
            <BasicInformationAssets
              formik={formik}
              name="instituteLogo"
              title="Upload Institute Logo"
            />
          </Grid>
          <Grid xs={12}>
            <BasicInformationAssets
              formik={formik}
              name="instituteBanner"
              title="Upload Institute Banner"
            />
          </Grid>
          <Grid xs={12}>
            <BasicInformationAssets
              formik={formik}
              name="principleSign"
              title="Upload Principle Sign"
            />
          </Grid>
        </Grid>
      </Scrollbar>

      <DialogActions sx={{ flexShrink: 0, p: 2 }}>
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
      </DialogActions>
    </Box>
  );
};

const BasicInformation = () => {
  const form = useBoolean();
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Basic Information"
        links={[{ name: 'Institute Setup' }, { name: 'Basic Information' }]}
        sx={{ px: 1 }}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={form.value ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            onClick={form.onToggle}
          >
            {form.value ? 'Back' : 'Institute'}
          </Button>
        }
      />
      {form.value ? (
        <BasicInformationForm />
      ) : (
        <CustomizableTable
          tableId="institute-setup"
          columns={[
            { label: 'Institute Name', id: 'instituteName' },
            { label: 'Institute Logo', id: 'instituteLogo' },
            { label: 'Institute Banner', id: 'instituteBanner' },
            { label: 'Principle Sign', id: 'principleSign' },
            { label: 'Address', id: 'address' },
            { label: 'Country', id: 'country' },
            { label: 'State', id: 'state' },
            { label: 'City', id: 'city' },
            { label: 'ZIP/Postal Code', id: 'pincode' },
            { label: 'Contact Number', id: 'contactNumber' },
            { label: 'Email Address', id: 'emailAddress' },
            { label: 'Action', id: 'action', sticky: true },
          ]}
          data={[]}
        />
      )}
    </Box>
  );
};
export default BasicInformation;

const BasicInformationAssets = ({ formik, name, title }: any) => {
  const priviewDialog = useBoolean();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  return (
    <Card sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 1 }}>
      <Box>
        <Typography variant="body1" fontWeight={600}>
          {title}
        </Typography>
        <Upload
          multiple
          isPreview={false}
          accept={{ 'image/*': [] }}
          thumbnail
          value={formik.values[name]}
          onDrop={async (acceptedFiles) => {
            const base64StringArray = await Promise.all(
              acceptedFiles.map(
                async (file) =>
                  new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                      resolve(reader.result);
                    };
                  })
              )
            );
            formik.setFieldValue(name, base64StringArray);
          }}
          onRemove={(file) => {}}
          onRemoveAll={() => {}}
          sx={{
            '& svg': {
              height: '110px',
            },
            '& > div': {
              p: 2,
            },
          }}
        />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1" fontWeight={600}>
          Preview
        </Typography>
        {formik.values?.[name]?.length ? (
          <List sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {formik.values?.[name]?.map((image: string, index: number) => (
              <ListItem key={index} sx={{ width: 'auto', p: 0 }}>
                <Card sx={{ p: 1, position: 'relative' }} elevation={3}>
                  <RemoveButton
                    onClick={() => {
                      const newLogos = formik.values[name].filter(
                        (_: string, i: number) => i !== index
                      );
                      formik.setFieldValue(name, newLogos);
                    }}
                    className={fileThumbnailClasses.removeBtn}
                    sx={{ zIndex: 2 }}
                  />

                  <Button
                    onClick={() => {
                      setPreviewImage(image);
                      priviewDialog.onTrue();
                    }}
                    style={{ border: 'none', padding: 0, background: 'none', cursor: 'pointer' }}
                  >
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      style={{ height: '100px', width: 'auto', zIndex: 1 }}
                    />
                  </Button>
                </Card>
              </ListItem>
            ))}
          </List>
        ) : (
          <EmptyContent
            title="Please upload images"
            slotProps={{ title: { fontSize: '14px !important' } }}
          />
        )}
      </Box>

      <CustomDialog
        maxWidth="md"
        open={priviewDialog.value}
        handleClose={priviewDialog.onFalse}
        title="Preview"
        paperProps={{
          sx: {
            height: '80vh',
          },
        }}
      >
        <Box width="100%" height="100%">
          <img
            src={previewImage as string}
            alt="Preview"
            style={{ height: '100%', width: '100%', objectFit: 'fill' }}
          />
        </Box>
      </CustomDialog>
    </Card>
  );
};
