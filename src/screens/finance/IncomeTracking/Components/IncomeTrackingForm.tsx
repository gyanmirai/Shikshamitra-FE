import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getInitialIncomeData } from './IncomeInitialValues';
import { getIncomeFormSchema } from './IncomeValidationSchema';

import type { IIncomeTrackingFormProps } from './type';

const categoryOptions = [
  { value: 'Donation', label: 'Donation', budget: 'Income Budget 2025' },
  { value: 'Grant', label: 'Grant', budget: 'Income Budget 2025' },
  { value: 'Miscellaneous', label: 'Miscellaneous', budget: 'Income Budget 2025' },
];

const budgetOptions = [{ value: 'Income Budget 2025', label: 'Income Budget 2025' }];

const subCategoryOptions = [
  { value: 'Alumni Income', label: 'Alumni Income' },
  { value: 'Govt Grant', label: 'Govt Grant' },
];

const paymentMethodOptions = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Cheque', label: 'Cheque' },
];

const IncomeTrackingForm: React.FC<IIncomeTrackingFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    initialValues: getInitialIncomeData(editData),
    validationSchema: getIncomeFormSchema(currentYear),
    onSubmit: (values) => {
      console.log('Submitted Income:', values);
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
                  error={!!(formik.touched.incomeCategory && formik.errors.incomeCategory)}
                >
                  <CustomSelect
                    label="Income Category *"
                    options={categoryOptions}
                    value={formik.values.incomeCategory}
                    onChange={(val) => {
                      formik.setFieldValue('incomeCategory', val);
                      const selectedCategory = categoryOptions.find((cat) => cat.value === val);
                      formik.setFieldValue('budget', selectedCategory?.budget || '');
                    }}
                    error={!!(formik.touched.incomeCategory && formik.errors.incomeCategory)}
                    helperText={
                      (formik.touched.incomeCategory && formik.errors.incomeCategory) as string
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
                <ShakingTextField error={!!(formik.touched.incomeName && formik.errors.incomeName)}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Income Name *"
                    name="incomeName"
                    value={formik.values.incomeName}
                    onChange={(e) => {
                      const value = e.target.value
                        // Remove everything except letters and spaces
                        .replace(/[^a-zA-Z\s]/g, '')
                        // Capitalize each word
                        .split(' ')
                        .map((word) =>
                          word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                        )
                        .join(' ');
                      formik.setFieldValue('incomeName', value);
                    }}
                    error={!!(formik.touched.incomeName && formik.errors.incomeName)}
                    helperText={formik.touched.incomeName && formik.errors.incomeName}
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
                    format="DD/MM/YYYY"
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

export default IncomeTrackingForm;
