'use client';

import type { FormikProps } from 'formik';
import type { RoutingOperation } from 'src/redux/finance/financeRoutingApi';

import { Stack, Alert, Skeleton } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';

import FinancePrerequisiteState from './FinancePrerequisiteState';
import { isFinancePrerequisiteMissing } from './financePrerequisites';
import { useRefreshFinancePrerequisites } from '../hooks/useRefreshFinancePrerequisites';

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
  categoryRequired?: boolean;
  bankRequired?: boolean;
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
  categoryRequired,
  bankRequired,
}: Props) {
  const query = useGetFinanceRoutingOptionsQuery(
    { academicYearId, operation },
    { skip: !academicYearId }
  );
  const { isFetching, isError } = query;
  const data = query.currentData ?? query.data;
  const expense = ['refund', 'refund-policy', 'expense-entry', 'cash-expense'].includes(operation);
  const requiresCategory =
    categoryRequired ??
    (operation === 'refund-policy'
      ? formik.values.status === 'Active'
      : operation === 'collection-policy'
        ? formik.values.status === 'Active' && Boolean(formik.values.enableLateFee)
        : true);
  const requiresBank =
    bankRequired ??
    Boolean(bankField && (operation !== 'refund-policy' || formik.values.status === 'Active'));
  useRefreshFinancePrerequisites(
    () => {
      query.refetch();
    },
    Boolean(academicYearId) && !disabled && !query.isUninitialized
  );
  const categoryRows = expense ? data?.expenseCategories : data?.incomeCategories;
  const categories = categoryRows
    ?.slice()
    .sort(
      (a, b) =>
        Number(b.label.trim().toLowerCase() === 'none') -
        Number(a.label.trim().toLowerCase() === 'none')
    );
  const missingCategory = isFinancePrerequisiteMissing({
    ...query,
    options: categories,
    required: requiresCategory && !formik.values[categoryField],
  });
  const missingBank = isFinancePrerequisiteMissing({
    ...query,
    options: data?.bankAccounts,
    required: requiresBank && Boolean(bankField) && !formik.values[bankField!],
  });
  const field = (
    name: string,
    label: string,
    options: { id: string; label: string }[] | undefined
  ) => {
    const unavailable = formik.values[name] && !options?.some((x) => x.id === formik.values[name]);
    const savedSelection = { id: formik.values[name], label: 'Saved selection (unavailable)' };
    const fieldOptions = !unavailable
      ? (options ?? [])
      : name === categoryField
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
        disabled={disabled || isError || isFetching}
        onChange={(value) => {
          formik.setFieldValue(name, value);
          formik.setFieldTouched(name, true, false);
        }}
        onBlur={formik.handleBlur}
        error={Boolean(formik.touched[name] && formik.errors[name])}
        helperText={
          formik.touched[name] && formik.errors[name]
            ? String(formik.errors[name])
            : name === categoryField &&
                categories?.some(
                  (option) =>
                    option.id === formik.values[name] &&
                    option.label.trim().toLowerCase() === 'none'
                )
              ? 'None excludes this amount from Accounts income and expenses.'
              : undefined
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
          {missingCategory ? (
            <FinancePrerequisiteState
              requirements={[{ key: expense ? 'expense-category' : 'income-category' }]}
              onRefresh={() => {
                query.refetch();
              }}
              compact
            />
          ) : (
            field(categoryField, categoryLabel, categories)
          )}
          {bankField &&
            (missingBank ? (
              <FinancePrerequisiteState
                requirements={[{ key: 'bank-account' }]}
                onRefresh={() => {
                  query.refetch();
                }}
                compact
              />
            ) : (
              field(bankField, bankLabel, data?.bankAccounts)
            ))}
        </>
      )}
    </Stack>
  );
}
