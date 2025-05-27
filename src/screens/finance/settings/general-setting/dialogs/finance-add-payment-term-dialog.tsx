import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialPaymentTermValues } from './initialValues';
import { addPaymentTermValidationSchema } from './validationSchema';

import type {
  IFinanceAddPaymentTermInterface,
  IFinanceAddPaymentTermDialogProps,
} from './finance-general-settings-interface';

const AddPaymentTermDialog: React.FC<IFinanceAddPaymentTermDialogProps> = ({
  isEditMode,
  data,
  onClose,
  onSave,
}) => {
  // Get initial values for the payment term form based on provided data
  const initialValues = getInitialPaymentTermValues(data);

  // Initialize form handling using Formik hook with type safety
  const {
    values, // Current form values
    errors, // Validation errors for each field
    touched, // Tracks which fields have been touched/visited
    handleSubmit, // Form submission handler
    handleChange, // Input change handler
    handleBlur, // Input blur handler
    isSubmitting, // Flag indicating if form is currently submitting
    setSubmitting, // Function to update submission state
  } = useFormik<IFinanceAddPaymentTermInterface>({
    initialValues,
    validationSchema: addPaymentTermValidationSchema,
    onSubmit: async (formValues) => {
      // Handle form submission by calling the provided save callback
      onSave?.(formValues);
      // Reset submission state after save is complete
      setSubmitting(false);
    },
  });

  // Check if payment term name field has been touched and has validation errors
  const isPaymentTermNameError = touched.paymentTermName && Boolean(errors.paymentTermName);

  return (
    <form onSubmit={handleSubmit}>
      <Scrollbar
        sx={{
          p: 2,
          bgcolor: 'background.neutral',
          height: '100%',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} pb="10px">
            <ShakingTextField error={isPaymentTermNameError}>
              <TextField
                size="small"
                fullWidth
                name="paymentTermName"
                label="Payment Term Name"
                value={values.paymentTermName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={isPaymentTermNameError}
                helperText={touched.paymentTermName && errors.paymentTermName}
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

export default AddPaymentTermDialog;
