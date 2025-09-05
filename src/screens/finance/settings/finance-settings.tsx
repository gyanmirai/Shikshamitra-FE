'use client';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';

import FinanceBudgetSettingTab from './budget/finance-budget-setting';
// eslint-disable-next-line import/no-named-as-default
import FinanceTaxSettingTab from './tax-setting/finance-tax-setting-tab';
import FinanceReceiptBookSetting from './receipt-book/finance-receipt-book';
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
import FinanceDiscountCategorySettingScreen from './discount-category/finance-discount-category-screen';

const TABS = [
  {
    value: 'general-setting',
    label: 'General Settings',
    icon: <Iconify icon="uil:setting" width={20} />,
    component: () => <FinanceGeneralSettingTab />,
  },
  {
    value: 'feestructure',
    label: 'Fee Structure',
    icon: <Iconify icon="fluent:document-fs-16-regular" width={20} />,
    component: () => <FinanceFeeStructureSettingTab />,
  },
  {
    value: 'discount category',
    label: 'Discount Category',
    icon: <Iconify icon="basil:notification-on-outline" width={20} />,
    component: () => <FinanceDiscountCategorySettingScreen />,
  },
  {
    value: 'receiptBook',
    label: 'Receipt Book',
    icon: <Iconify icon="bi:filetype-rb" width={20} />,
    component: () => <FinanceReceiptBookSetting />,
  },
  {
    value: 'feecollection',
    label: 'Fee Collection',
    icon: <Iconify icon="arcticons:expense-register" width={20} />,
    component: () => <FinanceSettingFeeCollectionTab />,
  },
  {
    value: 'expensecategory',
    label: 'Expense Category',
    icon: <Iconify icon="arcticons:expense-manager" width={20} />,
    component: () => <FinanceExpenseSettingTab />,
  },

  {
    value: 'incomecategory',
    label: 'Income Category',
    icon: <Iconify icon="arcticons:expense-manager" width={20} />,
    component: () => <FinanceIncomeSettingTab />,
  },
  {
    value: 'taxsetting',
    label: 'Tax-Setting',
    icon: <Iconify icon="hugeicons:taxes" width={20} />,
    component: () => <FinanceTaxSettingTab />,
  },
  {
    value: 'budget',
    label: 'Budget',
    icon: <Iconify icon="arcticons:budgetwatch" width={20} />,
    component: () => <FinanceBudgetSettingTab />,
  },
  {
    value: 'paymentmethod',
    label: 'Payment Method',
    icon: <Iconify icon="arcticons:mi-pay" width={20} />,
    component: () => <FinancePaymentMethodSettingTab />,
  },
  {
    value: 'notification',
    label: 'Notification',
    icon: <Iconify icon="basil:notification-on-outline" width={20} />,
    component: () => <FinanceNotificationSettingTab />,
  },
];

const FinanceSettingScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'general-setting' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <Card>
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              icon={tab.icon}
              key={tab.value}
              value={tab.value}
              label={tab.label}
            />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
          // searchParams={searchParams}
          // setSearchParams={setSearchParams}
          />
        )}
      </Box>
    </Box>
  );
};

export default FinanceSettingScreen;
