'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PF from './pf';
import ProfessionalTax from './professional-tax';
import SalaryComponent from './salary-component';
import StatutaryTemplate from './statutaryTemplate/statutaryTemplate';

const TABS = [
  {
    value: 'statutoryTemplate',
    label: 'Statutory Template',
    component: () => <StatutaryTemplate />,
  },
  {
    value: 'salaryComponent',
    label: 'Salary Component',
    component: () => <SalaryComponent />,
  },
  {
    value: 'pf',
    label: 'PF',
    component: () => <PF />,
  },
  { value: 'professionalTax', label: 'Professional Tax', component: () => <ProfessionalTax /> },
  // { value: 'tds', label: 'TDS', component: () => <TDS /> },
];

const PayrollSettingScreen = () => {
  const tabs = useTabs('statutoryTemplate');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Setting' }]}
        sx={{ px: 1, mb: 2 }}
        description="In this section, you can configure payroll settings, including Professional Tax, Provident Fund (PF), and Salary Components to ensure accurate salary processing."
      />
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
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

export default PayrollSettingScreen;
