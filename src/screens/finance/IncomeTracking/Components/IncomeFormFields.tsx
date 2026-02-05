import type { Dayjs } from 'dayjs';
import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import React from 'react';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import type { IIncomeFormValues } from '../types';

interface IncomeFormFieldsProps {
  formik: FormikProps<IIncomeFormValues>;
  incomeCategoryOptions: any[];
  paymentMethodOptions: any[];
  currentYear: { startDate: string; endDate: string } | null;
}

const IncomeFormFields: React.FC<IncomeFormFieldsProps> = ({
  formik,
  incomeCategoryOptions,
  paymentMethodOptions,
  currentYear,
}) => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, md: 6 }}>
      <ShakingTextField error={!!(formik.touched.incomeCategory && formik.errors.incomeCategory)}>
        <CustomSelect
          label="Income Category *"
          options={incomeCategoryOptions}
          value={formik.values.incomeCategory}
          onChange={(val: any) => {
            formik.setFieldValue('incomeCategory', val);
            formik.setFieldTouched('incomeCategory', false);
          }}
          error={!!(formik.touched.incomeCategory && formik.errors.incomeCategory)}
          helperText={(formik.touched.incomeCategory && formik.errors.incomeCategory) as string}
          formControlProps={{ fullWidth: true }}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <ShakingTextField
        error={!!(formik.touched.incomeCategoryTags && formik.errors.incomeCategoryTags)}
      >
        <CustomSelect
          label="Income Category Tags *"
          options={[
            { value: 'Donation', label: 'Donation' },
            { value: 'Grant', label: 'Grant' },
            { value: 'Fee', label: 'Fee' },
            { value: 'Fundraiser', label: 'Fundraiser' },
            { value: 'Sponsorship', label: 'Sponsorship' },
            { value: 'Other', label: 'Other' },
          ]}
          value={formik.values.incomeCategoryTags || []}
          onChange={(val: any) => formik.setFieldValue('incomeCategoryTags', val)}
          error={!!(formik.touched.incomeCategoryTags && formik.errors.incomeCategoryTags)}
          helperText={
            (formik.touched.incomeCategoryTags && formik.errors.incomeCategoryTags) as string
          }
          formControlProps={{ fullWidth: true }}
          multiple
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <ShakingTextField error={!!(formik.touched.incomeName && formik.errors.incomeName)}>
        <TextField
          fullWidth
          size="small"
          label="Income Name *"
          name="incomeName"
          value={formik.values.incomeName}
          onChange={(e) => {
            const value = e.target.value
              .replace(/[^a-zA-Z0-9\s]/g, '')
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

    <Grid size={{ xs: 12, md: 6 }}>
      <ShakingTextField error={!!(formik.touched.amount && formik.errors.amount)}>
        <NumericFormatCustom
          size="small"
          fullWidth
          label="Amount *"
          name="amount"
          value={formik.values.amount || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
      <ShakingTextField error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}>
        <CustomSelect
          label="Payment Via *"
          options={paymentMethodOptions}
          value={formik.values.paymentMethod}
          onChange={(val: any) => {
            formik.setFieldValue('paymentMethod', val);
          }}
          error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}
          helperText={(formik.touched.paymentMethod && formik.errors.paymentMethod) as string}
          formControlProps={{ fullWidth: true }}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <ShakingTextField error={!!(formik.touched.date && formik.errors.date)}>
        <DatePicker
          label="Date *"
          value={formik.values.date}
          onChange={(newValue: Dayjs | null) => formik.setFieldValue('date', newValue)}
          minDate={currentYear ? dayjs(currentYear.startDate) : undefined}
          maxDate={currentYear ? dayjs(currentYear.endDate) : undefined}
          format="DD/MM/YYYY"
          disableFuture
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

/**
 * Memoization Justification:
 * This component renders many fields. We want to avoid re-rendering
 * if props (formik state passed down, options) are stable.
 * Note: Formik changes on every keystroke, so this might still re-render often
 * unless we use FastField or equivalent, but React.memo helps if parent state changes
 * unrelated to formik.
 */
export default React.memo(IncomeFormFields);
