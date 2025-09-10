import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getRoomInitialValues } from './initialValues';
import { hostelRoomValidationSchema } from './validationSchema';

import type { IRoomFormProps } from '../type';

const RoomDetailComp: React.FC<IRoomFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getRoomInitialValues(editData),
    validationSchema: hostelRoomValidationSchema,
    onSubmit: (values, formikHelpers) => {
      console.log(values);
    },
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.roomName && formik.errors.roomName) || false}
                >
                  <TextField
                    disabled
                    size="small"
                    label="Room Name"
                    name="roomName"
                    fullWidth
                    value={formik.values.roomName}
                    onChange={formik.handleChange}
                    error={formik.touched.roomName && Boolean(formik.errors.roomName)}
                    helperText={formik.touched.roomName && formik.errors.roomName}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.roomType && formik.errors.roomType) || false}
                >
                  <CustomSelect
                    disabled
                    label="Room Type"
                    options={[
                      { value: 'Single', label: 'Single' },
                      { value: 'Double', label: 'Double' },
                      { value: 'Triple', label: 'Triple' },
                    ]}
                    value={formik.values.roomType}
                    onChange={(val) => formik.setFieldValue('roomType', val)}
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                    error={formik.touched.roomType && Boolean(formik.errors.roomType)}
                    helperText={(formik.touched.roomType && formik.errors.roomType) || undefined}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.floorNumber && formik.errors.floorNumber) || false}
                >
                  <TextField
                    disabled
                    size="small"
                    label="Floor Number"
                    name="floorNumber"
                    type="number"
                    fullWidth
                    value={formik.values.floorNumber}
                    onChange={formik.handleChange}
                    error={formik.touched.floorNumber && Boolean(formik.errors.floorNumber)}
                    helperText={formik.touched.floorNumber && formik.errors.floorNumber}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.roomCapacity && formik.errors.roomCapacity) || false}
                >
                  <TextField
                    disabled
                    size="small"
                    label="Room Capacity"
                    name="roomCapacity"
                    type="number"
                    fullWidth
                    value={formik.values.roomCapacity}
                    onChange={formik.handleChange}
                    error={formik.touched.roomCapacity && Boolean(formik.errors.roomCapacity)}
                    helperText={formik.touched.roomCapacity && formik.errors.roomCapacity}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={
                    !!(formik.touched.currentOccupation && formik.errors.currentOccupation) || false
                  }
                >
                  <TextField
                    disabled
                    size="small"
                    label="Current Occupation"
                    name="currentOccupation"
                    type="number"
                    fullWidth
                    value={formik.values.currentOccupation}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.currentOccupation && Boolean(formik.errors.currentOccupation)
                    }
                    helperText={formik.touched.currentOccupation && formik.errors.currentOccupation}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.bed && formik.errors.bed) || false}>
                  <CustomSelect
                    label="Select Bed"
                    options={[
                      { value: 'Single', label: 'Single' },
                      { value: 'Double', label: 'Double' },
                      { value: 'Triple', label: 'Triple' },
                      { value: 'Quadruple', label: 'Quadruple' },
                      { value: 'Queen', label: 'Queen' },
                      { value: 'King', label: 'King' },
                      { value: 'Twin', label: 'Twin' },
                      { value: 'Double Twin', label: 'Double Twin' },
                      { value: 'Bunk Bed', label: 'Bunk Bed' },
                    ]}
                    value={formik.values.bed}
                    onChange={(val) => formik.setFieldValue('bed', val)}
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                    error={formik.touched.bed && Boolean(formik.errors.bed)}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.roomStatus && formik.errors.roomStatus) || false}
                >
                  <CustomSelect
                    disabled
                    label="Room Status"
                    options={[
                      { value: 'Available', label: 'Available' },
                      { value: 'Occupied', label: 'Occupied' },
                      { value: 'Maintenance', label: 'Maintenance' },
                    ]}
                    value={formik.values.roomStatus}
                    onChange={(val) => formik.setFieldValue('roomStatus', val)}
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                    error={formik.touched.roomStatus && Boolean(formik.errors.roomStatus)}
                    helperText={
                      (formik.touched.roomStatus && formik.errors.roomStatus) || undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onClose}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Confirm Allocate
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default RoomDetailComp;
