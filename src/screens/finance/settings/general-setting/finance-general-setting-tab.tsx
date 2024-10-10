import React from 'react';

import { Box } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';

import SetDefaultFeeComponent from './component/set-default-fee-component';
import BudgetThresoldAlertComponent from './component/budget-thresold-alert-component';
import CurrencyAndTaxSavingsComponent from './component/currency-and-tax-savings-component';
import ConfigurePaymentStatusComponent from './component/configure-payment-status-component';
import DefinedSchoolWideRulesComponent from './component/defined-school-wide-rules-component';
import PresetCategoryAndDepartmentForBudget from './component/preset-category-and-department-for-budget';
import PredefinedCategoryIncomeExpenseComponent from './component/predefined-category-income-expense-component';
import CurrencySettingForDifferentRegionComponent from './component/currency-setting-for-different-region-component';

const FinanceGeneralSettingTab = () => (
  <Box display="flex" flexDirection="row" gap={10}>
    <Grid2 lg={3} md={12} spacing={1}>
      <SetDefaultFeeComponent />
      <CurrencySettingForDifferentRegionComponent />
      <ConfigurePaymentStatusComponent />
      <CurrencyAndTaxSavingsComponent />
    </Grid2>

    <Grid2 lg={9} md={12}>
      <DefinedSchoolWideRulesComponent />
      <PredefinedCategoryIncomeExpenseComponent />
      <BudgetThresoldAlertComponent />
      <PresetCategoryAndDepartmentForBudget />
    </Grid2>
  </Box>
);

export default FinanceGeneralSettingTab;
