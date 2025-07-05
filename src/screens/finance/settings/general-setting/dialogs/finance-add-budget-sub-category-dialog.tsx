import React from 'react';
import { useFormik } from 'formik';

import { Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialBudgetSubcategoryValues } from './initialValues';
import { addBudgetSubcategoryValidationSchema } from './validationSchema';

import type {
  IFinanceAddBudgetSubcategoryInterface,
  IFinanceAddBudgetSubcategoryDialogProps,
} from './finance-general-settings-interface';

const AddBudgetSubcategoryDialog: React.FC<IFinanceAddBudgetSubcategoryDialogProps> = ({
  isEditMode,
  data,

  onClose,
  onSave,
}) => {
  // Get initial values for the form based on provided data
  const initialValues = getInitialBudgetSubcategoryValues(data);

  // Initialize form handling with Formik hook
  // This provides form state management, validation, and submission handling
  const {
    values, // Current form values
    errors, // Validation errors
    touched, // Fields that have been touched/visited
    handleSubmit, // Form submission handler
    handleChange, // Input change handler
    handleBlur, // Input blur handler
    isSubmitting, // Form submission status
    setSubmitting, // Function to update submission status
    setFieldValue, // Function to programmatically set field values
  } = useFormik<IFinanceAddBudgetSubcategoryInterface>({
    initialValues,
    validationSchema: addBudgetSubcategoryValidationSchema,
    onSubmit: async (formValues) => {
      onSave?.(formValues);
      setSubmitting(false);
    },
  });

  // Track validation states for specific fields
  const isCategoryError = touched.budgetCategoryId && Boolean(errors.budgetCategoryId);
  const isSubcategoryNameError =
    touched.budgetSubcategoryName && Boolean(errors.budgetSubcategoryName);
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
            <ShakingTextField error={touched.budgetCategoryId && Boolean(errors.budgetCategoryId)}>
              <CustomSelect
                label="Budget Category *"
                options={[
                  { value: 'income', label: 'Income' },
                  { value: 'expense', label: 'Expense' },
                  { value: 'asset', label: 'Asset' },
                  { value: 'liability', label: 'Liability' },
                  { value: 'equity', label: 'Equity' },
                  { value: 'revenue', label: 'Revenue' },
                  { value: 'cogs', label: 'Cost of Goods Sold' },
                  { value: 'operating', label: 'Operating Expenses' },
                  { value: 'other', label: 'Other' },
                ]}
                value={values.budgetCategoryId}
                onChange={(value) => setFieldValue('budgetCategoryId', value)}
                formControlProps={{ sx: { minWidth: 230 }, fullWidth: true }}
                disabled={isEditMode}
                autoFocus
                error={touched.budgetCategoryId && Boolean(errors.budgetCategoryId)}
                helperText={touched.budgetCategoryId ? errors.budgetCategoryId || '' : ''}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} pb="10px">
            <ShakingTextField error={isSubcategoryNameError}>
              <TextField
                size="small"
                fullWidth
                name="budgetSubcategoryName"
                label="Budget Subcategory Name *"
                value={values.budgetSubcategoryName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={isSubcategoryNameError}
                helperText={touched.budgetSubcategoryName && errors.budgetSubcategoryName}
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
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          disabled={isSubmitting}
          size="small"
        >
          {isEditMode ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </form>
  );
};

export default AddBudgetSubcategoryDialog;
