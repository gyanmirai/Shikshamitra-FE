'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { fuelTypeValidationSchema } from './FuelTypeValidation';
import { getFuelTypeInitialValues } from './FuelTypeInitialValues';

import type { IFuelTypeFormProps } from './type';

const FuelTypeForm: React.FC<IFuelTypeFormProps> = ({ onClose, editData }) => {
  const formik = useFormik({
    initialValues: getFuelTypeInitialValues(editData),
    validationSchema: fuelTypeValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `${values.typeName} Fuel Type updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `${values.typeName} Fuel Type added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Fuel Type Name */}
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
                    .replace(/[^a-zA-Z\s]/g, '') // Allow letters, numbers, spaces
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
          variant="contained"
          size="small"
          onClick={() => formik.handleSubmit()}
        >
          {editData ? 'Update' : 'Save'}
        </Button>{' '}
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default FuelTypeForm;
