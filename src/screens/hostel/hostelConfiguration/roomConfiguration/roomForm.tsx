import React from 'react';
import { useFormik } from 'formik';
// eslint-disable-next-line import/no-duplicates
import { Autocomplete } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
// eslint-disable-next-line import/no-duplicates
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IRoomFormProps } from './type'; // Update types to match `IHostelRoom`

import { roomInitialValues } from './roomInitialValues';
import { hostelRoomValidationSchema } from './roomValidationSchema';

const AddRoomForm: React.FC<IRoomFormProps> = ({ open, onClose, editData }) => {
  // Available room types that can be selected
  const roomTypeOptions = ['Single', 'Double', 'Triple'];

  // Possible status options for a room
  const statusOptions = ['Available', 'Occupied', 'Maintenance'];

  // Initialize formik form handling with validation and submission logic
  const formik = useFormik({
    // Set initial form values, using editData if available for editing existing room
    initialValues: roomInitialValues(editData),
    validationSchema: hostelRoomValidationSchema,
    // Handle form submission
    onSubmit: (values) => {
      console.log('Room Form Data:', values);
    },
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.roomName && formik.errors.roomName)}>
                  <TextField
                    size="small"
                    label="Room Name *"
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
                <ShakingTextField error={!!(formik.touched.roomType && formik.errors.roomType)}>
                  <Autocomplete
                    options={roomTypeOptions}
                    value={formik.values.roomType}
                    onChange={(e, val) => formik.setFieldValue('roomType', val)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Room Type *"
                        error={formik.touched.roomType && Boolean(formik.errors.roomType)}
                        helperText={formik.touched.roomType && formik.errors.roomType}
                      />
                    )}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.floorNumber && formik.errors.floorNumber)}
                >
                  <TextField
                    size="small"
                    label="Floor Number *"
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
                  error={!!(formik.touched.roomCapacity && formik.errors.roomCapacity)}
                >
                  <TextField
                    size="small"
                    label="Room Capacity *"
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
                <ShakingTextField error={!!(formik.touched.status && formik.errors.status)}>
                  <Autocomplete
                    options={statusOptions}
                    value={formik.values.status}
                    onChange={(e, val) => formik.setFieldValue('status', val)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Room Status *"
                        error={formik.touched.status && Boolean(formik.errors.status)}
                        helperText={formik.touched.status && formik.errors.status}
                      />
                    )}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                {formik.values.roomType && (
                  <Box mt={2}>
                    <CustomizableTable
                      tableId="room-facility-quantities"
                      isShowedDense={false}
                      isFilter={false}
                      isPagination={false}
                      columns={[
                        { id: 'facility', label: 'facility' },
                        {
                          id: 'quantity',
                          label: 'quantity',
                          filterType: 'number',
                          render: (value, row) => (
                            <TextField
                              type="number"
                              size="small"
                              placeholder="Quantity"
                              label="Quantity"
                              value={formik.values.facilityQuantities[row.id]?.quantity}
                              onChange={(e) => {
                                const newQuantities = [...formik.values.facilityQuantities];
                                const index = newQuantities.findIndex((item) => item.id === row.id);
                                if (index !== -1) {
                                  newQuantities[index] = {
                                    ...newQuantities[index],
                                    quantity: parseInt(e.target.value, 10) || 0,
                                  };
                                  formik.setFieldValue('facilityQuantities', newQuantities);
                                }
                              }}
                            />
                          ),
                        },
                      ]}
                      data={[
                        { id: 'wifi', facility: 'Wi-Fi', quantity: 0 },
                        { id: 'gym', facility: 'Gym', quantity: 0 },
                        { id: 'laundry', facility: 'Laundry', quantity: 0 },
                        { id: 'ac', facility: 'Air Conditioning', quantity: 0 },
                        { id: 'tv', facility: 'Television', quantity: 0 },
                      ]}
                    />
                  </Box>
                )}
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
              {editData ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default AddRoomForm;
