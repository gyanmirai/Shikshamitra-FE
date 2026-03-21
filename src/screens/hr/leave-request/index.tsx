'use client';

import { Box, Tab, Paper } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { CustomTabs } from 'src/components/custom-tabs';
import { useNewSearchParam } from 'src/hooks/useSearchParam';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useBoolean, type UseBooleanReturn } from 'src/hooks/useBoolean';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import LeaveHistory from './leave-history';
import LeaveCalender from './leave-calender';

export interface TabComponentType {
  searchParams?: Record<string, any>;
  setSearchParams?: (obj: any) => void;
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
  const [searchParams, setSearchParams] = useNewSearchParam<{ tab?: string }>();
  const activeTab = searchParams?.tab || 'leaveCalender';
  const modal = useBoolean();
  // Memoize the current active component based on searchParams.tab
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === activeTab),
    [activeTab]
  );
  const currentIndex = useMemo(() => TABS.findIndex((tab) => tab.value === activeTab), [activeTab]);
  const [isBackClick, setIsBackClick] = useState(false);
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Leave Management"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Attendance & Leave', href: hrPaths.attendance.leaveManagement },
          { name: 'Leave Management' },
        ]}
        description={
          currentActiveComponent?.value === 'leaveRequest'
            ? 'Create new leave requests and manage existing ones by approving or rejecting them.'
            : 'The Leave Calendar visually displays employees leave requests and their statuses—approved, pending, or rejected—on specific dates.'
        }
      />
      <Paper
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={activeTab}
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
            if (currentIndex > newIndex) {
              setIsBackClick(true);
            } else {
              setIsBackClick(false);
            }

            setSearchParams({ tab: value });
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: 2 }}
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
      </Paper>
      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
            minHeight: 0,
          },
        }}
      >
        <Box sx={{ height: '100%' }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              modal={modal}
            />
          )}
        </Box>
      </FormSlider>
    </Box>
  );
};

export default LeaveRequest;
