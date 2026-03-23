import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import React, { memo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import type { IExpenseFormValues } from './type';

interface ExpenseFormFieldsProps {
  formik: FormikProps<IExpenseFormValues>;
  categoryOptions: any[];
  currentYear: any;
  paymentMethodOptions: { value: number; label: string }[];
  categoryOptionsLoading: boolean;
}

const ExpenseFormFields = ({
  formik,
  categoryOptions,
  currentYear,
  paymentMethodOptions,
  categoryOptionsLoading,
}: ExpenseFormFieldsProps) => {
  const [tags, setTags] = useState<{ name: string; id: string }[]>([]);
  console.log('tags0000', tags);
  // Update tags when categoryId changes or initially if editData is present
  useEffect(() => {
    if (formik.values.categoryId) {
      const selectedCategory = categoryOptions.find(
        (option) => option.id === formik.values.categoryId
      );
      if (selectedCategory && selectedCategory.tags) {
        setTags(selectedCategory.tags.map((tag: any) => ({ name: tag, id: tag })));
      } else {
        setTags([]);
      }
    } else {
      setTags([]);
    }
  }, [formik.values.categoryId, categoryOptions]);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.categoryId && formik.errors.categoryId)}>
          <CustomSelect
            label="Expense Category *"
            options={categoryOptions}
            value={formik.values.categoryId}
            isLoading={categoryOptionsLoading}
            labelKey="name"
            valueKey="id"
            onChange={(val: any) => {
              formik.setFieldValue('categoryId', val);
              formik.setFieldValue('categoryTags', []); // Reset tags on category change
              formik.setFieldTouched('categoryId', false);
              const selectedItems = categoryOptions?.filter((item: any) => val.includes(item.id));

              const formatted = selectedItems?.map((item: any) => ({
                id: item.id,
                name: item.name,
              }));
              setTags(formatted || []);
            }}
            error={!!(formik.touched.categoryId && formik.errors.categoryId)}
            helperText={(formik.touched.categoryId && formik.errors.categoryId) as string}
            formControlProps={{ fullWidth: true }}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.categoryTags && formik.errors.categoryTags)}>
          <CustomSelect
            label="Expense Category Tags *"
            options={tags}
            labelKey="name"
            valueKey="id"
            value={formik.values.categoryTags || []}
            onChange={(val: any) => formik.setFieldValue('categoryTags', val)}
            disabled={!formik.values.categoryId}
            error={!!(formik.touched.categoryTags && formik.errors.categoryTags)}
            helperText={(formik.touched.categoryTags && formik.errors.categoryTags) as string}
            formControlProps={{ fullWidth: true }}
            multiple
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
          <TextField
            fullWidth
            size="small"
            label="Expense Name *"
            name="name"
            value={formik.values.name}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^a-zA-Z\s]/g, '')
                .split(' ')
                .map((word) =>
                  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ');
              formik.setFieldValue('name', value);
            }}
            error={!!(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
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
        <ShakingTextField error={!!(formik.touched.paymentDate && formik.errors.paymentDate)}>
          <DatePicker
            label="Payment Date *"
            value={formik.values.paymentDate}
            onChange={(newValue) => formik.setFieldValue('paymentDate', newValue)}
            format="DD/MM/YYYY"
            minDate={dayjs(currentYear?.startDate)}
            maxDate={dayjs(currentYear?.endDate)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: !!(formik.touched.paymentDate && formik.errors.paymentDate),
                helperText: (formik.touched.paymentDate && formik.errors.paymentDate) as string,
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
            }}
            labelKey="label"
            valueKey="value"
            error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}
            helperText={(formik.touched.paymentMethod && formik.errors.paymentMethod) as string}
            formControlProps={{ fullWidth: true }}
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
};

/**
 * Memoization Justification:
 * This component renders a large form.
 * React.memo prevents re-renders if props (formik state) haven't changed,
 * although formik state changes frequently during typing.
 * However, it protects against parent re-renders that don't involve form updates.
 */
export default memo(ExpenseFormFields);
