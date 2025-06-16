'use client';

import type { useSearchParamReturnType } from 'src/hooks/use-search-param';

import React, { useMemo, useState } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';
import { useBoolean, type UseBooleanReturn } from 'src/hooks/use-boolean';

import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import LeaveHistory from './leave-history';
import LeaveCalender from './leave-calender';

export interface TabComponentType {
  searchParams?: useSearchParamReturnType[0];
  setSearchParams?: useSearchParamReturnType[1];
  modal?: UseBooleanReturn;
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
  const modal = useBoolean();
  // Memoize the current active component based on searchParams.tab
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const [isBackClick, setIsBackClick] = useState(false);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Leave Management"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          {
            name: 'Attendance & Leave',
            href: `/hr/leave-requests/?tab=${currentActiveComponent?.value}`,
          },
          { name: 'Leave Management' },
        ]}
        sx={{ px: 1, mb: 2 }}
        description={
          currentActiveComponent?.value === 'leaveRequest'
            ? 'On this screen, you can create new leave requests for employees. The screen also displays a list of all previously created requests, where you can approve or reject them as needed.'
            : 'The Leave Calendar provides a visual overview of all employee leave requests. You can view the leave status for each employee on specific dates and track approved, pending, or rejected leaves.'
        }
      />
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
            if (currentIndex > newIndex) {
              setIsBackClick(true);
            } else {
              setIsBackClick(false);
            }

            setSearchParams({ tab: value });
          }}
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
      </Card>
      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
          },
        }}
      >
        <Scrollbar sx={{ p: 1 }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              modal={modal}
            />
          )}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};

export default LeaveRequest;
