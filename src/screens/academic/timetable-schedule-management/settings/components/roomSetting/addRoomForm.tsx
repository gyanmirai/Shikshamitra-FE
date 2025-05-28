'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Close, Create } from '@mui/icons-material';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { validationSchema } from './validationSchema';

import type { IRoomCreationFormProps, IRoomCreationFormikValue } from './type';

const RoomCreationForm: React.FC<IRoomCreationFormProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
  isEdit,
  allData,
}) => {
  // State to track and display message when a duplicate room entry is attempted
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

  const formik = useFormik<IRoomCreationFormikValue>({
    initialValues: {
      roomNumber: isEdit ? (data.roomNumber ?? 0) : 0,
      buildingName: isEdit ? (data.buildingName ?? '') : '',
      floor: isEdit ? (data.floor ?? 0) : 0,
      capacity: isEdit ? (data.capacity ?? 0) : 0,
    },
    validationSchema,
    onSubmit: (values) => {
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

      const existingEntryIndex = allData.findIndex(
        (val: any) => normalize(val.roomNumber) === normalize(values.roomNumber)
      );
      if (!isEdit) {
        if (existingEntryIndex === -1) {
          setShowExistingEntryMessage(false);
          onSave(values);
        } else {
          setShowExistingEntryMessage(true);
        }
      } else {
        onSave(values);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={2}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.roomNumber && formik.errors.roomNumber)}>
                  <TextField
                    disabled={isEdit}
                    label="Room Name *"
                    placeholder="Enter Room Name"
                    size="small"
                    name="roomNumber"
                    type="number"
                    value={formik.values.roomNumber}
                    onChange={formik.handleChange}
                    fullWidth
                    error={!!(formik.touched.roomNumber && formik.errors.roomNumber)}
                    helperText={formik.touched.roomNumber && formik.errors.roomNumber}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.buildingName && formik.errors.buildingName)}
                >
                  <TextField
                    disabled={isEdit}
                    label="Building Name *"
                    placeholder="Enter Building Name"
                    size="small"
                    name="buildingName"
                    value={formik.values.buildingName}
                    onChange={formik.handleChange}
                    fullWidth
                    error={!!(formik.touched.buildingName && formik.errors.buildingName)}
                    helperText={formik.touched.buildingName && formik.errors.buildingName}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.floor && formik.errors.floor)}>
                  <TextField
                    disabled={isEdit}
                    name="floor"
                    label="Floor *"
                    placeholder="Enter Floor"
                    size="small"
                    type="number"
                    value={formik.values.floor}
                    onChange={formik.handleChange}
                    fullWidth
                    error={!!(formik.touched.floor && formik.errors.floor)}
                    helperText={formik.touched.floor && formik.errors.floor}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.capacity && formik.errors.capacity)}>
                  <TextField
                    name="capacity"
                    label="Room Capacity *"
                    placeholder="Enter Room Capacity"
                    type="number"
                    size="small"
                    value={formik.values.capacity}
                    onChange={formik.handleChange}
                    fullWidth
                    error={!!(formik.touched.capacity && formik.errors.capacity)}
                    helperText={formik.touched.capacity && formik.errors.capacity}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions>
            <Button
              startIcon={<Close />}
              onClick={() => {
                onClose(null, false);
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              startIcon={isEdit ? <Create /> : <Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {isEdit ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </Box>
    </BackPopUpChecked>
  );
};

export default RoomCreationForm;
