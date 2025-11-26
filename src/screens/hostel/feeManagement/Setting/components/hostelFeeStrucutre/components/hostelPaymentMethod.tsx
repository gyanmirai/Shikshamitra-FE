import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import { Box, Grid, Button, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

const HostelPaymentMethodDialog = (props: TabComponentType) => {
  const formik = useFormik({
    // Initial form values
    initialValues: {
      paymentMethodName: '',
    },
    // Validation schema for form fields
    validationSchema: yup.object({
      paymentMethodName: yup.string().required('Fee Head Name is required'),
    }),
    // Handle form submission
    onSubmit: (values) => {
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

export default HostelPaymentMethodDialog;
