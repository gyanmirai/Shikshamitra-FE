import React from 'react';
import { useFormik } from 'formik';
import { Box, Grid, TextField } from '@mui/material';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { paymentMethodValidationSchema } from '../general-setting-inerface';

const PaymentMethodDialog = () => {
  const formik = useFormik({
    initialValues: {
      paymentMethodName: '',
    },
    validationSchema: paymentMethodValidationSchema,
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

export default PaymentMethodDialog;
