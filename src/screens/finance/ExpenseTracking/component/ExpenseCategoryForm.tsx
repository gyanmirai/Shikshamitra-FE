import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import React from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useGetExpenseOptionsQuery,
  useGetPaymentMethodsConfigQuery,
} from 'src/redux/finance/expenseApi/expenseDetailedApi';

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

  // Fetch payment methods config from API
  const { data: paymentMethodsConfigData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaymentMethodsConfigQuery,
  });

  // Extract options from API data with fallbacks
  const categoryOptions = expenseOptionsData?.categoryOptions || [];

  // Use API data for payment methods config, fallback to local config
  const paymentMethodsConfigToUse = paymentMethodsConfigData || [];

  // Generate payment method options from the config
  const paymentMethodOptions =
    expenseOptionsData?.paymentMethodOptions ||
    Object.keys(paymentMethodsConfigToUse).map((method) => ({
      value: method,
      label: method,
    }));

  const formik = useFormik({
    initialValues: getInitialExpenseData(editData),
    validationSchema: getExpenseFormSchema(currentYear),
    enableReinitialize: true,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `Expense Tracking : ${values.expenseName} updated successfully!`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Expense Tracking : ${values.expenseName} added successfully!`,
        });
      }
      onClose(null, true);
    },
  });

  const selectedPaymentMethod = formik.values.paymentMethod;

  // Get payment fields from API data or fallback to local config
  const paymentFields =
    paymentMethodsConfigToUse[selectedPaymentMethod as keyof typeof paymentMethodsConfigToUse] ||
    [];

  const renderDynamicField = (field: any) => {
    const fieldName = `paymentDetails.${field.name}`;
    const fieldValue = formik.values.paymentDetails?.[field.name] || '';

    // Properly access nested errors for paymentDetails
    const isTouched =
      formik.touched.paymentDetails &&
      typeof formik.touched.paymentDetails === 'object' &&
      (formik.touched.paymentDetails as Record<string, boolean>)[field.name];

    const fieldError =
      isTouched &&
      (formik.errors.paymentDetails as Record<string, string | undefined>)?.[field.name];

    switch (field.type) {
      case 'date':
        return (
          <Grid size={{ xs: 12, md: 6 }} key={field.name}>
            <ShakingTextField error={!!fieldError}>
              <DatePicker
                label={field.label}
                value={fieldValue ? dayjs(fieldValue) : null}
                onChange={(newValue) => {
                  formik.setFieldValue(fieldName, newValue ? newValue.toISOString() : '');
                  // Trigger validation for this field
                  formik.setFieldTouched(fieldName, true);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!fieldError,
                    helperText: fieldError as string,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
        );

      case 'select':
        return (
          <Grid size={{ xs: 12, md: 6 }} key={field.name}>
            <ShakingTextField error={!!fieldError}>
              <CustomSelect
                label={field.label}
                options={
                  field.options?.map((option: string) => ({ value: option, label: option })) || []
                }
                value={fieldValue}
                onChange={(val) => formik.setFieldValue(fieldName, val)}
                error={!!fieldError}
                helperText={fieldError as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>
        );

      case 'multiline':
        return (
          <Grid size={12} key={field.name}>
            <ShakingTextField error={!!fieldError}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label={field.label}
                name={fieldName}
                value={fieldValue}
                onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}
                error={!!fieldError}
                helperText={fieldError as string}
              />
            </ShakingTextField>
          </Grid>
        );

      case 'amount':
        return (
          <Grid size={{ xs: 12, md: 6 }} key={field.name}>
            <ShakingTextField error={!!fieldError}>
              <NumericFormatCustom
                size="small"
                fullWidth
                label={field.label}
                name={fieldName}
                value={fieldValue || ''}
                onChange={(e) => {
                  let val = e.target.value;
                  val = val.replace(/[₹,\s]/g, '');
                  formik.setFieldValue(fieldName, Number(val));
                }}
                error={!!fieldError}
                helperText={fieldError as string}
                sx={{
                  width: '100%',
                  padding: '0',
                  borderRadius: 1,
                }}
              />
            </ShakingTextField>
          </Grid>
        );

      default:
        return (
          <Grid size={{ xs: 12, md: 6 }} key={field.name}>
            <ShakingTextField error={!!fieldError}>
              <TextField
                fullWidth
                size="small"
                label={field.label}
                name={fieldName}
                value={fieldValue}
                onChange={(e) => {
                  let { value } = e.target;

                  // Handle specific field transformations
                  if (
                    field.name === 'chequeNumber' ||
                    field.name === 'transactionId' ||
                    field.name === 'authorizationCode'
                  ) {
                    value = value.toUpperCase();
                  } else if (field.name === 'upiId') {
                    // UPI ID validation: allow alphanumeric, @, ., -
                    value = value.toLowerCase().replace(/[^a-z0-9@.-]/g, '');
                  } else if (field.name === 'cardNumber') {
                    // Only allow last 4 digits
                    value = value.replace(/\D/g, '').slice(-4);
                  } else if (
                    field.name === 'payeeName' ||
                    field.name === 'accountHolderName' ||
                    field.name === 'bankName' ||
                    field.name === 'cardHolderName'
                  ) {
                    value = value
                      .replace(/[^a-zA-Z\s]/g, '')
                      .split(' ')
                      .map((word) =>
                        word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                      )
                      .join(' ');
                  }

                  formik.setFieldValue(fieldName, value);
                }}
                onBlur={() => formik.setFieldTouched(fieldName, true)}
                error={!!fieldError}
                helperText={fieldError as string}
                inputProps={{
                  ...(field.pattern ? { pattern: field.pattern } : {}),
                  ...(field.name === 'cardNumber' ? { maxLength: 4 } : {}),
                  ...(field.name === 'upiId' ? { placeholder: 'example@upi' } : {}),
                }}
              />
            </ShakingTextField>
          </Grid>
        );
    }
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
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
                    }}
                    error={!!(formik.touched.expenseCategory && formik.errors.expenseCategory)}
                    helperText={
                      (formik.touched.expenseCategory && formik.errors.expenseCategory) as string
                    }
                    formControlProps={{ fullWidth: true }}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.budget && formik.errors.budget)}>
                  <CustomSelect
                    label="Budget Title *"
                    options={[
                      { value: 'FY2023-24Q1', label: 'FY 2023-24 Q1 Budget' },
                      { value: 'FY2023-24Q2', label: 'FY 2023-24 Q2 Budget' },
                      { value: 'FY2023-24Q3', label: 'FY 2023-24 Q3 Budget' },
                      { value: 'FY2023-24Q4', label: 'FY 2023-24 Q4 Budget' },
                      { value: 'AnnualBudget2024', label: 'Annual Budget 2024' },
                    ]}
                    value={formik.values.budget}
                    onChange={(val) => formik.setFieldValue('budget', val)}
                    error={!!(formik.touched.budget && formik.errors.budget)}
                    helperText={(formik.touched.budget && formik.errors.budget) as string}
                    formControlProps={{ fullWidth: true }}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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
                        .replace(/[^a-zA-Z\s]/g, '')
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

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.date && formik.errors.date)}>
                  <DatePicker
                    label="Date *"
                    value={dayjs(formik.values.date)}
                    onChange={(newValue) => formik.setFieldValue('date', newValue)}
                    format="DD/MM/YYYY"
                    minDate={dayjs(currentYear?.startDate)}
                    maxDate={dayjs()}
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

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}
                >
                  <CustomSelect
                    label="Payment Method *"
                    options={paymentMethodOptions}
                    value={formik.values.paymentMethod}
                    onChange={(val) => {
                      formik.setFieldValue('paymentMethod', val);
                      // Clear payment details when method changes
                      formik.setFieldValue('paymentDetails', {});
                      // Clear touched state for paymentDetails
                      formik.setFieldTouched('paymentDetails', false);
                    }}
                    error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}
                    helperText={
                      (formik.touched.paymentMethod && formik.errors.paymentMethod) as string
                    }
                    formControlProps={{ fullWidth: true }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Dynamic Payment Method Fields */}
              {paymentFields.length > 0 && (
                <Grid size={12}>
                  <Box sx={{ mb: 1 }}>
                    {/* Payment Method Heading */}
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        color: 'primary.main',
                        fontWeight: 600,
                        borderColor: 'primary.light',
                        pb: 1,
                        display: 'inline-block',
                      }}
                    >
                      {selectedPaymentMethod} Details
                    </Typography>

                    <Grid container spacing={3}>
                      {paymentFields.map((field: any) => renderDynamicField(field))}
                    </Grid>
                  </Box>
                </Grid>
              )}

              <Grid size={12}>
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
