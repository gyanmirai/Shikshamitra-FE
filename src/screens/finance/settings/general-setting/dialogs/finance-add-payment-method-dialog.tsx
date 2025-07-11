import React from 'react';
import { useFormik } from 'formik';

import { Grid, Button, TextField, DialogActions } from '@mui/material';

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
    setFieldValue,
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
                label="Payment Method *"
                value={values.paymentMethodName}
                onChange={(e) => {
                  const value = e.target.value
                    // Remove everything except letters and spaces
                    .replace(/[^a-zA-Z0-9\s]/g, '');
                  setFieldValue('paymentMethodName', value);
                }}
                onBlur={handleBlur}
                error={isMethodNameError}
                helperText={touched.paymentMethodName && errors.paymentMethodName}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Scrollbar>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
          size="small"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="small"
          startIcon={
            <Iconify
              icon={isEditMode ? GlobalIcons.edit : GlobalIcons.submit}
              width={isEditMode ? 16 : 20}
              height={isEditMode ? 16 : 20}
            />
          }
          disabled={isSubmitting}
        >
          {isEditMode ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </form>
  );
};
export default AddPaymentMethodDialog;
