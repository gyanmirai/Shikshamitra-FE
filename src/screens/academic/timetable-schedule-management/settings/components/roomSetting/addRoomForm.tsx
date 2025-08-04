'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Close } from '@mui/icons-material';
import { Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
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
      roomNumber: isEdit ? (data.roomNumber ?? 0) : '',
      buildingName: isEdit ? (data.buildingName ?? '') : '',
      floor: isEdit ? (data.floor ?? 0) : '',
      capacity: isEdit ? (data.capacity ?? 0) : '',
    },
    validationSchema,
    onSubmit: (values) => {
      if (!isEdit) {
        shikshaMitraToast.success({
          message: `Room number ${values.roomNumber} has been added successfully.`,
        });
        onClose(null, true);
      } else {
        shikshaMitraToast.success({
          message: `Room number ${values.roomNumber} has been updated successfully.`,
        });
        onClose(null, true);
        // onSave(values);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent sx={{ p: 2 }}>
        {/* <form onSubmit={formik.handleSubmit}> */}
        {/* <Scrollbar sx={{ p: 2, height: '150px' }}> */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ShakingTextField error={!!(formik.touched.roomNumber && formik.errors.roomNumber)}>
              <TextField
                disabled={isEdit}
                label="Room No. *"
                // placeholder="Enter Room Number"
                size="small"
                name="roomNumber"
                type="number"
                inputProps={{ min: 0 }}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                value={formik.values.roomNumber}
                onChange={formik.handleChange}
                fullWidth
                error={!!(formik.touched.roomNumber && formik.errors.roomNumber)}
                helperText={formik.touched.roomNumber && formik.errors.roomNumber}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <ShakingTextField error={!!(formik.touched.buildingName && formik.errors.buildingName)}>
              <TextField
                disabled={isEdit}
                label="Building Name *"
                // placeholder="Enter Building Name"
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
                inputProps={{ min: 0 }}
                // placeholder="Enter Floor"
                size="small"
                type="number"
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
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
                // placeholder="Enter Room Capacity"
                type="number"
                inputProps={{ min: 0 }}
                size="small"
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                value={formik.values.capacity}
                onChange={formik.handleChange}
                fullWidth
                error={!!(formik.touched.capacity && formik.errors.capacity)}
                helperText={formik.touched.capacity && formik.errors.capacity}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
        {/* </Scrollbar> */}

        {/* </form> */}
      </DialogScrollContent>
      <DialogActions>
        <Button
          startIcon={<Close />}
          onClick={() => {
            onClose(null, false);
          }}
          size="small"
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          startIcon={
            <Iconify
              icon={isEdit ? GlobalIcons.edit : GlobalIcons.submit}
              width={isEdit ? 16 : 20}
              height={isEdit ? 16 : 20}
            />
          }
          form="dialog-form"
          onClick={() => formik.handleSubmit()}
          size="small"
          variant="contained"
        >
          {isEdit ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default RoomCreationForm;
