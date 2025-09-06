'use client';

// @ts-nocheck
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import PhoneInput from 'src/components/phone-input';
import { Scrollbar } from 'src/components/scrollbar';
import SubmitButton from 'src/components/submit-button';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Add, ArrowBack, ArrowForward } from '@mui/icons-material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import FileUploader1 from 'src/components/custom-upload/custom-upload';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';
import {
  useAddTenantMutation,
  useGetAllTenantsQuery,
  useGetTenantByIdQuery,
  useUpdateTenantMutation,
} from 'src/redux/tenant/tenantApi';
import {
  Box,
  Grid,
  Card,
  Stack,
  Dialog,
  Button,
  Divider,
  TextField,
  IconButton,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { basicInformationvalidationSchema } from './validationSchema';

import type { IFormValues, IImageSliderProps } from './type';

const BasicInformationForm: React.FC<any> = ({ editData, handleClose }) => {
  const [addTenant, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddTenantMutation,
    popupConfig: { success: true, successMessage: 'Tenant Added Successfully' },
  });

  /**
   * Mutation hook for updating existing tenant
   * Includes success popup configuration
   */
  const [updateTenant, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateTenantMutation,
    popupConfig: { success: true, successMessage: 'Tenant Updated Successfully' },
  });
  const formik = useFormik<IFormValues>({
    initialValues: {
      instituteName: editData?.extraProperties?.InstituteName || '',
      instituteLogo: editData?.extraProperties?.Logo || [],
      instituteBanner: editData?.extraProperties?.Banner || [],
      addressLine1: editData?.extraProperties?.Address1 || '',
      addressLine2: editData?.extraProperties?.Address2 || '',
      addressLine3: editData?.extraProperties?.Address3 || '',
      city: editData?.extraProperties?.City
        ? { name: editData?.extraProperties?.City }
        : { name: '' },
      stateProvince: editData?.extraProperties?.State
        ? {
            name: editData?.extraProperties?.State?.name,
            isoCode: editData?.extraProperties?.State?.isoCode,
          }
        : { name: '', isoCode: '' },
      zipPostalCode: editData?.extraProperties?.PostalCode || '',
      country: editData?.extraProperties?.Country
        ? {
            name: editData?.extraProperties?.Country?.name,
            isoCode: editData?.extraProperties?.Country?.isoCode,
          }
        : { name: 'India', isoCode: 'IN' }, // Default value for country
      contactNumber: editData?.extraProperties?.ContactNumber || '',
      emailAddress: editData?.adminEmailAddress || '',
      password: '',
      principleSign: editData?.extraProperties?.PrincipleSign || [],
    },
    enableReinitialize: true,
    validationSchema: basicInformationvalidationSchema,
    onSubmit: async (formValues: IFormValues) => {
      try {
        if (editData) {
          await updateTenant({
            id: editData.id,
            body: {
              name: formValues.instituteName,
              email: formValues.emailAddress,
              adminPassword: formValues.password,
              extraProperties: {
                Country: { name: formValues.country?.name, isoCode: formValues.country?.isoCode },
                State: {
                  name: formValues.stateProvince?.name,
                  isoCode: formValues.stateProvince?.isoCode,
                },
                City: formValues.city?.name,
                Address1: formValues.addressLine1,
                Address2: formValues.addressLine2,
                Address3: formValues.addressLine3,
                ContactNumber: formValues.contactNumber,
                PostalCode: formValues.zipPostalCode,
                InstituteName: formValues.instituteName,
                Logo: formValues.instituteLogo,
                Banner: formValues.instituteBanner,
                PrincipleSign: formValues.principleSign,
              },
            },
          }).unwrap();
        } else {
          await addTenant({
            name: formValues.instituteName,
            adminEmailAddress: formValues.emailAddress,
            adminPassword: formValues.password,
            extraProperties: {
              Country: { name: formValues.country?.name, isoCode: formValues.country?.isoCode },
              State: {
                name: formValues.stateProvince?.name,
                isoCode: formValues.stateProvince?.isoCode,
              },
              City: formValues.city?.name,
              Address1: formValues.addressLine1,
              Address2: formValues.addressLine2,
              Address3: formValues.addressLine3,
              ContactNumber: formValues.contactNumber,
              PostalCode: formValues.zipPostalCode,
              InstituteName: formValues.instituteName,
              Logo: formValues.instituteLogo,
              Banner: formValues.instituteBanner,
              PrincipleSign: formValues.principleSign,
            },
          }).unwrap();
        }

        handleClose?.();
      } catch (error) {
        console.log(error);
      }
    },
  });

  /**
   * Destructured formik properties for easier access
   */
  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } = formik;

  return (
    <Box
      component="form"
      sx={{ minHeight: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      onSubmit={handleSubmit}
    >
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    name="instituteName *"
                    label="Institute Name"
                    value={values.instituteName}
                    onChange={(e) => setFieldValue('instituteName', capitalize(e.target.value))}
                    error={touched.instituteName && Boolean(errors.instituteName)}
                    helperText={touched.instituteName && errors.instituteName}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    name="addressLine1"
                    label="Building No./Flat/House No. *"
                    value={values.addressLine1}
                    onChange={(e) => setFieldValue('addressLine1', capitalize(e.target.value))}
                    error={touched.addressLine1 && Boolean(errors.addressLine1)}
                    helperText={touched.addressLine1 && errors.addressLine1}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    name="addressLine2"
                    label="Area/Locality/Road Name *"
                    value={values.addressLine2}
                    onChange={(e) => setFieldValue('addressLine2', capitalize(e.target.value))}
                    error={touched.addressLine2 && Boolean(errors.addressLine2)}
                    helperText={touched.addressLine2 && errors.addressLine2}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    name="addressLine3"
                    label="Landmark"
                    value={values.addressLine3}
                    onChange={(e) => setFieldValue('addressLine3', capitalize(e.target.value))}
                    error={touched.addressLine3 && Boolean(errors.addressLine3)}
                    helperText={touched.addressLine3 && errors.addressLine3}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <CountryComponent
                    onChange={(_e, value) => {
                      setFieldValue('stateProvince', null);
                      setFieldValue('city', null);
                      setFieldValue('country', value);
                    }}
                    size="small"
                    value={values.country}
                    fullWidth
                    error={
                      touched.country &&
                      typeof errors.country === 'object' &&
                      errors.country !== null &&
                      'name' in errors.country &&
                      Boolean((errors.country as any).name)
                    }
                    helperText={
                      touched.country &&
                      typeof errors.country === 'object' &&
                      errors.country !== null &&
                      'name' in errors.country
                        ? (errors.country as any).name
                        : ''
                    }
                    textFieldProps={{ label: 'Country *', size: 'small' }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <StateComponent
                    onChange={(_e, value) => {
                      setFieldValue('city', null);
                      setFieldValue('stateProvince', value);
                    }}
                    value={values.stateProvince}
                    countryValue={values.country}
                    fullWidth
                    error={touched.stateProvince && Boolean((errors?.stateProvince as any)?.name)}
                    helperText={
                      (touched.stateProvince && (errors?.stateProvince as any)?.name) || ''
                    }
                    textFieldProps={{ label: 'State *', size: 'small' }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <CityComponent
                    value={values.city}
                    onChange={(_e, value) => setFieldValue('city', value)}
                    stateValue={values.stateProvince}
                    fullWidth
                    error={
                      touched.city &&
                      Boolean(
                        typeof errors.city === 'object' &&
                          errors.city !== null &&
                          'name' in errors.city &&
                          (errors.city as any).name
                      )
                    }
                    helperText={
                      touched.city &&
                      typeof errors.city === 'object' &&
                      errors.city !== null &&
                      'name' in errors.city
                        ? (errors.city as any).name
                        : ''
                    }
                    textFieldProps={{ label: 'City *', size: 'small' }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    name="zipPostalCode"
                    label="ZIP/Postal Code *"
                    value={values.zipPostalCode}
                    onChange={(e) => {
                      if (e.target.value.length <= 6)
                        setFieldValue('zipPostalCode', e.target.value);
                    }}
                    type="number"
                    error={touched.zipPostalCode && Boolean(errors.zipPostalCode)}
                    helperText={touched.zipPostalCode && errors.zipPostalCode}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <PhoneInput
                    name="contactNumber"
                    value={values.contactNumber}
                    onChange={(value) => setFieldValue('contactNumber', value)}
                    error={touched.contactNumber && Boolean(errors.contactNumber)}
                    helperText={touched.contactNumber && errors.contactNumber}
                    variant="outlined"
                    label="Contact No. *"
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    name="emailAddress"
                    label="Email Address *"
                    value={values.emailAddress}
                    onChange={handleChange}
                    error={touched.emailAddress && Boolean(errors.emailAddress)}
                    helperText={touched.emailAddress && errors.emailAddress}
                    autoComplete="off"
                    InputProps={{
                      startAdornment: (
                        <>
                          <Iconify icon="mdi-light:email" />
                          <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />
                        </>
                      ),
                    }}
                  />
                </Grid>

                {!editData && (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
                )}
              </Grid>
            </Box>
          </Grid>

          {[
            { name: 'instituteLogo', title: 'Upload Institute Logo' },
            { name: 'instituteBanner', title: 'Upload Institute Banner' },
            { name: 'principleSign', title: 'Upload Principle Sign' },
          ].map((item) => (
            <Grid key={item.name} size={{ xs: 4 }}>
              <BasicInformationAssets formik={formik} name={item.name} title={item.title} />
            </Grid>
          ))}
        </Grid>
      </Scrollbar>

      <DialogActions sx={{ borderRadius: 1, boxShadow: 'none', bgcolor: 'background.paper' }}>
        <Stack
          alignItems="flex-end"
          sx={{
            position: 'sticky',
            bottom: 0,
            bgcolor: 'background.paper',
            zIndex: 10,
            // py: 2,
            textAlign: 'right',
          }}
        >
          <SubmitButton loading={isLoading || isUpdateLoading} />
        </Stack>
      </DialogActions>
    </Box>
  );
};

/**
 * BasicInformation component for managing institute information
 * Displays a table of institutes and allows creating/editing institute details
 */
const BasicInformation = () => {
  const store = useSelector((state: any) => state.auth);
  const isSuperAdmin = !store?.user?.profile.tenantid;
  // Toggle form visibility
  const form = useBoolean();
  // Toggle view dialog for assets
  const viewDialog = useBoolean();
  // State to store currently viewed asset (logo/banner/sign)
  const [currentAsset, setCurrentAsset] = useState<null | string[]>(null);
  // State to store data for editing an institute
  const [editData, setEditData] = useState<any>(null);

  const { data: tenantDetail, isLoading: isTenantLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetTenantByIdQuery,
    params: store?.user?.profile.tenantid,
    options: { skip: !store?.user?.profile.tenantid },
  });
  useEffect(() => {
    setEditData(tenantDetail);
  }, [tenantDetail]);

  /**
   * Handles closing the form and resetting edit data
   */
  const handleClose = () => {
    form.onFalse();
    setEditData(null);
  };

  /**
   * Query hook to fetch all tenants data
   */
  const { data: tenants } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllTenantsQuery,
    options: { skip: !isSuperAdmin },
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Basic Information"
        description="Manage and create tenant information for schools, including institute details, contact information, and assets like logos and banners."
        links={[{ name: 'Institute Setup' }, { name: 'Basic Information' }]}
        isBack={isSuperAdmin ? form.value : false}
        onBack={() => {
          form.onFalse();
          setEditData(null);
        }}
        action={
          isSuperAdmin && (
            <Button
              variant="contained"
              size="small"
              startIcon={form.value ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
              onClick={form.value ? handleClose : form.onTrue}
            >
              {form.value ? 'Back' : 'Institute'}
            </Button>
          )
        }
      />

      {isSuperAdmin ? (
        form.value ? (
          <BasicInformationForm handleClose={handleClose} editData={editData} />
        ) : (
          <CustomizableTable
            noDataText={
              <>
                No Institute have been added yet.{' '}
                <Box
                  onClick={() => {
                    form.onTrue();
                  }}
                  color="primary.main"
                  fontWeight={600}
                  sx={{
                    '&:hover': {
                      cursor: 'pointer',
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Add Institute
                </Box>
              </>
            }
            tableId="institute-setup"
            columns={[
              { label: 'Institute Name', id: 'name' },
              {
                label: 'Institute Logo',
                id: 'extraProperties.Logo',
                render(value, row) {
                  return (
                    <IconButton
                      disabled={!value}
                      onClick={() => {
                        viewDialog.onTrue();
                        setCurrentAsset(value);
                      }}
                    >
                      <Iconify
                        icon="carbon:view-filled"
                        sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
                      />
                    </IconButton>
                  );
                },
              },
              {
                label: 'Institute Banner',
                id: 'extraProperties.Banner',
                render(value, row) {
                  return (
                    <IconButton
                      disabled={!value}
                      onClick={() => {
                        viewDialog.onTrue();
                        setCurrentAsset(value);
                      }}
                    >
                      <Iconify
                        icon="carbon:view-filled"
                        sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
                      />
                    </IconButton>
                  );
                },
              },
              {
                label: 'Principle Sign',
                id: 'extraProperties.PrincipleSign',
                render(value, row) {
                  return (
                    <IconButton
                      disabled={!value}
                      onClick={() => {
                        viewDialog.onTrue();
                        setCurrentAsset(value);
                      }}
                    >
                      <Iconify
                        icon="carbon:view-filled"
                        sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
                      />
                    </IconButton>
                  );
                },
              },
              { label: 'Address', id: 'extraProperties.Address1' },
              { label: 'Country', id: 'extraProperties.Country.name' },
              { label: 'State', id: 'extraProperties.State.name' },
              { label: 'City', id: 'extraProperties.City' },
              { label: 'ZIP/Postal Code', id: 'extraProperties.PostalCode' },
              { label: 'Contact Number', id: 'extraProperties.ContactNumber' },
              {
                label: 'Action',
                id: 'action',
                sticky: true,
                isSort: false,
                isFilter: false,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      showEditIcon
                      handleEditClick={() => {
                        setEditData(row);
                        form.onTrue();
                      }}
                      showThreeDots={false}
                    />
                  );
                },
              },
            ]}
            data={tenants?.items || []}
          />
        )
      ) : (
        <BasicInformationForm handleClose={handleClose} editData={editData} />
      )}
      {viewDialog.value && (
        <ImageSlider
          images={currentAsset as string[]}
          onClose={() => {
            setCurrentAsset(null);
            viewDialog.onFalse();
          }}
          open={viewDialog.value}
        />
      )}
    </Box>
  );
};
export default BasicInformation;

/**
 * Component for handling basic information assets with image upload and preview functionality
 * @param {Object} formik - Formik instance for form handling
 * @param {string} name - Field name for the form values
 * @param {string} title - Title to display above the upload section
 */
const BasicInformationAssets = ({ formik, name, title }: any) => (
  <Card sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 2 }} key={name}>
    <FileUploader1
      multiple
      previewCount={3}
      onChange={(files) => formik.setFieldValue(name, files)}
      value={formik.values[name]}
      error={formik.touched[name] && formik.errors[name]}
      helperText={formik.touched[name] && formik.errors[name]}
      label={title}
      outputFormat="base64"
    />
    {/* <FileUploader1
        onChange={handleChange}
        multiple
        parentsProps={{ sx: { width: '100%' } }}
        showVisibleDocumentCount={2}
        value={formik.values[name]}
        primaryText={title}
        secondaryText="maximum upload size (5mb)"
        error={formik.touched[name] && formik.errors[name]}
        key={name}
      /> */}
  </Card>
);

// ImageSlider component displays a modal dialog with image carousel functionality
const ImageSlider: React.FC<IImageSliderProps> = ({ images, open, onClose }) => {
  // State to track the current image index in the carousel
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handler for navigating to the next image in the carousel
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Handler for navigating to the previous image in the carousel
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <IconButton
          onClick={handlePrev}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            background: (theme) => theme.vars.palette.grey[500],
            color: 'white',
            '&:hover': { background: (theme) => theme.vars.palette.grey[600] },
          }}
        >
          <ArrowBack />
        </IconButton>
        <Box
          component="img"
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          sx={{ maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain' }}
        />
        <IconButton
          onClick={handleNext}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            background: (theme) => theme.vars.palette.grey[500],
            color: 'white',
            '&:hover': { background: (theme) => theme.vars.palette.grey[600] },
          }}
        >
          <ArrowForward />
        </IconButton>
      </DialogContent>
    </Dialog>
  );
};
