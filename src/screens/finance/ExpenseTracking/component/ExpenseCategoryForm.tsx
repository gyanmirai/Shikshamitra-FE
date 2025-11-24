import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { getIn, useFormik } from 'formik';
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
import { Box, Grid, Button, MenuItem, TextField, DialogActions } from '@mui/material';
import {
  useGetExpenseOptionsQuery,
  useGetPaymentMethodsConfigQuery,
} from 'src/redux/finance/expenseApi/expenseDetailedApi';

import { getInitialExpenseData } from './ExpenseInitialValues';
import { getExpenseFormSchema } from './ExpenseValidationSchema';
import { paymentMethodsConfig } from '../../FeeCollection/Components/paymentConfigMethods';

import type { IExpenseFormProps } from './type';
import type { IPaymentFieldConfig } from '../../FeeCollection/Components/type';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const paymentFields =
    paymentMethodsConfigToUse[selectedPaymentMethod as keyof typeof paymentMethodsConfigToUse] ||
    [];

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
                <ShakingTextField
                  error={
                    !!(formik.touched.expenseCategoryTags && formik.errors.expenseCategoryTags)
                  }
                >
                  <CustomSelect
                    label="Expense Category Tags *"
                    options={[
                      { value: 'Donation', label: 'Donation' },
                      { value: 'Grant', label: 'Grant' },
                      { value: 'Fee', label: 'Fee' },
                      { value: 'Fundraiser', label: 'Fundraiser' },
                      { value: 'Sponsorship', label: 'Sponsorship' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    value={formik.values.expenseCategoryTags || []}
                    onChange={(val) => formik.setFieldValue('expenseCategoryTags', val)}
                    error={
                      !!(formik.touched.expenseCategoryTags && formik.errors.expenseCategoryTags)
                    }
                    helperText={
                      (formik.touched.expenseCategoryTags &&
                        formik.errors.expenseCategoryTags) as string
                    }
                    formControlProps={{ fullWidth: true }}
                    multiple
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
                    value={formik.values.date}
                    onChange={(newValue) => formik.setFieldValue('date', newValue)}
                    format="DD/MM/YYYY"
                    minDate={dayjs(currentYear?.startDate)}
                    maxDate={dayjs(currentYear?.endDate)}
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
                    options={Object.keys(paymentMethodsConfig).map((method) => ({
                      value: method,
                      label: method.charAt(0).toUpperCase() + method.slice(1),
                    }))}
                    value={formik.values.paymentMethod}
                    onChange={(val) => {
                      formik.setFieldValue('paymentMethod', val);
                      formik.setFieldTouched('paymentMethod', false);

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

              {formik.values.paymentMethod &&
                paymentMethodsConfig[
                  formik.values.paymentMethod as keyof typeof paymentMethodsConfig
                ]?.map((field: IPaymentFieldConfig) => {
                  const fieldPath = `paymentDetails.${field.name}`;
                  const value = getIn(formik.values, fieldPath);
                  const error = getIn(formik.errors, fieldPath);
                  const touched = getIn(formik.touched, fieldPath);

                  return (
                    <Grid size={6} key={`${formik.values.paymentMethod}-${field.name}`}>
                      <ShakingTextField error={Boolean(touched && error)}>
                        {field.type === 'date' ? (
                          <DatePicker
                            label={`${field.label}`}
                            format="DD/MM/YYYY"
                            value={value}
                            onChange={(date) => formik.setFieldValue(fieldPath, date)}
                            disablePast
                            // onBlur={() => formik.setFieldTouched(fieldPath, true)}
                            sx={{ width: '100%' }}
                            slotProps={{
                              textField: {
                                size: 'small',
                                fullWidth: true,
                                error: Boolean(touched && error),
                                helperText: touched && typeof error === 'string' ? error : '',
                              },
                            }}
                          />
                        ) : field.type === 'select' ? (
                          <TextField
                            select
                            fullWidth
                            label={field.label}
                            name={fieldPath}
                            value={value || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            size="small"
                            error={Boolean(touched && error)}
                            helperText={touched && typeof error === 'string' ? error : ''}
                          >
                            {field.options?.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : field.type === 'multiline' ? (
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            size="small"
                            label={field.label}
                            name={fieldPath}
                            value={value || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={Boolean(touched && error)}
                            helperText={touched && typeof error === 'string' ? error : ''}
                          />
                        ) : field.type === 'amount' ? (
                          <NumericFormatCustom
                            fullWidth
                            size="small"
                            label={field.label}
                            name={fieldPath}
                            value={value || ''}
                            onChange={formik.handleChange}
                            onBlur={() => formik.setFieldTouched(fieldPath, true)} // ✅ needed for custom inputs
                            error={Boolean(touched && error)}
                            helperText={touched && typeof error === 'string' ? error : ''}
                          />
                        ) : (
                          <TextField
                            fullWidth
                            type={field.type}
                            size="small"
                            label={field.label}
                            name={fieldPath}
                            value={value || ''}
                            onChange={(e) => {
                              const newValue = e.target.value;

                              if (field.pattern) {
                                if (newValue === '') {
                                  formik.setFieldValue(fieldPath, newValue);
                                  return;
                                }

                                // Define allowed chars manually
                                const allowedChars = 'a-zA-Z0-9 ';
                                const typingRegex = new RegExp(`^[${allowedChars}]*$`);

                                if (!typingRegex.test(newValue)) return; // block invalid chars
                              }

                              formik.setFieldValue(fieldPath, newValue);
                            }}
                            onBlur={formik.handleBlur}
                            error={Boolean(touched && error)}
                            helperText={touched && typeof error === 'string' ? error : ''}
                            inputProps={
                              field.type === 'number' ? { min: field.min, max: field.max } : {}
                            }
                          />
                        )}
                      </ShakingTextField>
                    </Grid>
                  );
                })}

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
