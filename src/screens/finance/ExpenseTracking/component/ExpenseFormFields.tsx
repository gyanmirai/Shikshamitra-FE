import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import React, { memo, useState, useEffect } from 'react';
import { Grid, Skeleton, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

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
          {categoryOptionsLoading ? (
            <Skeleton variant="rounded" height={40} />
          ) : (
            <PaginatedSearchSelect
              key={categoryOptions?.length ? 'category-loaded' : 'category-empty'}
              label="Expense Category *"
              noOptionsText="No Expense Category Found"
              fetchOptions={async (query: string, page: number) => {
                const filtered = (categoryOptions || []).filter((c: any) =>
                  c?.name?.toLowerCase().includes(query.toLowerCase())
                );
                const pageSize = 10;
                const start = (page - 1) * pageSize;
                const end = start + pageSize;
                return {
                  data: filtered.slice(start, end).map((item: any) => ({
                    label: item.name,
                    id: item.id,
                  })),
                  hasMore: end < filtered.length,
                };
              }}
              value={
                categoryOptions?.find((c: any) => c.id === formik.values.categoryId)
                  ? {
                      label: categoryOptions.find((c: any) => c.id === formik.values.categoryId)
                        ?.name,
                      id: formik.values.categoryId,
                    }
                  : null
              }
              isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
              renderOption={(prop, option: any) => (
                <li {...prop} key={option.id}>
                  {option.label}
                </li>
              )}
              getOptionLabel={(option: any) => option?.label || ''}
              minChars={0}
              onChange={(_, val: any) => {
                formik.setFieldValue('categoryId', val?.id || '');
                formik.setFieldValue('categoryTags', []);
                formik.setFieldTouched('categoryId', false);
              }}
              size="small"
              sx={{ width: '100%' }}
              error={!!(formik.touched.categoryId && formik.errors.categoryId)}
              helperText={(formik.touched.categoryId && formik.errors.categoryId) as string}
            />
          )}
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.categoryTags && formik.errors.categoryTags)}>
          <PaginatedSearchSelect
            key={tags?.length ? 'tags-loaded' : 'tags-empty'}
            multiple
            noOptionsText="No Expense Category Tags Found"
            label="Expense Category Tags *"
            disabled={!formik.values.categoryId}
            fetchOptions={async (query: string, page: number) => {
              const filtered = (tags || []).filter((t: any) =>
                t?.name?.toLowerCase().includes(query.toLowerCase())
              );
              const pageSize = 10;
              const start = (page - 1) * pageSize;
              const end = start + pageSize;
              return {
                data: filtered.slice(start, end).map((item: any) => ({
                  label: item.name,
                  id: item.id,
                })),
                hasMore: end < filtered.length,
              };
            }}
            value={(formik.values.categoryTags || []).map((tagId: string) => {
              const tag = tags?.find((t: any) => t.id === tagId);
              return tag ? { label: tag.name, id: tag.id } : { label: tagId, id: tagId };
            })}
            isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
            renderOption={(prop, option: any) => (
              <li {...prop} key={option.id}>
                {option.label}
              </li>
            )}
            getOptionLabel={(option: any) => option?.label || ''}
            minChars={0}
            onChange={(_, val: any) => {
              const newTags = Array.isArray(val) ? val.map((v: any) => v.id) : [];
              formik.setFieldValue('categoryTags', newTags);
            }}
            size="small"
            sx={{ width: '100%' }}
            error={!!(formik.touched.categoryTags && formik.errors.categoryTags)}
            helperText={(formik.touched.categoryTags && formik.errors.categoryTags) as string}
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
          <PaginatedSearchSelect
            key={paymentMethodOptions?.length ? 'payment-loaded' : 'payment-empty'}
            label="Payment Method *"
            noOptionsText="No Payment Method Found"
            fetchOptions={async (query: string, page: number) => {
              const filtered = (paymentMethodOptions || []).filter((p: any) =>
                p?.label?.toLowerCase().includes(query.toLowerCase())
              );
              const pageSize = 10;
              const start = (page - 1) * pageSize;
              const end = start + pageSize;
              return {
                data: filtered.slice(start, end).map((item: any) => ({
                  label: item.label,
                  id: item.value,
                })),
                hasMore: end < filtered.length,
              };
            }}
            value={
              paymentMethodOptions?.find((p: any) => p.value === formik.values.paymentMethod)
                ? {
                    label: paymentMethodOptions.find(
                      (p: any) => p.value === formik.values.paymentMethod
                    )?.label,
                    id: formik.values.paymentMethod,
                  }
                : null
            }
            isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
            renderOption={(prop, option: any) => (
              <li {...prop} key={option.id}>
                {option.label}
              </li>
            )}
            getOptionLabel={(option: any) => option?.label || ''}
            minChars={0}
            onChange={(_, val: any) => {
              formik.setFieldValue('paymentMethod', val?.id || '');
              formik.setFieldTouched('paymentMethod', false);
            }}
            size="small"
            sx={{ width: '100%' }}
            error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod)}
            helperText={(formik.touched.paymentMethod && formik.errors.paymentMethod) as string}
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
