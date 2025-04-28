import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, TextField } from '@mui/material';

import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { paymentMethodValidationSchema } from './validationSchema';

const HostelPaymentMethodDialog = (props: TabComponentType) => {
  const formik = useFormik({
    // Initial form values
    initialValues: {
      paymentMethodName: '',
    },
    // Validation schema for form fields
    validationSchema: paymentMethodValidationSchema,
    // Handle form submission
    onSubmit: (values) => {
      console.log('Submitted Payment Method:', values);
      // TODO: Implement API call or dispatch action to save payment method
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
              error={formik.touched.paymentMethodName && Boolean(formik.errors.paymentMethodName)}
            >
              <TextField
                size="small"
                fullWidth
                name="paymentMethodName"
                label="Payment Method Name"
                value={formik.values.paymentMethodName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.paymentMethodName && Boolean(formik.errors.paymentMethodName)}
                helperText={formik.touched.paymentMethodName && formik.errors.paymentMethodName}
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

export default HostelPaymentMethodDialog;
