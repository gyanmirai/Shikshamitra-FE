import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { Create } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useEffect } from 'react';
import { UploadBox } from 'src/components/upload';
import { useDispatch, useSelector } from 'react-redux';
import capitalizeWords from 'src/utils/capitalizeText';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { Box, Grid, Card, Button, TextField, Typography, DialogActions } from '@mui/material';

import { vehicleManagementValidationSchema } from '../validationSchema';

import type { IVehicleFormDialogProps } from '../vehicle-management-interface';

const VehicleFormDialog: React.FC<IVehicleFormDialogProps> = ({
  vehicle,
  onClose,
  isEdit,
  dialogValue,
}) => {
  // Form validation schema

  // Get the isChanges state from Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Initialize dispatch function from Redux
  const dispatch = useDispatch();

  // Define initial form values using useMemo to optimize performance
  const initialValues = useMemo(
    () => ({
      vehicleName: '',
      registrationNumber: '',
      vehicleType: '',
      manufacturer: '',
      seatingCapacity: '',
      insurancePolicyNumber: '',
      insuranceExpiryDate: dayjs(),
      dailyInspectionChecklist: '',
      assignedRoute: '',
      assignedDriver: '',
    }),
    []
  );

  // Initialize formik for form handling with validation and submission logic
  const formik = useFormik<any>({
    initialValues,
    validationSchema: vehicleManagementValidationSchema,
    onSubmit: (values: any) => {
      console.log('Form Submitted:', values);
      // onSave(values);
    },
  });

  // Track form changes and update Redux state when values differ from initial state
  useEffect(() => {
    const isChanged = !isEqual(formik.values, initialValues);
    dispatch(setIsChanges(isChanged));
  }, [dispatch, formik.values, initialValues]);

  // Handle dialog close with confirmation if there are unsaved changes
  const handleCloseDialog = () => {
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      onClose();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      onClose();
    }
  };
  return (
    <Box display="flex" flexDirection="column" gap={2} height="100%">
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Vehicle Management"
          links={[{ name: 'Transport' }, { name: 'Vehicle Management' }, { name: 'Form' }]}
          sx={{ mb: 2 }}
        />
        <Box sx={{ mr: '15px', mb: '20px' }} gap={3} display="flex" justifyContent="flex-end">
          <Button
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleCloseDialog}
            variant="contained"
            size="small"
          >
            Back
          </Button>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Card
          sx={{
            height: '100%',
            boxShadow: 'var(--shadows-4)',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
          }}
        >
          <Grid container spacing={2}>
            {/* Vehicle Name */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: '10px' }}>
              <ShakingTextField
                error={formik.touched.vehicleName && Boolean(formik.errors.vehicleName)}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Vehicle Name"
                  name="vehicleName"
                  value={formik.values.vehicleName}
                  onChange={(e) => {
                    formik.setFieldValue('vehicleName', capitalizeWords(e.target.value));
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.vehicleName && Boolean(formik.errors.vehicleName)}
                  helperText={formik.touched.vehicleName ? String(formik.errors.vehicleName) : ''}
                />
              </ShakingTextField>
            </Grid>

            {/* Registration Number */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: '10px' }}>
              <ShakingTextField
                error={
                  formik.touched.registrationNumber && Boolean(formik.errors.registrationNumber)
                }
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Registration Number"
                  name="registrationNumber"
                  value={formik.values.registrationNumber}
                  onChange={(e) => {
                    formik.setFieldValue('registrationNumber', e.target.value.toUpperCase());
                  }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.registrationNumber && Boolean(formik.errors.registrationNumber)
                  }
                  helperText={
                    formik.touched.registrationNumber
                      ? String(formik.errors.registrationNumber)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>

            {/* Vehicle Type */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: '10px' }}>
              <ShakingTextField
                error={formik.touched.vehicleType && Boolean(formik.errors.vehicleType)}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Vehicle Type"
                  name="vehicleType"
                  value={formik.values.vehicleType}
                  onChange={(e) => {
                    formik.setFieldValue('vehicleType', capitalizeWords(e.target.value));
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.vehicleType && Boolean(formik.errors.vehicleType)}
                  helperText={formik.touched.vehicleType ? String(formik.errors.vehicleType) : ''}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: '10px' }}>
              <ShakingTextField error={formik.touched.fuelType && Boolean(formik.errors.fuelType)}>
                <TextField
                  size="small"
                  fullWidth
                  label="Fuel Type"
                  name="fuelType"
                  value={formik.values.fuelType}
                  onChange={formik.handleChange}
                  // onBlur={formik.handleBlur}
                  error={formik.touched.fuelType && Boolean(formik.errors.fuelType)}
                  helperText={formik.touched.fuelType ? String(formik.errors.fuelType) : ''}
                />
              </ShakingTextField>
            </Grid>

            {/* Manufacturer */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: '10px' }}>
              <ShakingTextField
                error={formik.touched.manufacturer && Boolean(formik.errors.manufacturer)}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Manufacturer"
                  name="manufacturer"
                  value={formik.values.manufacturer}
                  onChange={(e) => {
                    formik.setFieldValue('manufacturer', capitalizeWords(e.target.value));
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.manufacturer && Boolean(formik.errors.manufacturer)}
                  helperText={formik.touched.manufacturer ? String(formik.errors.manufacturer) : ''}
                />
              </ShakingTextField>
            </Grid>

            {/* Seating Capacity */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: '10px' }}>
              <ShakingTextField
                error={formik.touched.seatingCapacity && Boolean(formik.errors.seatingCapacity)}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Seating Capacity"
                  name="seatingCapacity"
                  type="number"
                  value={formik.values.seatingCapacity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.seatingCapacity && Boolean(formik.errors.seatingCapacity)}
                  helperText={
                    formik.touched.seatingCapacity && formik.errors.seatingCapacity
                      ? String(formik.errors.seatingCapacity)
                      : ''
                  }
                />{' '}
              </ShakingTextField>
            </Grid>

            {/* Insurance Policy Number */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: '10px' }}>
              <ShakingTextField
                error={
                  formik.touched.insurancePolicyNumber &&
                  Boolean(formik.errors.insurancePolicyNumber)
                }
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Insurance Policy Number"
                  name="insurancePolicyNumber"
                  value={formik.values.insurancePolicyNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.insurancePolicyNumber &&
                    Boolean(formik.errors.insurancePolicyNumber)
                  }
                  helperText={
                    formik.touched.insurancePolicyNumber
                      ? String(formik.errors.insurancePolicyNumber)
                      : ''
                  }
                />
              </ShakingTextField>
            </Grid>

            {/* Insurance Expiry Date */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: '10px' }}>
              <DatePicker
                label="Insurance Expiry Date"
                name="insuranceExpiryDate"
                value={formik.values.insuranceExpiryDate}
                format="DD-MM-YYYY"
                onChange={() => {}}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    //                         error={ formik.touched.insuranceExpiryDate && Boolean(formik.errors.insuranceExpiryDate) }
                    //   helperText={ formik.touched.insuranceExpiryDate && formik.errors.insuranceExpiryDate }
                  },
                }}
              />
              {/* <TextField
                                    size="small"
                                    fullWidth
                                    label="Insurance Expiry Date"
                                    name="insuranceExpiryDate"
                                    type="date"
                                    value={formik.values.insuranceExpiryDate}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.insuranceExpiryDate && Boolean(formik.errors.insuranceExpiryDate)}
                                    helperText={formik.touched.insuranceExpiryDate && formik.errors.insuranceExpiryDate}
                                    InputLabelProps={{ shrink: true }}
                                /> */}
            </Grid>

            {/* Daily Inspection Checklist */}
            {/* <Grid size={12} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Daily Inspection Checklist"
                                    name="dailyInspectionChecklist"
                                    multiline
                                    rows={3}
                                    value={formik.values.dailyInspectionChecklist}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.dailyInspectionChecklist && Boolean(formik.errors.dailyInspectionChecklist)}
                                    helperText={formik.touched.dailyInspectionChecklist && formik.errors.dailyInspectionChecklist}
                                />
                            </Grid> */}

            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: '10px' }}>
              <ShakingTextField
                error={formik.touched.assignedDriver && Boolean(formik.errors.assignedDriver)}
              >
                <CustomSelect
                  options={[
                    { value: 'sumit', label: 'sumit' },
                    { value: 'sumit1', label: 'sumit1' },
                    { value: 'sumit2', label: 'sumit2' },
                  ]}
                  label="Assigned Driver"
                  value={formik.values.assignedDriver}
                  onChange={formik.handleChange}
                  formControlProps={{ sx: { minWidth: 275 } }}
                  error={formik.touched.assignedDriver && Boolean(formik.errors.assignedDriver)}
                  helperText={
                    formik.touched.assignedDriver ? String(formik.errors.assignedDriver) : ''
                  }
                />
              </ShakingTextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: '10px' }}>
              <ShakingTextField
                error={formik.touched.assignedRoute && Boolean(formik.errors.assignedRoute)}
              >
                <CustomSelect
                  options={[
                    { value: 'route1', label: 'route1' },
                    { value: 'route2', label: 'route2' },
                    { value: 'route3', label: 'route3' },
                  ]}
                  label="Assigned Route"
                  value={formik.values.assignedRoute}
                  onChange={formik.handleChange}
                  formControlProps={{ sx: { minWidth: 275 } }}
                  error={formik.touched.assignedRoute && Boolean(formik.errors.assignedRoute)}
                  helperText={
                    formik.touched.assignedRoute ? String(formik.errors.assignedRoute) : undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            {/* Uploads */}
            <Grid size={12} sx={{ pb: '10px' }}>
              <UploadBox
                onDrop={() => {}}
                placeholder={
                  <Box
                    sx={{
                      gap: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.disabled',
                      flexDirection: 'column',
                    }}
                  >
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Upload Required Vehicle Document</Typography>
                  </Box>
                }
                sx={{
                  py: 2.5,
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1.5,
                }}
              />
            </Grid>

            <Grid size={12} sx={{ pb: '10px' }}>
              <UploadBox
                onDrop={() => {}}
                placeholder={
                  <Box
                    sx={{
                      gap: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.disabled',
                      flexDirection: 'column',
                    }}
                  >
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Upload Insurance Document</Typography>
                  </Box>
                }
                sx={{
                  py: 2.5,
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1.5,
                }}
              />
            </Grid>
          </Grid>

          <DialogActions>
            {isEdit && (
              <Button startIcon={<Create />} variant="outlined" type="submit">
                Update
              </Button>
            )}
            {!isEdit && <SubmitButton onClick={() => {}} />}
          </DialogActions>
        </Card>
      </form>
    </Box>
  );
};

export default VehicleFormDialog;
