import React from 'react';
import { capitalize } from 'lodash';

import { Box, Card, Grid, colors, Divider, TextField, Typography } from '@mui/material';

import { fileToBase64 } from 'src/utils/file-to-base64';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { UploadAvatar } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import { ComponentBlock } from 'src/components/component-block';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

const LogoSignature = ({ formik }: any) => (
  <Box>
    <Typography variant="h5" textAlign="center" mb={2}>
      Basic Information
    </Typography>
    <BasicInformationForm formik={formik} />
  </Box>
);

export default LogoSignature;

const BasicInformationForm: React.FC<any> = ({ formik }) => {
  /**
   * Destructured formik properties for easier access
   */
  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } = formik;

  return (
    <Box
      component="form"
      sx={{ height: 'calc(100%)', display: 'flex', flexDirection: 'column' }}
      onSubmit={handleSubmit}
    >
      <Scrollbar
        sx={{
          p: 2,
          height: '100%',
          '& .simplebar-content': {
            height: '100%',
          },
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    name="instituteName"
                    label="Institute Name"
                    value={values?.instituteName}
                    onChange={(e) => {
                      const newValue = capitalize(e.target.value);
                      setFieldValue('instituteName', newValue);
                    }}
                    error={touched.instituteName && Boolean(errors.instituteName)}
                    helperText={touched.instituteName && errors.instituteName}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    name="addressLine1"
                    label="Building / Flat / House No"
                    value={values.addressLine1}
                    onChange={(e) => {
                      const newValue = capitalize(e.target.value);
                      setFieldValue('addressLine1', newValue);
                    }}
                    error={touched.addressLine1 && Boolean(errors.addressLine1)}
                    helperText={touched.addressLine1 && errors.addressLine1}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    name="addressLine2"
                    label="Street / Road Name"
                    value={values.addressLine2}
                    onChange={(e) => {
                      const newValue = capitalize(e.target.value);
                      setFieldValue('addressLine2', newValue);
                    }}
                    error={touched.addressLine2 && Boolean(errors.addressLine2)}
                    helperText={touched.addressLine2 && errors.addressLine2}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    name="addressLine3"
                    label="Area / Locality / Landmark"
                    value={values.addressLine3}
                    onChange={(e) => {
                      const newValue = capitalize(e.target.value);
                      setFieldValue('addressLine3', newValue);
                    }}
                    error={touched.addressLine3 && Boolean(errors.addressLine3)}
                    helperText={touched.addressLine3 && errors.addressLine3}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <CountryComponent
                    onChange={(_e, value) => {
                      setFieldValue('stateProvince', null);
                      setFieldValue('country', value);
                    }}
                    size="small"
                    value={values.country}
                    fullWidth
                    error={touched.country && Boolean(errors?.country?.name)}
                    helperText={touched.country && errors?.country?.name}
                    // fieldProps={{ size: 'small' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <StateComponent
                    onChange={(_e, value) => {
                      setFieldValue('city', null);
                      setFieldValue('stateProvince', value);
                    }}
                    value={values.stateProvince}
                    countryValue={values.country}
                    fullWidth
                    error={touched?.stateProvince && Boolean(errors?.stateProvince?.name)}
                    helperText={touched?.stateProvince && errors?.stateProvince?.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <CityComponent
                    value={values.city}
                    onChange={(_e, value) => setFieldValue('city', value)}
                    stateValue={values.stateProvince}
                    fullWidth
                    // @ts-ignore
                    error={touched.city && Boolean(errors.city?.name)}
                    // @ts-ignore
                    helperText={touched.city && errors.city?.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
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

                <Grid item xs={12} sm={6} md={4} lg={3}>
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
                <Grid item xs={12} sm={6} md={4} lg={3}>
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

                <Grid item xs={12}>
                  <ComponentBlock title="Upload Photos or Banners" sx={{ height: '100%', mt: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={6} md={4}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            boxShadow: 'none',
                            border: `1px dashed ${colors.grey[400]}`,
                          }}
                        >
                          <UploadAvatar
                            maxSize={3145728}
                            onDrop={async (acceptedFiles: File[]) => {
                              const value = acceptedFiles[0];
                              const base64 = await fileToBase64(value);
                              formik.setFieldValue('instituteLogo', base64);
                            }}
                            title="Upload Logo"
                            value={formik.values.instituteLogo}
                            error={
                              formik.touched.instituteLogo && Boolean(formik.errors.instituteLogo)
                            }
                          />
                          <Typography variant="subtitle2" textAlign="center">
                            Upload Logo
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            boxShadow: 'none',
                            border: `1px dashed ${colors.grey[400]}`,
                          }}
                        >
                          <UploadAvatar
                            maxSize={3145728}
                            onDrop={async (acceptedFiles: File[]) => {
                              const value = acceptedFiles[0];
                              const base64 = await fileToBase64(value);
                              formik.setFieldValue('instituteBanner', base64);
                            }}
                            title="Upload Banner"
                            value={formik.values.instituteBanner}
                            error={
                              formik.touched.instituteBanner &&
                              Boolean(formik.errors.instituteBanner)
                            }
                          />
                          <Typography variant="subtitle2" textAlign="center">
                            Upload Banner
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            boxShadow: 'none',
                            border: `1px dashed ${colors.grey[400]}`,
                          }}
                        >
                          <UploadAvatar
                            maxSize={3145728}
                            onDrop={async (acceptedFiles: File[]) => {
                              const value = acceptedFiles[0];
                              const base64 = await fileToBase64(value);
                              formik.setFieldValue('principleSign', base64);
                            }}
                            title="Principle Signature"
                            value={formik.values.principleSign}
                            error={
                              formik.touched.principleSign && Boolean(formik.errors.principleSign)
                            }
                          />
                          <Typography variant="subtitle2" textAlign="center">
                            Upload Principle Signature
                          </Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </ComponentBlock>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
};
