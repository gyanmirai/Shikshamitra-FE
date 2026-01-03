'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { DocumentTypeArray } from 'src/enums/documnet-type';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddVehicleDocumentMutation,
  useUpdateVehicleDocumentMutation,
} from 'src/redux/transport/vehicle-management/vehicleSettingsApi';
import {
  Chip,
  Grid,
  Button,
  Switch,
  Checkbox,
  TextField,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { vehicleDocumentValidationSchema } from './VehicleDocumentValidation';
import { getVehicleDocumentInitialValues } from './VehicleDocumentInitialValues';

import type { IVehicleDocumentFormProps } from './type';

const VehicleDocumentForm: React.FC<IVehicleDocumentFormProps> = ({ open, onClose, editData }) => {
  const { addVehicleDocument, isLoading: isAdding } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddVehicleDocumentMutation,
  });
  const { updateVehicleDocument, isLoading: isUpdating } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateVehicleDocumentMutation,
  });

  const formik = useFormik({
    initialValues: getVehicleDocumentInitialValues(editData),
    validationSchema: vehicleDocumentValidationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.documentName,
          maxSizeMb: Number(values.documentSize),
          acceptedFormats: values.acceptedFormat,
          isRequired: values.required,
          isActive: true,
        };

        if (editData) {
          await updateVehicleDocument({
            documentId: editData.id,
            body: payload,
          });
          shikshaMitraToast.success({
            message: `Vehicle Document: ${values.documentName} updated successfully`,
          });
        } else {
          await addVehicleDocument(payload);
          shikshaMitraToast.success({
            message: `Vehicle Document: ${values.documentName} added successfully`,
          });
        }
        onClose(null, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to save vehicle document',
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
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
                disabled
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
              error={formik.touched.acceptedFormat && Boolean(formik.errors.acceptedFormat)}
            >
              <Autocomplete
                multiple
                options={DocumentTypeArray}
                disableCloseOnSelect
                getOptionLabel={(option) => option.label}
                value={
                  // Convert Formik's array of values (numbers/strings) into full option objects
                  DocumentTypeArray.filter((opt) =>
                    formik.values.acceptedFormat?.includes(opt.value)
                  )
                }
                onChange={(_, newValue) => {
                  // Store only the value fields in Formik
                  formik.setFieldValue(
                    'acceptedFormat',
                    newValue.map((option) => option.value)
                  );
                }}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                renderOption={(props, option, { selected }) => {
                  const { key, ...rest } = props;
                  return (
                    <li key={key} {...rest}>
                      <Checkbox
                        icon={<CheckBoxOutlineBlank />}
                        checkedIcon={<CheckBox />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.label}
                    </li>
                  );
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.label}
                      {...getTagProps({ index })}
                      key={option.value}
                      variant="soft"
                      size="small"
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Accepted Format *"
                    size="small"
                    error={Boolean(formik.touched.acceptedFormat && formik.errors.acceptedFormat)}
                    helperText={
                      (formik.touched.acceptedFormat && formik.errors.acceptedFormat) as string
                    }
                  />
                )}
              />
            </ShakingTextField>
          </Grid>

          {/* Required Toggle */}
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.required}
                  onChange={(e) => formik.setFieldValue('required', e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={formik.values.required ? 'Required' : 'Optional'}
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

export default VehicleDocumentForm;
