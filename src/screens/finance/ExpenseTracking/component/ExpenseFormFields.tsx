import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { getIn } from 'formik';
import React, { memo } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { Grid, MenuItem, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import type { IExpenseFormValues } from './type';
import type { IPaymentFieldConfig } from '../../FeeCollection/Components/type';

interface ExpenseFormFieldsProps {
  formik: FormikProps<IExpenseFormValues>;
  categoryOptions: { value: string; label: string }[];
  currentYear: any; // Using exact type from global state would be better if available
  paymentMethodsConfig: Record<string, IPaymentFieldConfig[]>;
  paymentMethodOptions: { value: string; label: string }[];
}

const ExpenseFormFields = ({
  formik,
  categoryOptions,
  currentYear,
  paymentMethodsConfig,
  paymentMethodOptions,
}: ExpenseFormFieldsProps) => {
  const selectedPaymentMethod = formik.values.paymentMethod;

  return (
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
            helperText={(formik.touched.expenseCategory && formik.errors.expenseCategory) as string}
            formControlProps={{ fullWidth: true }}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField
          error={!!(formik.touched.expenseCategoryTags && formik.errors.expenseCategoryTags)}
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
            error={!!(formik.touched.expenseCategoryTags && formik.errors.expenseCategoryTags)}
            helperText={
              (formik.touched.expenseCategoryTags && formik.errors.expenseCategoryTags) as string
            }
            formControlProps={{ fullWidth: true }}
            multiple
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.expenseName && formik.errors.expenseName)}>
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
                helperText: (formik.touched.date && formik.errors.date) as string,
              },
            }}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}>
          <CustomSelect
            label="Payment Method *"
            options={paymentMethodOptions}
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
            helperText={(formik.touched.paymentMethod && formik.errors.paymentMethod) as string}
            formControlProps={{ fullWidth: true }}
          />
        </ShakingTextField>
      </Grid>

      {selectedPaymentMethod &&
        paymentMethodsConfig[selectedPaymentMethod]?.map((field: IPaymentFieldConfig) => {
          const fieldPath = `paymentDetails.${field.name}`;
          const value = getIn(formik.values, fieldPath);
          const error = getIn(formik.errors, fieldPath);
          const touched = getIn(formik.touched, fieldPath);

          return (
            <Grid size={{ xs: 6, md: 6 }} key={`${selectedPaymentMethod}-${field.name}`}>
              <ShakingTextField error={Boolean(touched && error)}>
                {field.type === 'date' ? (
                  <DatePicker
                    label={`${field.label}`}
                    format="DD/MM/YYYY"
                    value={value}
                    onChange={(date) => formik.setFieldValue(fieldPath, date)}
                    disablePast
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
                    onBlur={() => formik.setFieldTouched(fieldPath, true)}
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

                        const allowedChars = 'a-zA-Z0-9 ';
                        const typingRegex = new RegExp(`^[${allowedChars}]*$`);

                        if (!typingRegex.test(newValue)) return;
                      }

                      formik.setFieldValue(fieldPath, newValue);
                    }}
                    onBlur={formik.handleBlur}
                    error={Boolean(touched && error)}
                    helperText={touched && typeof error === 'string' ? error : ''}
                    inputProps={field.type === 'number' ? { min: field.min, max: field.max } : {}}
                  />
                )}
              </ShakingTextField>
            </Grid>
          );
        })}

      <Grid size={{ xs: 12 }}>
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
  );
};
/**
 * Memoization Justification:
 * This component renders a large form.
 * React.memo prevents re-renders if props (formik state) haven't changed,
 * although formik state changes frequently during typing.
 * However, it protects against parent re-renders that don't involve form updates.
 */
export default memo(ExpenseFormFields);
