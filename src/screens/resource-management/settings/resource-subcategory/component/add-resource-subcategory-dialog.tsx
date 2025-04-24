import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { Grid, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialSubCategoryValues } from '../initialValue';
import { addSubCategoryValidationSchema } from '../validationSchema';

import type {
  IResourceSubCategoryFormValues,
  IAddResourceSubCategoryDialogProps,
} from '../resource-subcategory-interface';

const AddSubCategoryDialog: React.FC<IAddResourceSubCategoryDialogProps> = ({ data, isEdit }) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`
  const initialValues = useMemo<IResourceSubCategoryFormValues>(
    () => getInitialSubCategoryValues(data, isEdit),
    [data, isEdit]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IResourceSubCategoryFormValues>({
    initialValues,

    validationSchema: addSubCategoryValidationSchema,

    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          {/* Category Name Field */}
          <Grid item xs={12} pb="10px">
            <ShakingTextField
              error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
            >
              <TextField
                name="categoryName"
                label="Category Name"
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

          {/* Subcategory Field */}
          <Grid item xs={12} pb="10px">
            <ShakingTextField
              error={formik.touched.subcategoryName && Boolean(formik.errors.subcategoryName)}
            >
              <TextField
                name="subcategoryName"
                label="Subcategory Name"
                value={formik.values.subcategoryName}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                disabled={isEdit}
                error={formik.touched.subcategoryName && Boolean(formik.errors.subcategoryName)}
                helperText={formik.touched.subcategoryName && formik.errors.subcategoryName}
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

export default AddSubCategoryDialog;
