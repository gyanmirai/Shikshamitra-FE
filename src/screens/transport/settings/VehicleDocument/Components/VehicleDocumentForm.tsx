'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { vehicleDocumentValidationSchema } from './VehicleDocumentValidation';
import { getVehicleDocumentInitialValues } from './VehicleDocumentInitialValues';

import type { IVehicleDocumentFormProps } from './type';

const acceptedFormats = ['Jpeg', 'PNG'];

const VehicleDocumentForm: React.FC<IVehicleDocumentFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getVehicleDocumentInitialValues(editData),
    validationSchema: vehicleDocumentValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `${values.documentName} Vehicle Document updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `${values.documentName} Vehicle Document added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Document Name */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.documentName && formik.errors.documentName) || false}
            >
              <TextField
                fullWidth
                label="Document Name *"
                name="documentName"
                size="small"
                value={formik.values.documentName}
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

                  formik.setFieldValue('documentName', value);
                }}
                error={formik.touched.documentName && Boolean(formik.errors.documentName)}
                helperText={formik.touched.documentName && formik.errors.documentName}
              />
            </ShakingTextField>
          </Grid>

          {/* Document Size */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.documentSize && formik.errors.documentSize) || false}
            >
              <TextField
                fullWidth
                label="Document Size (mb) *"
                name="documentSize"
                size="small"
                value={formik.values.documentSize}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
                  formik.setFieldValue('documentSize', value);
                }}
                error={formik.touched.documentSize && Boolean(formik.errors.documentSize)}
                helperText={formik.touched.documentSize && formik.errors.documentSize}
              />
            </ShakingTextField>
          </Grid>

          {/* Accepted Format */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.acceptedFormat && formik.errors.acceptedFormat) || false}
            >
              <CustomSelect
                label="Accepted Format *"
                name="acceptedFormat"
                options={acceptedFormats.map((format) => ({ value: format, label: format }))}
                formControlProps={{ fullWidth: true, size: 'small' }}
                value={formik.values.acceptedFormat}
                onChange={(value) => formik.setFieldValue('acceptedFormat', value)}
                error={formik.touched.acceptedFormat && Boolean(formik.errors.acceptedFormat)}
                helperText={
                  formik.touched.acceptedFormat ? formik.errors.acceptedFormat : undefined
                }
              />
            </ShakingTextField>
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
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default VehicleDocumentForm;
