'use client';

import React, { useMemo } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

import FinanceFeeStructureOverview from './Tabs/finance-fee-structure-overview/finance-fee-structure-overview';
import FinanceStudentStructureOverview from './Tabs/finanace-student-structure-overview/finance-student-structure-overview';

const TABS = [
  {
    value: 'Fee-structure-overview',
    label: 'Fee Structure overview',
    icon: <Iconify icon="stash:feed-duotone" width={20} />,
    component: () => <FinanceFeeStructureOverview />,
  },
  {
    value: 'student-fee-managment',
    label: 'Student Fee Managment',
    icon: <Iconify icon="fluent-mdl2:account-management" width={20} />,
    component: () => <FinanceStudentStructureOverview />,
  },
];

const FinanceFeeManagementScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'Fee-structure-overview' });

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
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
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

export default FinanceFeeManagementScreen;
