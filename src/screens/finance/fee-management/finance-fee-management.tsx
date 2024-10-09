'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';

import FinanceFeeStructureOverview from './Tabs/finance-fee-structure-overview/finance-fee-structure-overview';
import FinanceStudentStructureOverview from './Tabs/finanace-student-structure-overview/finance-student-structure-overview';

const TABS = [
  {
    value: 'Fee-structure-overview',
    label: 'Fee Structure overview',
    component: () => <FinanceFeeStructureOverview />,
  },
  {
    value: 'student-fee-managment',
    label: 'Student Fee Managment',
    component: () => <FinanceStudentStructureOverview />,
  },
];

const FinanceFeeManagementScreen = () => {
  const tabs = useTabs('Fee-structure-overview');

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

export default FinanceFeeManagementScreen;
