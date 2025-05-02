import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { feeHeadValidationSchema } from './validationSchema';

const HostelFeeHeadDialog = () => {
  const formik = useFormik({
    // Initial form values
    initialValues: {
      feeHeadName: '',
    },
    // Validation schema for form fields
    validationSchema: feeHeadValidationSchema,
    // Handle form submission
    onSubmit: (values) => {
      console.log('Submitted Fee Head:', values);
      // TODO: Implement API call to save fee head data
      // TODO: Dispatch action to update store if using Redux
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
    >
      <Box p={2} display="flex" flexDirection="column" gap={3} flexGrow={1}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
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
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {}}
          variant="outlined"
        >
          Cancel
        </Button>
        <SubmitButton type="submit" />
      </Box>
    </form>
  );
};

export default HostelFeeHeadDialog;
