'use client';

import type { FormikProps } from 'formik';
import type { RoutingOperation } from 'src/redux/finance/financeRoutingApi';

import { Stack, Alert, Skeleton } from '@mui/material';
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
  skeletonLoading?: boolean;
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
  skeletonLoading = false,
}: Props) {
  const { data, isFetching, isError } = useGetFinanceRoutingOptionsQuery(
    { academicYearId, operation },
    { skip: !academicYearId }
  );
  const categoryRows =
    operation === 'refund' || operation === 'refund-policy'
      ? data?.expenseCategories
      : data?.incomeCategories;
  const categories =
    operation === 'refund-policy'
      ? [...(categoryRows ?? [])].sort(
          (a, b) =>
            Number(b.label.trim().toLowerCase() === 'none') -
            Number(a.label.trim().toLowerCase() === 'none')
        )
      : categoryRows;
  const field = (
    name: string,
    label: string,
    options: { id: string; label: string }[] | undefined
  ) => {
    const unavailable = formik.values[name] && !options?.some((x) => x.id === formik.values[name]);
    const savedSelection = { id: formik.values[name], label: 'Saved selection (unavailable)' };
    const fieldOptions = !unavailable
      ? (options ?? [])
      : operation === 'refund-policy' && name === categoryField
        ? [...(options ?? []), savedSelection]
        : [savedSelection, ...(options ?? [])];
    return (
      <CustomSelect
        key={name}
        fullWidth
        size="small"
        label={label}
        name={name}
        value={formik.values[name] || ''}
        options={fieldOptions}
        labelKey="label"
        valueKey="id"
        isSearch
        isLoading={isFetching}
        disabledValues={unavailable ? [formik.values[name]] : []}
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
  };
  return (
    <Stack spacing={2} sx={{ py: 1 }}>
      {isError && (
        <Alert severity="error">
          Financial selections could not be loaded. Retry before saving.
        </Alert>
      )}
      {skeletonLoading && isFetching ? (
        <Stack role="status" aria-label="Loading refund accounting options" spacing={2}>
          <Skeleton variant="rounded" height={40} />
          {bankField && <Skeleton variant="rounded" height={40} />}
        </Stack>
      ) : (
        <>
          {field(categoryField, categoryLabel, categories)}
          {bankField && field(bankField, bankLabel, data?.bankAccounts)}
        </>
      )}
    </Stack>
  );
}
