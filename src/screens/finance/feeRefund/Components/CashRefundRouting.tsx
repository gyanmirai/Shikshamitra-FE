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
}

/** Mounted only by an authorized command that completes a cash payout. */
export default function CashRefundRouting({
  academicYearId,
  defaultExpenseCategoryId,
  busy,
  onChange,
}: {
  academicYearId: string;
  defaultExpenseCategoryId?: string | null;
  busy?: boolean;
  onChange: (values: CashRefundRoutingValues | null) => void;
}) {
  const query = useGetFinanceRoutingOptionsQuery(
    { academicYearId, operation: 'refund' },
    { skip: !academicYearId }
  );
  const [values, setValues] = useState<CashRefundRoutingValues>({
    expenseCategoryId: '',
  });
  const categories = useMemo(() => query.currentData?.expenseCategories ?? [], [query.currentData]);
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
      };
      return current.expenseCategoryId === next.expenseCategoryId ? current : next;
    });
  }, [categories, unavailable, defaultExpenseCategoryId]);
  useEffect(() => {
    onChange(
      !unavailable &&
        categories.some((x) => x.id === values.expenseCategoryId)
        ? values
        : null
    );
  }, [categories, unavailable, values, onChange]);
  useEffect(() => () => onChange(null), [onChange]);
  const requirements: FinancePrerequisite[] = [];
  const state = {
    isLoading: loading,
    isError: query.isError,
    isUninitialized: query.isUninitialized,
  };
  if (isFinancePrerequisiteMissing({ ...state, options: categories }))
    requirements.push({ key: 'expense-category' });
  return (
    <FormSectionCard
      title="Cash expense routing"
      icon="solar:wallet-bold-duotone"
      descriptionTooltip="Choose the expense category used when approval completes this cash refund."
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
          <RefundRoutingField
            field="expenseCategoryId"
            value={values.expenseCategoryId}
            options={categories}
            loading={loading || query.isUninitialized}
            disabled={busy}
            onChange={(event) => setValues({ expenseCategoryId: event.target.value })}
          />
        </Grid>
      )}
    </FormSectionCard>
  );
}
