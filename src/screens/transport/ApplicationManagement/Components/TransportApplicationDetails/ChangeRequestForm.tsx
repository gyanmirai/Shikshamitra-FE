'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { Grid, Button, TextField, Typography, DialogActions, InputAdornment } from '@mui/material';

import TransportMemberProfile from '../TransportMemberProfile';

import type { ITransportApplicationPayload } from '../../type';

interface Props {
  onClose: (e: any, isSubmit: boolean) => void;
  selectedApplication: ITransportApplicationPayload | null;
}

const getInitialTransportData = (selectedApplication: ITransportApplicationPayload | null) => ({
  studentId: selectedApplication?.studentId || '',
  name: selectedApplication?.name || '',
  className: selectedApplication?.class || '',
  rollNo: selectedApplication?.rollNo || '',
  role: selectedApplication?.role || '',
  grNo: selectedApplication?.grNo || '',
  contactNo: selectedApplication?.contactNo || '',
  photoUrl: selectedApplication?.photoUrl || '',
  searchStop: selectedApplication?.searchStop || '',
  pickupType: selectedApplication?.pickupType || '',
  landmark: selectedApplication?.landmark || '',
  areaLocality: selectedApplication?.areaLocality || '',
  description: selectedApplication?.description || '',
  selectedStudent: selectedApplication?.selectedStudent || '',
  addressLine1: selectedApplication?.addressLine1 || '',
  newStopName: '',
  newLandmark: '',
  newPickupType: '',
  newAreaLocality: '',
  newDescription: '',
});

const ChangeStopRequestForm = ({ onClose, selectedApplication }: Props) => {
  const initialValues = getInitialTransportData(selectedApplication);

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      newStopName: Yup.string().required('Stop Name is required'),
      newLandmark: Yup.string().required('Landmark is required'),
      newPickupType: Yup.string().required('Pickup Type is required'),
      newAreaLocality: Yup.string().required('Area/Locality is required'),
      newDescription: Yup.string().required('Description is required'),
    }),
    onSubmit: (values) => {
      onClose(values, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        {/* CURRENT STOP DETAILS */}

        <TransportMemberProfile selectedMember={selectedApplication} fromViewScreen={false} />

        {/* NEW STOP DETAILS */}
        <SectionCard title="Select New Stop" paperProps={{ sx: { mt: 2 } }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField error={!!(formik.touched.newStopName && formik.errors.newStopName)}>
                <TextField
                  fullWidth
                  label="Stop Name *"
                  name="newStopName"
                  size="small"
                  value={formik.values.newStopName}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/[^a-zA-Z0-9\s-]/g, '') // allow letters, numbers, spaces, and hyphens
                      .split(' ')
                      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
                      .join(' ');
                    formik.setFieldValue('newStopName', value);
                  }}
                  error={formik.touched.newStopName && Boolean(formik.errors.newStopName)}
                  helperText={formik.touched.newStopName && formik.errors.newStopName}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={!!(formik.touched.newPickupType && formik.errors.newPickupType)}
              >
                <CustomSelect
                  label="Pickup Type *"
                  options={[
                    { label: 'Morning', value: 'Morning' },
                    { label: 'Evening', value: 'Evening' },
                    { label: 'Both', value: 'Both' },
                  ]}
                  value={formik.values.newPickupType}
                  onChange={(val) => formik.setFieldValue('newPickupType', val)}
                  formControlProps={{ fullWidth: true }}
                  error={!!(formik.touched.newPickupType && formik.errors.newPickupType)}
                  helperText={(formik.touched.newPickupType && formik.errors.newPickupType) || ''}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.newLandmark && formik.errors.newLandmark)}>
                <TextField
                  fullWidth
                  label="Landmark *"
                  name="newLandmark"
                  size="small"
                  value={formik.values.newLandmark}
                  onChange={formik.handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          icon="mdi:map-marker"
                          sx={{ color: 'text.secondary', fontSize: 18 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  error={formik.touched.newLandmark && Boolean(formik.errors.newLandmark)}
                  helperText={formik.touched.newLandmark && formik.errors.newLandmark}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                <strong>Note:</strong> Your transport fee may change based on the new stop
                selection.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={!!(formik.touched.addressLine1 && formik.errors.addressLine1)}
              >
                <TextField
                  fullWidth
                  label="Address Line 1"
                  name="addressLine1"
                  size="small"
                  value={formik.values.addressLine1}
                  onChange={formik.handleChange}
                  error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
                  helperText={formik.touched.addressLine1 && formik.errors.addressLine1}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={!!(formik.touched.newAreaLocality && formik.errors.newAreaLocality)}
              >
                <TextField
                  fullWidth
                  label="Area/Locality/Road Name *"
                  name="newAreaLocality"
                  size="small"
                  value={formik.values.newAreaLocality}
                  onChange={formik.handleChange}
                  error={formik.touched.newAreaLocality && Boolean(formik.errors.newAreaLocality)}
                  helperText={formik.touched.newAreaLocality && formik.errors.newAreaLocality}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ShakingTextField
                error={!!(formik.touched.newDescription && formik.errors.newDescription)}
              >
                <TextField
                  fullWidth
                  label="Description / Reason *"
                  name="newDescription"
                  multiline
                  rows={2}
                  size="small"
                  value={formik.values.newDescription}
                  onChange={formik.handleChange}
                  error={formik.touched.newDescription && Boolean(formik.errors.newDescription)}
                  helperText={formik.touched.newDescription && formik.errors.newDescription}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        </SectionCard>
      </DialogScrollContent>

      {/* ACTION BUTTONS */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onClose(null, false)}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChangeStopRequestForm;
