'use client';

// @ts-nocheck

import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import React, { useState } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { Add, ArrowBack, ArrowForward } from '@mui/icons-material';
import {
  Box,
  List,
  Card,
  Stack,
  Dialog,
  Button,
  Divider,
  ListItem,
  TextField,
  IconButton,
  Typography,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useAddTenantMutation,
  useGetAllTenantsQuery,
  useUpdateTenantMutation,
} from 'src/redux/tenant/tenantApi';

import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import SubmitButton from 'src/components/submit-button';
import { EmptyContent } from 'src/components/empty-content';
import { RemoveButton } from 'src/components/file-thumbnail';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import { fileThumbnailClasses } from 'src/components/file-thumbnail/classes';
import CountryComponent from 'src/components/stardard-address/country-component';

import { basicInformationvalidationSchema } from './validationSchema';

import type { IFormValues, IImageSliderProps } from './type';

const BasicInformationForm: React.FC<any> = ({ editData, handleClose }) => {
  const [addTenant, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddTenantMutation,
    popupConfig: {
      success: true,
      successMessage: 'Tenant Added Successfully',
    },
  });

  /**
   * Mutation hook for updating existing tenant
   * Includes success popup configuration
   */
  const [updateTenant, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateTenantMutation,
    popupConfig: {
      success: true,
      successMessage: 'Tenant Updated Successfully',
    },
  });
  const formik = useFormik<IFormValues>({
    initialValues: {
      instituteName: editData?.name || '',
      instituteLogo: editData?.extraProperties?.Logo || [],
      instituteBanner: editData?.extraProperties?.Banner || [],
      addressLine1: editData?.extraProperties?.Address1 || '',
      addressLine2: editData?.extraProperties?.Address2 || '',
      addressLine3: editData?.extraProperties?.Address3 || '',
      city: editData?.extraProperties?.City ? { name: editData?.extraProperties?.City } : undefined,
      stateProvince: editData?.extraProperties?.State
        ? {
            name: editData?.extraProperties?.State?.name,
            isoCode: editData?.extraProperties?.State?.isoCode,
          }
        : undefined,
      zipPostalCode: editData?.extraProperties?.PostalCode || '',
      country: editData?.extraProperties?.Country
        ? {
            name: editData?.extraProperties?.Country?.name,
            isoCode: editData?.extraProperties?.Country?.isoCode,
          }
        : undefined,
      contactNumber: editData?.extraProperties?.ContactNumber || '',
      emailAddress: editData?.adminEmailAddress || '',
      password: '',
      principleSign: editData?.extraProperties?.PrincipleSign || [],
    },
    validationSchema: basicInformationvalidationSchema,
    onSubmit: async (formValues: IFormValues) => {
      try {
        if (editData) {
          await updateTenant({
            id: editData.id,
            body: {
              name: formValues.instituteName,
              adminEmailAddress: formValues.emailAddress,
              adminPassword: formValues.password,
              extraProperties: {
                Country: {
                  name: formValues.country?.name,
                  isoCode: formValues.country?.isoCode,
                },
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
              Country: {
                name: formValues.country?.name,
                isoCode: formValues.country?.isoCode,
              },
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
      sx={{ height: 'calc(100% - 74px)', display: 'flex', flexDirection: 'column' }}
      onSubmit={handleSubmit}
    >
      <Scrollbar
        sx={{
          p: 2,
          height: '100%',
        }}
      >
        <Grid container spacing={3}>
          <Grid xs={12}>
            <Box>
              <Grid container spacing={3}>
                <Grid xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    fullWidth
                    size="small"
                    name="instituteName"
                    label="Institute Name"
                    value={values.instituteName}
                    onChange={(e) => {
                      const newValue = capitalize(e.target.value);
                      setFieldValue('instituteName', newValue);
                    }}
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
                    onChange={(e) => {
                      const newValue = capitalize(e.target.value);
                      setFieldValue('addressLine1', newValue);
                    }}
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
                    onChange={(e) => {
                      const newValue = capitalize(e.target.value);
                      setFieldValue('addressLine2', newValue);
                    }}
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
                    onChange={(e) => {
                      const newValue = capitalize(e.target.value);
                      setFieldValue('addressLine3', newValue);
                    }}
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
                    // @ts-ignore
                    error={touched.country && Boolean(errors?.country?.name)}
                    // @ts-ignore
                    helperText={touched.country && errors?.country?.name}
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
                    // @ts-ignore
                    error={touched?.stateProvince && Boolean(errors?.stateProvince?.name)}
                    // @ts-ignore
                    helperText={touched?.stateProvince && errors?.stateProvince?.name}
                  />
                </Grid>
                <Grid xs={12} sm={6} md={4} lg={3}>
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
                {!editData && (
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
                )}
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
  // Toggle form visibility
  const form = useBoolean();
  // Toggle view dialog for assets
  const viewDialog = useBoolean();
  // State to store currently viewed asset (logo/banner/sign)
  const [currentAsset, setCurrentAsset] = useState<null | string[]>(null);
  // State to store data for editing an institute
  const [editData, setEditData] = useState<any>(null);

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
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Basic Information"
        description="Manage and create tenant information for schools, including institute details, contact information, and assets like logos and banners."
        links={[{ name: 'Institute Setup' }, { name: 'Basic Information' }]}
        sx={{ px: 1 }}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={form.value ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            onClick={form.value ? handleClose : form.onTrue}
          >
            {form.value ? 'Back' : 'Institute'}
          </Button>
        }
      />
      {form.value ? (
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
          searchFieldProps={{
            placeholder: 'Search Institute',
            label: 'Search Institute',
            sx: {
              maxWidth: '400px',
              width: '100%',
            },
          }}
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
const BasicInformationAssets = ({ formik, name, title }: any) => {
  // Dialog state for image preview
  const priviewDialog = useBoolean();

  // State to store the currently previewed image
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
          error={formik.touched[name] && formik.errors[name]}
          helperText={formik.touched[name] && formik.errors[name]}
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
            formik.setFieldValue(name, [...formik.values[name], ...base64StringArray]);
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
            background: (theme) => theme.palette.grey[500],
            color: 'white',
            '&:hover': {
              background: (theme) => theme.palette.grey[600],
            },
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
            background: (theme) => theme.palette.grey[500],
            color: 'white',
            '&:hover': {
              background: (theme) => theme.palette.grey[600],
            },
          }}
        >
          <ArrowForward />
        </IconButton>
      </DialogContent>
    </Dialog>
  );
};
