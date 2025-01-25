'use client';

import React, { useMemo } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import BankConfiguration from './component/bank-configuration';
import SetDefaultFeeComponent from './component/set-default-fee-component';
import BudgetThresoldAlertComponent from './component/budget-thresold-alert-component';
import CurrencyAndTaxSavingsComponent from './component/currency-and-tax-savings-component';
import ConfigurePaymentStatusComponent from './component/configure-payment-status-component';
import DefinedSchoolWideRulesComponent from './component/defined-school-wide-rules-component';
import PresetCategoryAndDepartmentForBudget from './component/preset-category-and-department-for-budget';
import PredefinedCategoryIncomeExpenseComponent from './component/predefined-category-income-expense-component';
import CurrencySettingForDifferentRegionComponent from './component/currency-setting-for-different-region-component';

const TABS = [
  {
    value: 'setDefaultFeeComponents',
    label: 'Set Default Fee Components',
    component: () => <SetDefaultFeeComponent />,
  },
  {
    value: 'bankList',
    label: 'Bank Configuration',
    component: () => <BankConfiguration />,
  },
  {
    value: 'defineSchoolWideRules',
    label: 'Define School-Wide Rules',
    component: () => <DefinedSchoolWideRulesComponent />,
  },
  {
    value: 'currencySettingsForDifferentRegions',
    label: 'Currency Settings for Different Regions',
    component: () => <CurrencySettingForDifferentRegionComponent />,
  },
  {
    value: 'currencyAndTaxSettings',
    label: 'Currency and Tax Settings',
    component: () => <CurrencyAndTaxSavingsComponent />,
  },
  {
    value: 'configurePaymentStatusOptions',
    label: 'Configure Payment Status Options',
    component: () => <ConfigurePaymentStatusComponent />,
  },
  {
    value: 'predefinedCategoriesForincomeandexpenses',
    label: 'Predefined Categories For income and expenses',
    component: () => <PredefinedCategoryIncomeExpenseComponent />,
  },
  {
    value: 'budgetThresholdAlerts',
    label: 'Budget Threshold Alerts',
    component: () => <BudgetThresoldAlertComponent />,
  },
  {
    value: 'presentCategoriesandDepartmentsforBudgeting',
    label: 'Present Categories and Departments for Budgeting',
    component: () => <PresetCategoryAndDepartmentForBudget />,
  },
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
        links={[{ name: 'Finance' }, { name: 'General Settings' }, { name: breadcrumbTabName }]}
        sx={{ px: 1, mb: 2 }}
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
