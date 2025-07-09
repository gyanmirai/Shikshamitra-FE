import React from 'react';
import { useFormik } from 'formik';

import { Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';

import type {
  IFinanceAddLateFeeTypeInterface,
  IFinanceAddLateFeeTypeDialogProps,
} from './finance-general-settings-interface'; // define your interface here
import { getInitialLateFeeTypeValues } from './initialValues';
import { addLateFeeTypeValidationSchema } from './validationSchema';

const AddLateFeeTypeDialog: React.FC<IFinanceAddLateFeeTypeDialogProps> = ({
  isEditMode,
  data,
  onClose,
  onSave,
}) => {
  // Get initial values for the form, either empty values or existing data if in edit mode
  const initialValues = getInitialLateFeeTypeValues(data);

  // Initialize form handling with Formik hook
  const {
    values, // Current form values
    errors, // Validation errors for each field
    touched, // Tracks which fields have been touched/visited
    handleSubmit, // Form submission handler
    handleChange, // Input change handler
    handleBlur, // Input blur handler
    isSubmitting, // Boolean indicating if form is currently submitting
    setSubmitting, // Function to manually set submission state
    setFieldValue,
  } = useFormik<IFinanceAddLateFeeTypeInterface>({
    initialValues,
    validationSchema: addLateFeeTypeValidationSchema, // Validation schema for form fields
    onSubmit: async (formValues) => {
      // TODO: Implement API call for saving late fee type
      // Currently just simulating save operation by calling the onSave callback
      onSave?.(formValues);
      setSubmitting(false);
    },
  });

  // Check if late fee type name field has been touched and has validation errors
  const isLateFeeTypeNameError = touched.lateFeeTypeName && Boolean(errors.lateFeeTypeName);
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
            <ShakingTextField error={isLateFeeTypeNameError}>
              <TextField
                size="small"
                fullWidth
                name="lateFeeTypeName"
                label="Late Fee Type Name *"
                value={values.lateFeeTypeName}
                onChange={(e) => {
                  const value = e.target.value
                    // Remove everything except letters and spaces
                    .replace(/[^a-zA-Z0-9\s]/g, '');
                  setFieldValue('lateFeeTypeName', value);
                }}
                onBlur={handleBlur}
                error={isLateFeeTypeNameError}
                helperText={touched.lateFeeTypeName && errors.lateFeeTypeName}
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
          size="small"
          variant="contained"
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

export default AddLateFeeTypeDialog;
