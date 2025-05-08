import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { Grid, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { getResourceConditionStatusInitialValues } from '../initialValue';
import { resourceConditionStatusValidationSchema } from '../validationSchema';

import type {
  IAddResourceConditionDialogProps,
  IResourceConditionStatusFormValues,
} from '../resource-condition-interface';

const AddResourceConditionDialog: React.FC<IAddResourceConditionDialogProps> = ({
  data,
  isEdit,
  onClose,
}) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`
  const initialValues = useMemo<IResourceConditionStatusFormValues>(
    () => getResourceConditionStatusInitialValues(data),
    [data]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IResourceConditionStatusFormValues>({
    initialValues,

    validationSchema: resourceConditionStatusValidationSchema,

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
          <Grid item xs={12} md={12} pb="10px">
            <ShakingTextField
              error={
                formik.touched.resourceConditionStatusName &&
                Boolean(formik.errors.resourceConditionStatusName)
              }
            >
              <TextField
                name="resourceConditionStatusName"
                label="Resource Condition Name *"
                value={formik.values.resourceConditionStatusName}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                disabled={isDisabled}
                error={
                  formik.touched.resourceConditionStatusName &&
                  Boolean(formik.errors.resourceConditionStatusName)
                }
                helperText={
                  formik.touched.resourceConditionStatusName &&
                  formik.errors.resourceConditionStatusName
                }
              />
            </ShakingTextField>
          </Grid>

          {/* Subcategory Field */}
          <Grid item xs={12} md={12} pb="10px">
            <ShakingTextField
              error={
                formik.touched.resourceConditionStatusDescription &&
                Boolean(formik.errors.resourceConditionStatusDescription)
              }
            >
              <TextField
                multiline
                rows={4}
                name="resourceConditionStatusDescription"
                label="Resource Condition Description *"
                value={formik.values.resourceConditionStatusDescription}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                disabled={isDisabled}
                error={
                  formik.touched.resourceConditionStatusDescription &&
                  Boolean(formik.errors.resourceConditionStatusDescription)
                }
                helperText={
                  formik.touched.resourceConditionStatusDescription &&
                  formik.errors.resourceConditionStatusDescription
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

export default AddResourceConditionDialog;
