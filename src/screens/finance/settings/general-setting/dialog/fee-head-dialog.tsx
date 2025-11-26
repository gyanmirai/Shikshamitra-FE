import React from 'react';
import { useFormik } from 'formik';
import { Box, Grid, TextField } from '@mui/material';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { feeHeadValidationSchema } from '../general-setting-inerface';

const FeeHeadDialog = () => {
  const formik = useFormik({
    initialValues: {
      feeHeadName: '',
    },
    validationSchema: feeHeadValidationSchema,
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
              error={formik.touched.feeHeadName && Boolean(formik.errors.feeHeadName)}
            >
              <TextField
                size="small"
                fullWidth
                name="feeHeadName"
                label="Fee Head Name"
                value={formik.values.feeHeadName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.feeHeadName && Boolean(formik.errors.feeHeadName)}
                helperText={formik.touched.feeHeadName && formik.errors.feeHeadName}
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

export default FeeHeadDialog;
