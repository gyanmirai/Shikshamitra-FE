'use client';

import React, { useMemo, useEffect } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceFeeStructureOverview from './Tabs/finance-fee-structure-overview/finance-fee-structure-overview';
import FinanceStudentStructureOverview from './Tabs/finanace-student-structure-overview/finance-student-structure-overview';

const TABS = [
  {
    value: 'Fee-structure-overview',
    label: 'Fee Structure Overview',
    icon: <Iconify icon="stash:feed-duotone" width={20} />,
    component: (props: any) => <FinanceFeeStructureOverview {...props} />,
  },
  {
    value: 'student-fee-managment',
    label: 'Student Fee Management',
    icon: <Iconify icon="fluent-mdl2:account-management" width={20} />,
    component: (props: any) => <FinanceStudentStructureOverview {...props} />,
  },
];

const FinanceFeeManagementScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'Fee-structure-overview' });

  useEffect(() => {
    if (!searchParams.tab) {
      setSearchParams({ tab: 'Fee-structure-overview' });
    }
  }, [searchParams, setSearchParams]);

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab) || TABS[0],
    [searchParams.tab]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    if (searchParams.tab !== newValue) {
      setSearchParams({ tab: newValue });
    }
  };

  const activeTabName =
    searchParams.tab === 'Fee-structure-overview'
      ? 'Fee Structure Overview'
      : 'Student Fee Management';

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Fee Management"
        links={[{ name: 'Finance' }, { name: 'Fee Management' }, { name: activeTabName }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Card>
        <CustomTabs
          value={searchParams.tab}
          onChange={handleTabChange}
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
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}
      </Box>
    </Box>
  );
};

export default FinanceFeeManagementScreen;
