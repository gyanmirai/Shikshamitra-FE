import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { Grid, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialResourceCategoryValues } from '../initialValue';
import { addResourceCategoryValidationSchema } from '../validationSchema';

import type {
  IResourceCategoryFormValues,
  IAddResourceCategoryDialogProps,
} from '../resource-category-interface';

const AddResourceCategoryDialog: React.FC<IAddResourceCategoryDialogProps> = ({ data, isEdit }) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IResourceCategoryFormValues>(
    () => getInitialResourceCategoryValues(data),
    [data]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IResourceCategoryFormValues>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: addResourceCategoryValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });
  const isDisabled = !isEdit && data !== null;
  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} pb="10px">
            <ShakingTextField
              error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
            >
              <TextField
                name="categoryName"
                label="Category Name *"
                value={formik.values.categoryName}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                autoFocus
                disabled={isEdit}
                error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
                helperText={formik.touched.categoryName && formik.errors.categoryName}
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

export default AddResourceCategoryDialog;
