import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Grid } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';

import RefundRoutingField from './RefundRoutingField';
import FinancePrerequisiteState from '../../components/FinancePrerequisiteState';
import { useRefreshFinancePrerequisites } from '../../hooks/useRefreshFinancePrerequisites';
import {
  type FinancePrerequisite,
  isFinancePrerequisiteMissing,
} from '../../components/financePrerequisites';

export interface CashRefundRoutingValues {
  expenseCategoryId: string;
  bankAccountId: string;
}

/** Mounted only by an authorized command that completes a cash payout. */
export default function CashRefundRouting({
  academicYearId,
  defaultExpenseCategoryId,
  defaultBankAccountId,
  busy,
  onChange,
}: {
  academicYearId: string;
  defaultExpenseCategoryId?: string | null;
  defaultBankAccountId?: string | null;
  busy?: boolean;
  onChange: (values: CashRefundRoutingValues | null) => void;
}) {
  const query = useGetFinanceRoutingOptionsQuery(
    { academicYearId, operation: 'refund' },
    { skip: !academicYearId }
  );
  const [values, setValues] = useState<CashRefundRoutingValues>({
    expenseCategoryId: '',
    bankAccountId: '',
  });
  const categories = useMemo(() => query.currentData?.expenseCategories ?? [], [query.currentData]);
  const banks = useMemo(() => query.currentData?.bankAccounts ?? [], [query.currentData]);
  const loading = query.isLoading || query.isFetching;
  const unavailable = loading || query.isError || query.isUninitialized || !query.currentData;
  const refresh = () => {
    if (academicYearId) query.refetch();
  };
  useRefreshFinancePrerequisites(refresh);
  useEffect(() => {
    if (unavailable) return;
    setValues((current) => {
      const next = {
        expenseCategoryId: categories.some((x) => x.id === current.expenseCategoryId)
          ? current.expenseCategoryId
          : categories.some((x) => x.id === defaultExpenseCategoryId)
            ? (defaultExpenseCategoryId ?? '')
            : '',
        bankAccountId: banks.some((x) => x.id === current.bankAccountId)
          ? current.bankAccountId
          : banks.some((x) => x.id === defaultBankAccountId)
            ? (defaultBankAccountId ?? '')
            : '',
      };
      return current.expenseCategoryId === next.expenseCategoryId &&
        current.bankAccountId === next.bankAccountId
        ? current
        : next;
    });
  }, [categories, banks, unavailable, defaultExpenseCategoryId, defaultBankAccountId]);
  useEffect(() => {
    onChange(
      !unavailable &&
        categories.some((x) => x.id === values.expenseCategoryId) &&
        banks.some((x) => x.id === values.bankAccountId)
        ? values
        : null
    );
  }, [categories, banks, unavailable, values, onChange]);
  useEffect(() => () => onChange(null), [onChange]);
  const requirements: FinancePrerequisite[] = [];
  const state = {
    isLoading: loading,
    isError: query.isError,
    isUninitialized: query.isUninitialized,
  };
  if (isFinancePrerequisiteMissing({ ...state, options: categories }))
    requirements.push({ key: 'expense-category' });
  if (isFinancePrerequisiteMissing({ ...state, options: banks }))
    requirements.push({ key: 'bank-account' });
  return (
    <FormSectionCard
      title="Cash expense routing"
      icon="solar:wallet-bold-duotone"
      descriptionTooltip="Choose the expense category and source school bank account used when approval completes this cash refund."
    >
      {requirements.length ? (
        <FinancePrerequisiteState requirements={requirements} onRefresh={refresh} />
      ) : query.isError ? (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={refresh}>
              Retry
            </Button>
          }
        >
          Unable to load refund payment routing. Try again.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {(['expenseCategoryId', 'bankAccountId'] as const).map((field) => (
            <RefundRoutingField
              key={field}
              field={field}
              value={values[field]}
              options={field === 'expenseCategoryId' ? categories : banks}
              loading={loading || query.isUninitialized}
              disabled={busy}
              onChange={(event) =>
                setValues((current) => ({ ...current, [field]: event.target.value }))
              }
            />
          ))}
        </Grid>
      )}
    </FormSectionCard>
  );
}
