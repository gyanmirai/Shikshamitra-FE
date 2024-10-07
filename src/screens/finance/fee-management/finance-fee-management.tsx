'use client';

import React from 'react';

import { Box, Tab, Card, Button } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import FinanceStudentStructureOverview from './Tabs/finance-student-structure-overview';
import FinanceFeeStructureOverview from './Tabs/finance-fee-structure-overview-tsx/finance-fee-structure-overview';


const TABS = [{
    value: 'Fee-structure-overview',
    label: 'Fee Structure overview',
    component: () => <FinanceFeeStructureOverview />,
  },
  {
    value: 'student-fee-managment ',
    label: 'Student Fee Managment ',
    component: () => <FinanceStudentStructureOverview />,
  },]


const FinanceFeeManagementScreen = () => {
  const tabs = useTabs('Fee-structure-overview');
  

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <Box >
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
