'use client';

import React, { useMemo } from 'react';

import { Tab, Box } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import OtherReports from './other-report';
import PayrollReports from './payroll-report';
import CreateTemplate from './create-template';

const TABS = [
  {
    value: 'payroll',
    label: 'Payroll Reports',
    icon: <Iconify icon="mage:notification-bell-fill" width={20} />,
    component: () => <PayrollReports />,
  },
  {
    value: 'other',
    label: 'Other Reports',
    icon: <Iconify icon="hugeicons:configuration-02" width={20} />,
    component: () => <OtherReports />,
  },
  {
    value: 'template',
    label: 'Create Template',
    icon: <Iconify icon="hugeicons:configuration-02" width={20} />,
    component: () => <CreateTemplate />,
  },
];

const ReportsScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'payroll' });
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Reports"
        links={[{ name: 'HR/Staff', href: '/hr/dashboard/' }, { name: 'Reports' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomTabs
        value={searchParams.tab}
        onChange={(e, value) => setSearchParams({ tab: value })}
        sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
        role="tablist"
      >
        {TABS.map((tab) => (
          <Tab
            // sx={{ fontSize: '12px' }}
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            label={tab.label}
            role="tab"
          />
        ))}
      </CustomTabs>
      <Box sx={{ p: 1, flexGrow: 1 }}>
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

export default ReportsScreen;
