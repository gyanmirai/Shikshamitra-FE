import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { Grid, Button, TextField, DialogActions } from '@mui/material';

import { getInitialPaymentStatusValues } from './initialValues';
import { addPaymentStatusValidationSchema } from './validationSchema';

import type {
  IFinanceAddPaymentStatusInterface,
  IFinanceAddPaymentStatusDialogProps,
} from './finance-general-settings-interface';

const AddPaymentStatusDialog: React.FC<IFinanceAddPaymentStatusDialogProps> = ({
  isEditMode,
  data,
  onClose,
  onSave,
}) => {
  // Get initial values for the payment status form based on provided data
  const initialValues = getInitialPaymentStatusValues(data);

  // Initialize form handling using Formik hook with type safety
  const {
    values, // Current form values
    errors, // Validation errors
    touched, // Fields that have been touched/visited
    handleSubmit, // Form submission handler
    handleBlur, // Input blur handler
    isSubmitting, // Form submission status
    setSubmitting, // Function to update submission status
    setFieldValue,
  } = useFormik<IFinanceAddPaymentStatusInterface>({
    initialValues,
    validationSchema: addPaymentStatusValidationSchema,
    onSubmit: async (formValues) => {
      // Call the parent save handler with form values
      onSave?.(formValues);
      // Reset submission status after save
      setSubmitting(false);
    },
  });

  // Check if payment status name field has error and has been touched
  const isPaymentStatusNameError = touched.paymentStatusName && Boolean(errors.paymentStatusName);

  return (
    <form onSubmit={handleSubmit}>
      <Scrollbar
        sx={{
          p: 2,

          height: '100%',
        }}
      >
        <Grid container spacing={2}>
          <Grid size={12} pb="10px">
            <ShakingTextField error={isPaymentStatusNameError}>
              <TextField
                size="small"
                fullWidth
                name="paymentStatusName"
                label="Payment Status Name *"
                value={values.paymentStatusName}
                onChange={(e) => {
                  const value = e.target.value
                    // Remove everything except letters and spaces
                    .replace(/[^a-zA-Z0-9\s]/g, '');
                  setFieldValue('paymentStatusName', value);
                }}
                onBlur={handleBlur}
                error={isPaymentStatusNameError}
                helperText={touched.paymentStatusName && errors.paymentStatusName}
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
          startIcon={
            <Iconify
              icon={isEditMode ? GlobalIcons.edit : GlobalIcons.submit}
              width={isEditMode ? 16 : 20}
              height={isEditMode ? 16 : 20}
            />
          }
          disabled={isSubmitting}
          size="small"
        >
          {isEditMode ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </form>
  );
};

export default AddPaymentStatusDialog;
