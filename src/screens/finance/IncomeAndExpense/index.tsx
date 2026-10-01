'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Box, Tab, Alert } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import IncomeTracking from '../IncomeTracking';
import AccountsActivity from '../accounts/Activity';
import FinanceExpenseTracking from '../ExpenseTracking';

const TABS = [
  { value: 'all', label: 'All entries' },
  { value: 'income', label: 'Other income' },
  { value: 'expense', label: 'School expenses' },
];

const IncomeAndExpense = () => {
  const tabs = useTabs('all');
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canViewIncome = hasGrantedPermission(permissions, `${financePermissions.accounts.income}.View`);
  const canViewExpense = hasGrantedPermission(permissions, `${financePermissions.accounts.expense}.View`);
  const canViewFees = hasGrantedPermission(permissions, financePermissions.accounts.activity);
  const availableTabs = TABS.filter((tab) => tab.value === 'all' ||
    (tab.value === 'income' && canViewIncome) ||
    (tab.value === 'expense' && canViewExpense));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Income & Expenses"
        description="Find accepted fee collections, confirmed refunds, and other school income and expenses."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Accounts', href: '/finance/income-and-expense' },
          { name: 'Income & Expenses' },
        ]}
      />

      <CustomTabs value={availableTabs.some((tab) => tab.value === tabs.value) ? tabs.value : 'all'} onChange={tabs.onChange} sx={{ mb: 2 }}>
        {availableTabs.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </CustomTabs>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {!canViewFees && !canViewIncome && !canViewExpense ? (
          <Alert severity="error">You do not have permission to view Income & Expenses.</Alert>
        ) : (
          <>
            {tabs.value === 'all' && <AccountsActivity embedded />}
            {tabs.value === 'income' && canViewIncome && <IncomeTracking embedded />}
            {tabs.value === 'expense' && canViewExpense && <FinanceExpenseTracking embedded />}
          </>
        )}
      </Box>
    </Box>
  );
};

export default IncomeAndExpense;
