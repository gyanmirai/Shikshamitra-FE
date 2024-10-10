'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';

import FinanceTaxSettingTab from './tax-setting/finance-tax-setting-tab';
import FinanceBudgetSettingTab from './budget/finance-budget-setting-tab';
import FinanceIncomeSettingTab from './income-category/finance-income-setting-tab';
import FinanceGeneralSettingTab from './general-setting/finance-general-setting-tab';
import FinanceExpenseSettingTab from './expense-category/finance-expense-setting-tab';
import FinanceNotificationSettingTab from './notification/finance-notification-setting-tab';
import FinanceFeeStructureSettingTab from './fee-structure/finance-fee-structure-setting-tab';
import FinancePaymentMethodSettingTab from './payment-method/finance-payment-method-setting-tab';

const TABS = [
  {
    value: 'general-setting',
    label: 'General Settings',
    component: () => <FinanceGeneralSettingTab />,
  },
  {
    value: 'feestructure',
    label: 'Fee Structure',
    component: () => <FinanceFeeStructureSettingTab />,
  },
  {
    value: 'expensecategory',
    label: 'Expense Category',
    component: () => <FinanceExpenseSettingTab />,
  },
  {
    value: 'incomecategory',
    label: 'Income Category',
    component: () => <FinanceIncomeSettingTab />,
  },
  {
    value: 'taxsetting',
    label: 'Tax-Setting',
    component: () => <FinanceTaxSettingTab />,
  },
  {
    value: 'budget',
    label: 'Budget',
    component: () => <FinanceBudgetSettingTab />,
  },
  {
    value: 'paymentmethod',
    label: 'Payment Method',
    component: () => <FinancePaymentMethodSettingTab />,
  },
  {
    value: 'notification',
    label: 'Notification',
    component: () => <FinanceNotificationSettingTab />,
  },
];

const FinanceSettingScreen = () => {
  const tabs = useTabs('general-setting');

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

export default FinanceSettingScreen;
