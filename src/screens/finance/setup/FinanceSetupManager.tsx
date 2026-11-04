'use client';

import type { ComponentType } from 'react';

import dynamic from 'next/dynamic';
import { Stack, Skeleton } from '@mui/material';

import type { FinanceSetupSettingKey } from './finance-setup-catalog';

function LoadingManager() {
  return (
    <Stack spacing={1} role="status" aria-label="Loading Finance setting">
      <Skeleton height={40} />
      <Skeleton variant="rounded" height={240} />
    </Stack>
  );
}

const managers = {
  'income-categories': dynamic(() => import('src/screens/finance/settings/IncomeCategories'), {
    loading: LoadingManager,
  }),
  'expense-categories': dynamic(
    () => import('src/screens/finance/settings/ExpenseCategories/ExpenseCategories'),
    { loading: LoadingManager }
  ),
  'bank-accounts': dynamic(() => import('src/screens/finance/settings/BankAccManagement'), {
    loading: LoadingManager,
  }),
  'fee-categories': dynamic(() => import('src/screens/finance/settings/FeeCategory'), {
    loading: LoadingManager,
  }),
  'payment-terms': dynamic(() => import('src/screens/finance/settings/PaymentTerm'), {
    loading: LoadingManager,
  }),
  'charge-categories': dynamic(
    () => import('src/screens/finance/settings/ChargeCategory/ChargeCategory'),
    { loading: LoadingManager }
  ),
  'concession-types': dynamic(() => import('src/screens/finance/settings/ConcessionTypeSetting'), {
    loading: LoadingManager,
  }),
  'collection-policy': dynamic(
    () => import('src/screens/finance/policies/workspaces/CollectionPolicyWorkspace'),
    { loading: LoadingManager }
  ),
  'refund-policy': dynamic(
    () => import('src/screens/finance/policies/workspaces/RefundPolicyWorkspace'),
    { loading: LoadingManager }
  ),
  'concession-policy': dynamic(
    () => import('src/screens/finance/policies/workspaces/ConcessionPolicyWorkspace'),
    { loading: LoadingManager }
  ),
  'proration-policy': dynamic(
    () => import('src/screens/finance/policies/workspaces/ProrationPolicyWorkspace'),
    { loading: LoadingManager }
  ),
  'fee-structures': dynamic(() => import('src/screens/finance/settings/FeeStructure'), {
    loading: LoadingManager,
  }),
} satisfies Record<FinanceSetupSettingKey, ComponentType>;

export default function FinanceSetupManager({ setting }: { setting: FinanceSetupSettingKey }) {
  const Manager = managers[setting];
  return <Manager />;
}
