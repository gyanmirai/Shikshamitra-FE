'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { getRoomAllocateInitialValues } from './getRoomAllocateInitialValues';

import type { IHostelRequestFormType } from '../../newRequest/components/type';

const RoomAllocateForm: React.FC<{
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IHostelRequestFormType | null;
  disabled?: boolean;
}> = ({ open, onClose, editData, disabled }) => {
  // Initialize form using Formik
  const formik = useFormik({
    // Set initial form values from edit data or default values
    initialValues: getRoomAllocateInitialValues(editData),
    // Apply validation schema
    validationSchema: Yup.object({
      hostelType: Yup.string().required('Hostel Type is required'),
      hostelName: Yup.string().required('Hostel Name is required'),
      roomName: Yup.string().required('Room Name is required'),
    }),
    // Handle form submission
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const roomOptions = [
    { value: 'Room 101', label: 'Room 101' },
    { value: 'Room 102', label: 'Room 102' },
    { value: 'Room 103', label: 'Room 103' },
    { value: 'Room 104', label: 'Room 104' },
    { value: 'Room 105', label: 'Room 105' },
  ];
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              {/* Hostel Type */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.hostelType && formik.errors.hostelType)}>
                  <CustomSelect
                    size="small"
                    label="Hostel Type *"
                    disabled
                    name="hostelType"
                    fullWidth
                    value={formik.values.hostelType}
                    options={[
                      { value: 'boys', label: 'Boys' },
                      { value: 'girls', label: 'Girls' },
                    ]}
                    onChange={(val) => formik.setFieldValue('hostelType', val)}
                    error={formik.touched.hostelType && Boolean(formik.errors.hostelType)}
                    helperText={
                      formik.touched.hostelType && formik.errors.hostelType
                        ? String(formik.errors.hostelType)
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              {/* Hostel Name */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.hostelName && formik.errors.hostelName)}>
                  <CustomSelect
                    size="small"
                    label="Hostel Name *"
                    name="hostelName"
                    disabled
                    fullWidth
                    options={[
                      { value: 'Hostel A', label: 'Hostel A' },
                      { value: 'Hostel B', label: 'Hostel B' },
                      { value: 'Hostel C', label: 'Hostel C' },
                      { value: 'Hostel D', label: 'Hostel D' },
                      { value: 'Hostel E', label: 'Hostel E' },
                    ]}
                    value={formik.values.hostelName}
                    onChange={(val) => formik.setFieldValue('hostelName', val)}
                    error={formik.touched.hostelName && Boolean(formik.errors.hostelName)}
                    helperText={
                      formik.touched.hostelName && formik.errors.hostelName
                        ? String(formik.errors.hostelName)
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              {/* Room Name */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.roomName && formik.errors.roomName)}>
                  <Autocomplete
                    options={roomOptions}
                    getOptionLabel={(option) => option.label}
                    value={roomOptions.find((o) => o.value === formik.values.roomName) || null}
                    onChange={(_, newValue) =>
                      formik.setFieldValue('roomName', newValue?.value || '')
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Room Number *"
                        size="small"
                        error={formik.touched.roomName && Boolean(formik.errors.roomName)}
                        helperText={formik.touched.roomName && formik.errors.roomName}
                      />
                    )}
                    disabled={disabled}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose(null, false);
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              {editData ? 'Assign' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default RoomAllocateForm;
