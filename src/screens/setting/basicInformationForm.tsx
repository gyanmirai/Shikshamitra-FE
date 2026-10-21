'use client';

// @ts-nocheck
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import PhoneInput from 'src/components/phone-input';
import { Scrollbar } from 'src/components/scrollbar';
import { capitalizeFirstLetter } from 'src/utils/input-format';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { Add, ArrowBack, ArrowForward } from '@mui/icons-material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
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
  Typography,
  DialogContent,
} from '@mui/material';

import { basicInformationvalidationSchema } from './validationSchema';

import type { IFormValues, IImageSliderProps } from './type';

interface IBasicinformatioFormProps {
  editData?: any;
  handleClose?: () => void;
}

export const BasicInformationForm: React.FC<IBasicinformatioFormProps> = ({
  editData,
  handleClose,
}) => {
  const theme = useTheme();
  const [addTenant, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddTenantMutation,
    popupConfig: { success: true, successMessage: 'Tenant Added Successfully' },
  });

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
        : { name: 'India', isoCode: 'IN' },
      contactNumber: editData?.extraProperties?.ContactNumber || '',
      emailAddress: editData?.adminEmailAddress || '',
      password: '',
      principleSign: editData?.extraProperties?.PrincipleSign || [],
    },
    enableReinitialize: true,
    validationSchema: basicInformationvalidationSchema,
    onSubmit: async (formValues: IFormValues) => {
      try {
        const payload = {
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
          },
        };

        if (editData) {
          await updateTenant({
            id: editData.id,
            body: payload,
          }).unwrap();
        } else {
          await addTenant({
            ...payload,
            adminEmailAddress: formValues.emailAddress,
          }).unwrap();
        }
      } catch (error) {
        console.error(error);
      }
      handleClose?.();
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } = formik;

  const renderSectionHeader = (title: string, icon: string, subtitle?: string) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
      <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.lighter', color: 'primary.main' }}>
        <Iconify icon={icon} width={24} />
      </Box>
      <Box>
        <Typography variant="h6">{title}</Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );

  return (
    <Box
      component={motion.form}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Scrollbar sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={4}>
          {/* Left Column: Essential Info */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 3, height: '100%', boxShadow: theme.customShadows.z4 }}>
              {renderSectionHeader(
                'Institute Profile',
                'solar:buildings-bold',
                'Basic details and location'
              )}

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <ShakingTextField error={touched.instituteName && Boolean(errors.instituteName)}>
                    <TextField
                      fullWidth
                      label="Institute Name *"
                      name="instituteName"
                      value={values.instituteName}
                      onChange={(e) =>
                        setFieldValue('instituteName', capitalizeFirstLetter(e.target.value))
                      }
                      error={touched.instituteName && Boolean(errors.instituteName)}
                      helperText={touched.instituteName && errors.instituteName}
                      InputProps={{
                        startAdornment: (
                          <Iconify
                            icon="solar:city-bold"
                            width={20}
                            color="text.disabled"
                            sx={{ mr: 1 }}
                          />
                        ),
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={touched.emailAddress && Boolean(errors.emailAddress)}>
                    <TextField
                      fullWidth
                      label="Email Address *"
                      name="emailAddress"
                      value={values.emailAddress}
                      onChange={handleChange}
                      error={touched.emailAddress && Boolean(errors.emailAddress)}
                      helperText={touched.emailAddress && errors.emailAddress}
                      InputProps={{
                        startAdornment: (
                          <Iconify
                            icon="solar:letter-bold"
                            width={20}
                            color="text.disabled"
                            sx={{ mr: 1 }}
                          />
                        ),
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={touched.contactNumber && Boolean(errors.contactNumber)}>
                    <PhoneInput
                      name="contactNumber"
                      value={values.contactNumber}
                      onChange={(value) => setFieldValue('contactNumber', value)}
                      error={touched.contactNumber && Boolean(errors.contactNumber)}
                      helperText={touched.contactNumber && errors.contactNumber}
                      variant="outlined"
                      label="Contact No. *"
                      size="medium"
                    />
                  </ShakingTextField>
                </Grid>

                {!editData && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField error={touched.password && Boolean(errors.password)}>
                      <TextField
                        fullWidth
                        name="password"
                        label="Admin Password"
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                      />
                    </ShakingTextField>
                  </Grid>
                )}

                <Grid size={12}>
                  <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
                </Grid>

                <Grid size={12}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Location Details
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={
                      touched.country &&
                      typeof errors.country === 'object' &&
                      errors.country !== null &&
                      'name' in errors.country &&
                      Boolean((errors.country as any).name)
                    }
                  >
                    <CountryComponent
                      size="medium"
                      value={values.country}
                      onChange={(_e, value) => {
                        setFieldValue('stateProvince', null);
                        setFieldValue('city', null);
                        setFieldValue('country', value);
                      }}
                      error={
                        touched.country &&
                        typeof errors.country === 'object' &&
                        errors.country !== null &&
                        'name' in errors.country &&
                        Boolean((errors.country as any).name)
                      }
                      textFieldProps={{ label: 'Country *', size: 'medium' }}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={touched.stateProvince && Boolean((errors?.stateProvince as any)?.name)}
                  >
                    <StateComponent
                      value={values.stateProvince}
                      countryValue={values.country}
                      onChange={(_e, value) => {
                        setFieldValue('city', null);
                        setFieldValue('stateProvince', value);
                      }}
                      error={touched.stateProvince && Boolean((errors?.stateProvince as any)?.name)}
                      helperText={touched.stateProvince && (errors?.stateProvince as any)?.name}
                      textFieldProps={{ label: 'State *', size: 'medium' }}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={
                      touched.city &&
                      Boolean(
                        typeof errors.city === 'object' &&
                        errors.city !== null &&
                        'name' in errors.city &&
                        (errors.city as any).name
                      )
                    }
                  >
                    <CityComponent
                      value={values.city}
                      stateValue={values.stateProvince}
                      onChange={(_e, value) => setFieldValue('city', value)}
                      error={
                        touched.city &&
                        Boolean(
                          typeof errors.city === 'object' &&
                          errors.city !== null &&
                          'name' in errors.city &&
                          (errors.city as any).name
                        )
                      }
                      helperText={touched.city && (errors?.city as any)?.name}
                      textFieldProps={{ label: 'City *', size: 'medium' }}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    name="zipPostalCode"
                    label="ZIP/Postal Code"
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
                <Grid size={{ xs: 12 }}>
                  <ShakingTextField error={touched.addressLine1 && Boolean(errors.addressLine1)}>
                    <TextField
                      fullWidth
                      name="addressLine1"
                      label="Address Line 1 *"
                      placeholder="Building No./Flat/House No."
                      value={values.addressLine1}
                      onChange={(event) =>
                        setFieldValue('addressLine1', capitalizeFirstLetter(event.target.value))
                      }
                      error={touched.addressLine1 && Boolean(errors.addressLine1)}
                      helperText={touched.addressLine1 && errors.addressLine1}
                      multiline
                      rows={2}
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Right Column: Branding Assets */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <Card sx={{ p: 3, boxShadow: theme.customShadows.z4 }}>
                {renderSectionHeader(
                  'School Identity',
                  'solar:gallery-wide-bold',
                  'School logos and signatures'
                )}
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Manage the school logo, banner and principal’s signature in School Identity after
                  institute setup.
                </Typography>
                <Button component="a" href={instituteSetupPaths.schoolIdentity}>
                  Open School Identity
                </Button>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Scrollbar>

      <Box
        sx={{
          p: 2,
          borderTop: `1px dashed ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        {/* Add Cancel Button if needed */}
        <Button
          variant="contained"
          onClick={() => formik.handleSubmit()}
          disabled={isLoading || isUpdateLoading}
          startIcon={
            isLoading || isUpdateLoading ? (
              <Iconify icon="line-md:loading-loop" />
            ) : (
              <Iconify icon="solar:disk-bold" />
            )
          }
        >
          {editData ? 'Update & Next' : 'Save & Next'}
        </Button>
      </Box>
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

  const { data: tenantDetail } = useQueryAndMutation({
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
