import React from 'react';
import { useFormik } from 'formik';
import { Box, Grid, TextField } from '@mui/material';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { categoryValidationSchema } from '../general-setting-inerface';

const BudgetCategoryDialog = () => {
  const formik = useFormik({
    initialValues: {
      categoryName: '',
    },
    validationSchema: categoryValidationSchema,
    onSubmit: (values) => {
      // Add dispatch or API call here
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
    >
      <Box p={2} display="flex" flexDirection="column" gap={3} flexGrow={1}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <ShakingTextField
              error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
            >
              <TextField
                size="small"
                fullWidth
                name="categoryName"
                label="Budget Main Category"
                value={formik.values.categoryName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
                helperText={formik.touched.categoryName && formik.errors.categoryName}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Box>

      <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
        <SubmitButton type="submit" />
      </Box>
    </form>
  );
};

export default BudgetCategoryDialog;
