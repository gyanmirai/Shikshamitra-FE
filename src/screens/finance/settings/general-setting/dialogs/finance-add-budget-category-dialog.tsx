import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialBudgetCategoryValues } from './initialValues';
import { addBudgetCategoryValidationSchema } from './validationSchema';

import type {
  IFinanceAddBudgetCategoryInterface,
  IFinanceAddBudgetCategoryDialogProps,
} from './finance-general-settings-interface';

const AddBudgetCategoryDialog: React.FC<IFinanceAddBudgetCategoryDialogProps> = ({
  isEditMode,
  data,
  onClose,
  onSave,
}) => {
  // Get initial values for the budget category form based on provided data
  const initialValues = getInitialBudgetCategoryValues(data);

  // Initialize form handling with Formik hook
  // This provides form state management, validation, and submission handling
  const {
    values, // Current form values
    errors, // Validation errors
    touched, // Fields that have been touched/visited
    handleSubmit, // Form submission handler
    handleChange, // Input change handler
    handleBlur, // Input blur handler
    isSubmitting, // Submission state
    setSubmitting, // Function to update submission state
    setFieldValue,
  } = useFormik<IFinanceAddBudgetCategoryInterface>({
    initialValues,
    validationSchema: addBudgetCategoryValidationSchema, // Schema for form validation
    onSubmit: async (formValues) => {
      // Handle form submission by calling the provided save callback
      onSave?.(formValues);
      // Reset submission state after save is complete
      setSubmitting(false);
    },
  });

  const isBudgetCategoryNameError =
    touched.budgetCategoryName && Boolean(errors.budgetCategoryName);

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
            <ShakingTextField error={isBudgetCategoryNameError}>
              <TextField
                size="small"
                fullWidth
                name="budgetCategoryName"
                label="Budget Category Name *"
                value={values.budgetCategoryName}
                onChange={(e) => {
                  const value = e.target.value
                    // Remove everything except letters and spaces
                    .replace(/[^a-zA-Z0-9\s]/g, '');
                  setFieldValue('budgetCategoryName', value);
                }}
                onBlur={handleBlur}
                error={isBudgetCategoryNameError}
                helperText={touched.budgetCategoryName && errors.budgetCategoryName}
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
        </Box>
      </DialogActions>
    </form>
  );
};

export default AddBudgetCategoryDialog;
