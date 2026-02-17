'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { sliderClasses } from '@mui/material/Slider';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, Slider, TextField, Typography, DialogActions } from '@mui/material';
import {
  useAddVehicleTypeMutation,
  useUpdateVehicleTypeMutation,
} from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import { vehicleTypeValidationSchema } from './VehicleTypeValidation';
import { getVehicleTypeInitialValues } from './VehicleTypeInitialValues';

import type { IVehicleTypeFormProps } from './type';

const VehicleTypeForm: React.FC<IVehicleTypeFormProps> = ({ open, onClose, editData }) => {
  const [addVehicleType, { isLoading: isAdding }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddVehicleTypeMutation,
  });
  const [updateVehicleType, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateVehicleTypeMutation,
  });

  const formik = useFormik({
    initialValues: getVehicleTypeInitialValues(editData),
    validationSchema: vehicleTypeValidationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.typeName,
          approxSittingRange: `${values.vehicleRange[0]}-${values.vehicleRange[1]}`,
          description: values.description || '',
          isActive: true,
        };

        if (editData) {
          await updateVehicleType({
            vehicleTypeId: editData.id,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `Vehicle Type: ${values.typeName} updated successfully`,
          });
        } else {
          await addVehicleType(payload).unwrap();
          shikshaMitraToast.success({
            message: `Vehicle Type: ${values.typeName} added successfully`,
          });
        }
        onClose(null, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to save vehicle type',
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Vehicle Type Name */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.typeName && formik.errors.typeName) || false}
            >
              <TextField
                fullWidth
                label="Type Name *"
                name="typeName"
                size="small"
                value={formik.values.typeName}
                onChange={(e) => {
                  let value = e.target.value
                    .replace(/[^a-zA-Z0-9\s]/g, '') // Allow letters, numbers, spaces
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/^\d+/, '') // Remove leading numbers
                    .trimStart(); // Remove leading spaces
                  value = value
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');

                  formik.setFieldValue('typeName', value);
                }}
                error={formik.touched.typeName && Boolean(formik.errors.typeName)}
                helperText={formik.touched.typeName && formik.errors.typeName}
              />
            </ShakingTextField>
          </Grid>{' '}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1">Approx Sitting Range</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Slider
              value={formik.values.vehicleRange}
              onChange={(event, newValue) => {
                formik.setFieldValue('vehicleRange', newValue);
              }}
              valueLabelDisplay="auto"
              getAriaValueText={(value) => `${value}`}
              min={0}
              max={100}
              step={1}
              sx={{
                color: '#00a86b', // custom green bar color
                [`& .${sliderClasses.mark}[data-index="3"]`]: { display: 'none' },
                [`& .${sliderClasses.valueLabel}`]: {
                  backgroundColor: '#1e1e1e',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              size="small"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <Button
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
          disabled={isAdding || isUpdating}
        >
          {isAdding || isUpdating ? 'Saving...' : editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default VehicleTypeForm;
