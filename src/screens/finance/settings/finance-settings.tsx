'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';

import FinanceBudgetSettingTab from './budget/finance-budget-setting';
// eslint-disable-next-line import/no-named-as-default
import FinanceTaxSettingTab from './tax-setting/finance-tax-setting-tab';
// eslint-disable-next-line import/no-named-as-default
import FinanceIncomeSettingTab from './income-category/finance-income-setting-tab';
import FinanceGeneralSettingTab from './general-setting/finance-general-setting-tab';
// eslint-disable-next-line import/no-named-as-default
import FinanceExpenseSettingTab from './expense-category/finance-expense-setting-tab';
// import FinanceNotificationSettingTab from './notification/finance-notification-setting-tab';
import FinanceNotificationSettingTab from './notification/finance-notification-setting-tab';
// eslint-disable-next-line import/no-named-as-default
import FinanceFeeStructureSettingTab from './fee-structure/finance-fee-structure-setting-tab';
// eslint-disable-next-line import/no-named-as-default
import FinancePaymentMethodSettingTab from './payment-method/finance-payment-method-setting-tab';
import FinanceSettingFeeCollectionTab from './fee-collection/finance-setting-fee-collection-tab';

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
    value: 'feecollection',
    label: 'Fee Collection',
    component: () => <FinanceSettingFeeCollectionTab />,
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
