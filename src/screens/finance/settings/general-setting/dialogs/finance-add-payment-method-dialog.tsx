import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialPaymentMethodValues } from './initialValues';
import { addPaymentMethodValidationSchema } from './validationSchema';

import type {
  IFinanceAddPaymentMethodInterface,
  IFinanceAddPaymentMethodDialogProps,
} from './finance-general-settings-interface';

const AddPaymentMethodDialog: React.FC<IFinanceAddPaymentMethodDialogProps> = ({
  isEditMode,
  data,
  onClose,
  onSave,
}) => {
  // Get initial values for the payment method form based on provided data
  const initialValues = getInitialPaymentMethodValues(data);

  // Initialize form handling using Formik with type-safe validation
  const {
    values, // Current form values
    errors, // Validation errors for each field
    touched, // Tracks which fields have been touched/visited
    handleSubmit, // Form submission handler
    handleChange, // Input change handler
    handleBlur, // Input blur handler
    isSubmitting, // Flag indicating if form is currently submitting
    setSubmitting, // Function to manually set submission state
  } = useFormik<IFinanceAddPaymentMethodInterface>({
    initialValues,
    validationSchema: addPaymentMethodValidationSchema,
    onSubmit: async (formValues) => {},
  });

  // Check if payment method name field has been touched and has validation errors
  const isMethodNameError = touched.paymentMethodName && Boolean(errors.paymentMethodName);
  return (
    <form onSubmit={handleSubmit}>
      <Scrollbar
        sx={{
          p: 2,

          height: '100%',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} pb="10px">
            <ShakingTextField error={isMethodNameError}>
              <TextField
                size="small"
                fullWidth
                name="paymentMethodName"
                label="Payment Method Name *"
                value={values.paymentMethodName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={isMethodNameError}
                helperText={touched.paymentMethodName && errors.paymentMethodName}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Scrollbar>

      <DialogActions>
        <Box display="flex" gap={2} width="100%" flexDirection="row" justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            disabled={isSubmitting}
          >
            {isEditMode ? 'Update' : 'Submit'}
          </Button>
        </Box>
      </DialogActions>
    </form>
  );
};
export default AddPaymentMethodDialog;
