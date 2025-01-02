'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PF from './pf';
import AddPayElement from './add-pay-element';
import ProfessionalTax from './professional-tax';

const TABS = [
  {
    value: 'addPayElement',
    label: 'Add Pay Element',
    component: () => <AddPayElement />,
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
  const tabs = useTabs('addPayElement');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Setting' }]}
        sx={{ px: 1, mb: 2 }}
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
