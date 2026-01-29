'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Tab, Box, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RollCallSetting from './rollCallSetting';
import LeaveTypeSetting from './leaveTypeSetting';

const TABS = [
  {
    value: 'rollCallSetting',
    label: 'Roll Call Setting',
    component: (props: TabComponentType) => <RollCallSetting {...props} />,
  },
  {
    value: 'leaveTypeSetting',
    label: 'Leave Type Setting',
    component: (props: TabComponentType) => <LeaveTypeSetting {...props} />,
  },
];
const HostelAttendanceSetting: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'rollCallSetting' });

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
          { name: 'Attendance And Leave Management', href: '' },
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
export default HostelAttendanceSetting;
