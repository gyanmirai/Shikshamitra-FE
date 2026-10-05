'use client';

import type { FormikProps } from 'formik';
import type { RoutingOperation } from 'src/redux/finance/financeRoutingApi';

import { Stack, Alert } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';

interface Props {
  formik: FormikProps<any>;
  academicYearId: string;
  operation: RoutingOperation;
  categoryField: string;
  bankField?: string;
  categoryLabel?: string;
  bankLabel?: string;
  disabled?: boolean;
}
export default function FinanceRoutingFields({
  formik,
  academicYearId,
  operation,
  categoryField,
  bankField,
  categoryLabel = 'Income Category',
  bankLabel = 'Receiving Bank Account',
  disabled = false,
}: Props) {
  const { data, isFetching, isError } = useGetFinanceRoutingOptionsQuery(
    { academicYearId, operation },
    { skip: !academicYearId }
  );
  const categories =
    operation === 'refund' || operation === 'refund-policy'
      ? data?.expenseCategories
      : data?.incomeCategories;
  const field = (
    name: string,
    label: string,
    options: { id: string; label: string }[] | undefined
  ) => (
    <CustomSelect
      key={name}
      fullWidth
      size="small"
      label={label}
      name={name}
      value={formik.values[name] || ''}
      options={
        formik.values[name] && !options?.some((x) => x.id === formik.values[name])
          ? [
              { id: formik.values[name], label: 'Saved selection (unavailable)' },
              ...(options ?? []),
            ]
          : (options ?? [])
      }
      labelKey="label"
      valueKey="id"
      isSearch
      isLoading={isFetching}
      disabledValues={
        formik.values[name] && !options?.some((x) => x.id === formik.values[name])
          ? [formik.values[name]]
          : []
      }
      disabled={disabled || isError}
      onChange={(value) => {
        formik.setFieldValue(name, value);
        formik.setFieldTouched(name, true, false);
      }}
      onBlur={formik.handleBlur}
      error={Boolean(formik.touched[name] && formik.errors[name])}
      helperText={
        formik.touched[name] && formik.errors[name] ? String(formik.errors[name]) : undefined
      }
      noOptionsMessage={`No active ${label.toLowerCase()} options in this academic year.`}
    />
  );
  return (
    <Stack spacing={2} sx={{ py: 1 }}>
      {isError && (
        <Alert severity="error">
          Financial selections could not be loaded. Retry before saving.
        </Alert>
      )}
      {field(categoryField, categoryLabel, categories)}
      {bankField && field(bankField, bankLabel, data?.bankAccounts)}
    </Stack>
  );
}
