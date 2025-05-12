import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { Grid, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { getResourceStatusInitialValues } from '../initialValue';
import { resourceStatusValidationSchema } from '../validationSchema';

import type {
  IResourceStatusFormValues,
  IAddResourceSubCategoryDialogProps,
} from '../resource-status-interface';

const ResourceStatusDialog: React.FC<IAddResourceSubCategoryDialogProps> = ({ data, isEdit }) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`
  const initialValues = useMemo<IResourceStatusFormValues>(
    () => getResourceStatusInitialValues(data),
    [data]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IResourceStatusFormValues>({
    initialValues,

    validationSchema: resourceStatusValidationSchema,

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
              error={formik.touched.resourceStatusName && Boolean(formik.errors.resourceStatusName)}
            >
              <TextField
                name="resourceStatusName"
                label="Resource Status Name *"
                value={formik.values.resourceStatusName}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                disabled={isDisabled}
                error={
                  formik.touched.resourceStatusName && Boolean(formik.errors.resourceStatusName)
                }
                helperText={formik.touched.resourceStatusName && formik.errors.resourceStatusName}
              />
            </ShakingTextField>
          </Grid>

          {/* Subcategory Field */}
          <Grid item xs={12} md={12} pb="10px">
            <ShakingTextField
              error={
                formik.touched.resourceStatusDescription &&
                Boolean(formik.errors.resourceStatusDescription)
              }
            >
              <TextField
                multiline
                rows={4}
                name="resourceStatusDescription"
                label="Resource Status Description *"
                value={formik.values.resourceStatusDescription}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                disabled={isDisabled}
                error={
                  formik.touched.resourceStatusDescription &&
                  Boolean(formik.errors.resourceStatusDescription)
                }
                helperText={
                  formik.touched.resourceStatusDescription &&
                  formik.errors.resourceStatusDescription
                }
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </form>
  );
};

export default ResourceStatusDialog;
