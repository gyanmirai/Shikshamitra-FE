"use client";

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';

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

  const tabs = useTabs('setDefaultFeeComponents');
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <Box>
      <Card>
        <CustomTabs
       
          value={tabs.value}
          onChange={tabs.onChange}
         
        
        >
          {TABS.map((tab) => (
            <Tab sx={{ fontSize: '12px' }} key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>
    </Box>
  );
}

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