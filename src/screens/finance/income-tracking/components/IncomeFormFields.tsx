import type { Dayjs } from 'dayjs';
import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import type { IIncomeFormValues } from '../types';

interface IncomeFormFieldsProps {
  formik: FormikProps<IIncomeFormValues>;
  incomeCategoryOptions: any[];
  paymentMethodOptions: { value: number; label: string }[];
  currentYear: { startDate: string; endDate: string } | null;
  incomeOptionsLoading: boolean;
}

const IncomeFormFields: React.FC<IncomeFormFieldsProps> = ({
  formik,
  incomeCategoryOptions,
  paymentMethodOptions,
  currentYear,
  incomeOptionsLoading,
}) => {
  const [tags, setTags] = useState<{ name: string; id: string }[]>([]);

  useEffect(() => {
    if (formik.values.categoryId) {
      const selectedCategory = incomeCategoryOptions.find(
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
  }, [formik.values.categoryId, incomeCategoryOptions]);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.categoryId && formik.errors.categoryId)}>
          <CustomSelect
            label="Income Category *"
            options={incomeCategoryOptions || []}
            value={formik.values.categoryId}
            isLoading={incomeOptionsLoading}
            onChange={(val: any) => {
              formik.setFieldValue('categoryId', val);
              formik.setFieldTouched('categoryId', false);
              formik.setFieldValue('categoryTags', []);
              const selectedItems = incomeCategoryOptions?.filter((item: any) =>
                val.includes(item.id)
              );

              const formatted = selectedItems?.map((item: any) => ({
                id: item.id,
                name: item.name,
              }));
              setTags(formatted || []);
            }}
            labelKey="name"
            valueKey="id"
            error={!!(formik.touched.categoryId && formik.errors.categoryId)}
            helperText={(formik.touched.categoryId && formik.errors.categoryId) as string}
            formControlProps={{ fullWidth: true }}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.categoryTags && formik.errors.categoryTags)}>
          <CustomSelect
            label="Income Category Tags *"
            options={tags || []}
            labelKey="name"
            valueKey="id"
            disabled={!formik.values.categoryId}
            value={formik.values.categoryTags || []}
            onChange={(val: any) => formik.setFieldValue('categoryTags', val)}
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
            label="Income Name *"
            name="name"
            value={formik.values.name}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^a-zA-Z0-9\s]/g, '')
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
            label="Payment Method *"
            options={paymentMethodOptions}
            value={formik.values.paymentMethod}
            onChange={(val: any) => {
              formik.setFieldValue('paymentMethod', val);
            }}
            labelKey="label"
            valueKey="value"
            error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}
            helperText={(formik.touched.paymentMethod && formik.errors.paymentMethod) as string}
            formControlProps={{ fullWidth: true }}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.paymentDate && formik.errors.paymentDate)}>
          <DatePicker
            label="Payment Date *"
            value={formik.values.paymentDate}
            onChange={(newValue: Dayjs | null) => formik.setFieldValue('paymentDate', newValue)}
            minDate={currentYear ? dayjs(currentYear.startDate) : undefined}
            maxDate={currentYear ? dayjs(currentYear.endDate) : undefined}
            format="DD/MM/YYYY"
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
 * This component renders many fields. We want to avoid re-rendering
 * if props (formik state passed down, options) are stable.
 * Note: Formik changes on every keystroke, so this might still re-render often
 * unless we use FastField or equivalent, but React.memo helps if parent state changes
 * unrelated to formik.
 */
export default React.memo(IncomeFormFields);
