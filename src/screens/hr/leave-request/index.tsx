'use client';

import type { useSearchParamReturnType } from 'src/hooks/use-search-param';

import React, { useMemo } from 'react';

import { Box, Tab } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import LeaveHistory from './leave-history';
import LeaveCalender from './leave-calender';

export interface TabComponentType {
  searchParams?: useSearchParamReturnType[0];
  setSearchParams?: useSearchParamReturnType[1];
}

const TABS = [
  {
    value: 'leaveCalender',
    label: 'Leave Calender',
    icon: <Iconify icon="uim:calender" width={20} />,
    component: (props: TabComponentType) => <LeaveCalender {...props} />,
  },
  {
    value: 'leaveRequest',
    label: 'Leave Request',
    icon: <Iconify icon="pajamas:merge-request" width={20} />,
    component: (props: TabComponentType) => <LeaveHistory {...props} />,
  },
];

const LeaveRequest = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'leaveCalender' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading={currentActiveComponent?.label}
        links={[
          { name: 'HR' },
          { name: 'Attendance and Leave Management' },
          { name: currentActiveComponent?.label },
        ]}
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
      <Scrollbar sx={{ p: 1 }}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}
      </Scrollbar>
    </Box>
  );
};

export default LeaveRequest;
