'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/useSearchParam';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HostelFeeManagementSetting from './components/fee-management/feeManagement';
import VisitorManagementNotificationSetting from './components/visitor-management/visitorManagement';
import DisciplinaryNotificationSetting from './components/discipline-management/disciplineManagement';
import MaintenanceNotificationSetting from './components/maintenance-management/maintenanceManagement';

const TABS = [
  {
    value: 'feeManagement',
    label: 'Fee Management',
    component: (props: TabComponentType) => <HostelFeeManagementSetting {...props} />,
  },
  {
    value: 'visitorManagement',
    label: 'Visitor Entry Management',
    component: (props: TabComponentType) => <VisitorManagementNotificationSetting {...props} />,
  },
  {
    value: 'maintenanceManagement',
    label: 'Maintenance Management',
    component: (props: TabComponentType) => <MaintenanceNotificationSetting {...props} />,
  },
  {
    value: 'disciplineManagement',
    label: 'Disciplinary Actions Tracking & management',
    component: (props: TabComponentType) => <DisciplinaryNotificationSetting {...props} />,
  },
];

const HostelNotificationTabScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'hostelTypeDefinition' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        description="Hostel Configuration Setting"
        links={[
          { name: 'Hostel Management', href: '/hostel/dashboard' },
          { name: 'Setting', href: '' },
          { name: currentActiveComponent?.label, href: '' },
        ]}
      />
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}{' '}
      </Box>
    </Box>
  );
};

export default HostelNotificationTabScreen;
