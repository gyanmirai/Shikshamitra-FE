'use client';

import React, { useMemo } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SetPaymentTerm from './component/setting-up-payment-term';
import SetPaymentMethodComponent from './component/set-payment-method';
import SetLateFeeTypeMethod from './component/set-late-fee-type-method';
import SetDefaultFeeComponent from './component/set-default-fee-component';
import ConfigurePaymentStatusComponent from './component/configure-payment-status-component';
import PresetCategoryAndDepartmentForBudget from './component/preset-category-and-department-for-budget';
import PredefinedCategoryIncomeExpenseComponent from './component/predefined-category-income-expense-component';

const TABS = [
  {
    value: 'setDefaultFeeComponents',
    label: 'Set Fee Type',
    component: () => <SetDefaultFeeComponent />,
  },
  {
    value: 'setPaymentMethodComponents',
    label: 'Set Payment Method',
    component: () => <SetPaymentMethodComponent />,
  },
  {
    value: 'lateFeeType',
    label: 'Set Late Fee Type Method',
    component: () => <SetLateFeeTypeMethod />,
  },
  {
    value: 'setPaymentTerm',
    label: 'Set Payment Term',
    component: () => <SetPaymentTerm />,
  },

  {
    value: 'configurePaymentStatusOptions',
    label: 'Configure Payment Status Options',
    component: () => <ConfigurePaymentStatusComponent />,
  },
  {
    value: 'presentCategoriesandDepartmentsforBudgeting',
    label: 'Present Categories and Departments for Budgeting',
    component: () => <PresetCategoryAndDepartmentForBudget />,
  },
  {
    value: 'predefinedCategoriesForincomeandexpenses',
    label: 'Predefined Categories For income and expenses',
    component: () => <PredefinedCategoryIncomeExpenseComponent />,
  },

  // {
  //   value: 'budgetThresholdAlerts',
  //   label: 'Budget Threshold Alerts',
  //   component: () => <BudgetThresoldAlertComponent />,
  // },
  // {
  //   value: 'bankList',
  //   label: 'Bank Configuration',
  //   component: () => <BankConfiguration />,
  // },
  // {
  //   value: 'defineSchoolWideRules',
  //   label: 'Define School-Wide Rules',
  //   component: () => <DefinedSchoolWideRulesComponent />,
  // },
  // {
  //   value: 'currencySettingsForDifferentRegions',
  //   label: 'Currency Settings for Different Regions',
  //   component: () => <CurrencySettingForDifferentRegionComponent />,
  // },
  // {
  //   value: 'currencyAndTaxSettings',
  //   label: 'Currency and Tax Settings',
  //   component: () => <CurrencyAndTaxSavingsComponent />,
  // },
];
const FinanceGeneralSettingTab = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'setDefaultFeeComponents' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  // const tabs = useTabs('setDefaultFeeComponents');
  // const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  const breadcrumbTabName = TABS.find((tab) => tab.value === searchParams?.tab)?.label || '';
  return (
    <Box>
      <CustomBreadcrumbs
        heading="General Settings"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'General Settings' },
          { name: breadcrumbTabName },
        ]}
        sx={{ px: 1, mb: 2 }}
        description="This is the General Settings section for the Finance module, where you can manage fee heads, payment status options, and other required fields and details related to financial operations."
      />
      <Card>
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab sx={{ fontSize: '12px' }} key={tab.value} value={tab.value} label={tab.label} />
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

export default FinanceGeneralSettingTab;
// <Box display="flex" flexDirection="row" gap={10}>
//   <Grid2 lg={3} md={12} spacing={1}>
//     <SetDefaultFeeComponent />
//     <CurrencySettingForDifferentRegionComponent />
//     <ConfigurePaymentStatusComponent />
//     <CurrencyAndTaxSavingsComponent />
//   </Grid2>

//   <Grid2 lg={9} md={12}>
//     <DefinedSchoolWideRulesComponent />
//     <PredefinedCategoryIncomeExpenseComponent />
//     <BudgetThresoldAlertComponent />
//     <PresetCategoryAndDepartmentForBudget />
//   </Grid2>
// </Box>
