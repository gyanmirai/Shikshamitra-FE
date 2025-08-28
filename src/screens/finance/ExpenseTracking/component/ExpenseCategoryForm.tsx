import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import React from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetExpenseOptionsQuery } from 'src/redux/finance/expenseApi/expenseDetailedApi';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getInitialExpenseData } from './ExpenseInitialValues';
import { getExpenseFormSchema } from './ExpenseValidationSchema';

import type { IExpenseFormProps } from './type';

const ExpenseCategoryForm: React.FC<IExpenseFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Fetch expense options from API
  const { data: expenseOptionsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpenseOptionsQuery,
  });

  // Extract options from API data
  const categoryOptions = expenseOptionsData?.categoryOptions || [];
  const subCategoryOptions = expenseOptionsData?.subCategoryOptions || [];
  const paymentMethodOptions = expenseOptionsData?.paymentMethodOptions || [];

  const formik = useFormik({
    initialValues: getInitialExpenseData(editData),
    validationSchema: getExpenseFormSchema(currentYear),
    enableReinitialize: true,
    onSubmit: (values) => {
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.expenseCategory && formik.errors.expenseCategory)}
                >
                  <CustomSelect
                    label="Expense Category *"
                    options={categoryOptions}
                    value={formik.values.expenseCategory}
                    onChange={(val) => {
                      formik.setFieldValue('expenseCategory', val);
                      formik.setFieldTouched('expenseCategory', false);
                      const selectedCategory = categoryOptions.find(
                        (cat: { value: string; budget?: string }) => cat.value === val
                      );
                      formik.setFieldValue('budget', selectedCategory?.budget || '');
                    }}
                    error={!!(formik.touched.expenseCategory && formik.errors.expenseCategory)}
                    helperText={
                      (formik.touched.expenseCategory && formik.errors.expenseCategory) as string
                    }
                    formControlProps={{ fullWidth: true }}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.budget && formik.errors.budget)}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Budget *"
                    name="budget"
                    disabled
                    value={formik.values.budget}
                    onChange={formik.handleChange}
                    error={!!(formik.touched.budget && formik.errors.budget)}
                    helperText={formik.touched.budget && formik.errors.budget}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.budgetSubCategory && formik.errors.budgetSubCategory)}
                >
                  <CustomSelect
                    label="Budget Sub Category *"
                    options={subCategoryOptions}
                    value={formik.values.budgetSubCategory}
                    onChange={(val) => formik.setFieldValue('budgetSubCategory', val)}
                    error={!!(formik.touched.budgetSubCategory && formik.errors.budgetSubCategory)}
                    helperText={
                      (formik.touched.budgetSubCategory &&
                        formik.errors.budgetSubCategory) as string
                    }
                    formControlProps={{ fullWidth: true }}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.expenseName && formik.errors.expenseName)}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Expense Name *"
                    name="expenseName"
                    value={formik.values.expenseName}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^a-zA-\s]/g, '')
                        .split(' ')
                        .map((word) =>
                          word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                        )
                        .join(' ');
                      formik.setFieldValue('expenseName', value);
                    }}
                    error={!!(formik.touched.expenseName && formik.errors.expenseName)}
                    helperText={formik.touched.expenseName && formik.errors.expenseName}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.amount && formik.errors.amount)}>
                  <NumericFormatCustom
                    size="small"
                    fullWidth
                    label="Amount *"
                    name="amount"
                    value={formik.values.amount || ''}
                    onChange={(e) => {
                      let val = e.target.value;
                      val = val.replace(/[₹,\s]/g, '');
                      formik.setFieldValue('amount', Number(val));
                    }}
                    error={!!(formik.touched.amount && formik.errors.amount)}
                    helperText={formik.touched.amount && formik.errors.amount}
                    sx={{
                      width: '100%',
                      padding: '0',
                      borderRadius: 1,
                    }}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}
                >
                  <CustomSelect
                    label="Payment Method *"
                    options={paymentMethodOptions}
                    value={formik.values.paymentMethod}
                    onChange={(val) => formik.setFieldValue('paymentMethod', val)}
                    error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}
                    helperText={
                      (formik.touched.paymentMethod && formik.errors.paymentMethod) as string
                    }
                    formControlProps={{ fullWidth: true }}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.date && formik.errors.date)}>
                  <DatePicker
                    label="Date *"
                    value={dayjs(formik.values.date)}
                    onChange={(newValue) => formik.setFieldValue('date', newValue)}
                    maxDate={dayjs()}
                    minDate={dayjs()}
                    format="DD-MM-YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: !!(formik.touched.date && formik.errors.date),
                        helperText: formik.touched.date && formik.errors.date,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12}>
                <ShakingTextField>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Notes"
                    name="notes"
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onClose(null, false)}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              startIcon={
                <Iconify
                  icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                  width={16}
                  height={16}
                />
              }
              type="submit"
              size="small"
              variant="contained"
            >
              {editData ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default ExpenseCategoryForm;
