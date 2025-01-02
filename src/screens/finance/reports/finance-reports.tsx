'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';

import FinancialBudgetReports from './budget/financial-budget-reports';
import FinanceIncomeReports from './income-reports/finance-income-reports';
import FinanceExpenseReports from './expense-reports/finance-expense-reports';
import FinanceFeeReportsScreen from './fee-reports/finance-fee-reports.screen';
import FinancialReportsScreen from './financial-reports/financial-reports-screen';
import FinanceNetbalanceAnalyticsTab from './net-balance-analytics/finance-net-balance-analytics-tab';

const TABS = [
  {
    value: 'financial-reports',
    label: 'Financial Reports',
    component: () => <FinancialReportsScreen />,
  },
  {
    value: 'feeReports',
    label: 'Fee Reports',
    component: () => <FinanceFeeReportsScreen />,
  },
  {
    value: 'expenseReports',
    label: 'Expense Reports',
    component: () => <FinanceExpenseReports />,
  },
  {
    value: 'incomeReports',
    label: 'Income Reports',
    component: () => <FinanceIncomeReports />,
  },
  {
    value: 'net-balance-analytics',
    label: 'Net Balance Analytics',
    component: () => <FinanceNetbalanceAnalyticsTab />,
  },
  {
    value: 'budget-performance-reports',
    label: 'Budget Performance Reports',
    component: () => <FinancialBudgetReports />,
  },
];

const FinanceReportsScreen = () => {
  const tabs = useTabs('financial-reports');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <Box>
      <Card>
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>
    </Box>
  );
};

export default FinanceReportsScreen;
