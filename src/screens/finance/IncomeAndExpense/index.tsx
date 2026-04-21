'use client';

import React from 'react';
import { Box, Tab } from '@mui/material';
import { useTabs } from 'src/hooks/use-tabs';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import IncomeTracking from '../IncomeTracking';
import FinanceExpenseTracking from '../ExpenseTracking';

const TABS = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

const IncomeAndExpense = () => {
  const tabs = useTabs('income');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Income & Expense"
        description="Manage income and expense records for the institution."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Accounts', href: '/finance/income-and-expense' },
          { name: 'Income & Expense' },
        ]}
      />

      <CustomTabs value={tabs.value} onChange={tabs.onChange} sx={{ mb: 2 }}>
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </CustomTabs>

      <Box sx={{ flex: 1 }}>
        {tabs.value === 'income' && <IncomeTracking />}
        {tabs.value === 'expense' && <FinanceExpenseTracking />}
      </Box>
    </Box>
  );
};

export default IncomeAndExpense;
