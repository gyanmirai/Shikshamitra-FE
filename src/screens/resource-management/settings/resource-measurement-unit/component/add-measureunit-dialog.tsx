import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { Grid, TextField, DialogActions } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { getResourceMeasurementUnitInitialValues } from '../initialValue';
import { resourceMeasurementUnitValidationSchema } from '../validationSchema';

import type {
  IResourceMeasurementUnitFormValues,
  IResourceMeasurementUnitDialogProps,
} from '../resource-measurement-unit-interface';

const AddMeasurementUnitDialog: React.FC<IResourceMeasurementUnitDialogProps> = ({
  data,
  isEdit,
  onClose,
}) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`
  const initialValues = useMemo<IResourceMeasurementUnitFormValues>(
    () => getResourceMeasurementUnitInitialValues(data),
    [data]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IResourceMeasurementUnitFormValues>({
    initialValues,

    validationSchema: resourceMeasurementUnitValidationSchema,

    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });

  const isDisabled = !isEdit && data !== null;

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          {/* Category Name Field */}
          <Grid size={12} pb="10px">
            <ShakingTextField
              error={
                formik.touched.resourceMeasurementUnit &&
                Boolean(formik.errors.resourceMeasurementUnit)
              }
            >
              <TextField
                name="resourceMeasurementUnit"
                label="Resource Measurement Unit *"
                value={formik.values.resourceMeasurementUnit}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                disabled={isDisabled}
                error={
                  formik.touched.resourceMeasurementUnit &&
                  Boolean(formik.errors.resourceMeasurementUnit)
                }
                helperText={
                  formik.touched.resourceMeasurementUnit && formik.errors.resourceMeasurementUnit
                }
              />
            </ShakingTextField>
          </Grid>

          {/* Subcategory Field */}
          <Grid size={12} pb="10px">
            <ShakingTextField
              error={
                formik.touched.resourceMeasurementUnitDescription &&
                Boolean(formik.errors.resourceMeasurementUnitDescription)
              }
            >
              <TextField
                multiline
                rows={4}
                name="resourceMeasurementUnitDescription"
                label="Description *"
                value={formik.values.resourceMeasurementUnitDescription}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                disabled={isDisabled}
                error={
                  formik.touched.resourceMeasurementUnitDescription &&
                  Boolean(formik.errors.resourceMeasurementUnitDescription)
                }
                helperText={
                  formik.touched.resourceMeasurementUnitDescription &&
                  formik.errors.resourceMeasurementUnitDescription
                }
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <CancelButton onClick={onClose} />
        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </form>
  );
};

export default AddMeasurementUnitDialog;
