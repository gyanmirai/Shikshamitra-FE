'use client';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HrEmployeeNotificationManagementScreen from './component/hr-employee-notification-management-screen';
import HrAttendanceNotificationManagementScreen from './component/hr-attendance-notification-management-screen';
import HrEventHolidayNotificationManagementScreen from './component/hr-event-holiday-notification-management-screen';

const HRStaticNotificationScreen = () => {
  const TABS = [
    {
      label: 'Employee',
      value: 'employee',
      icon: <Iconify icon="clarity:employee-line" width={20} />,
      component: () => <HrEmployeeNotificationManagementScreen />,
    },
    {
      label: 'Event & Holiday',
      value: 'eventAndHoliday',
      icon: <Iconify icon="material-symbols-light:event-available-outline" width={20} />,
      component: () => <HrEventHolidayNotificationManagementScreen />,
    },
    {
      label: 'Attendance & Leave',
      value: 'attendanceAndLeave',
      icon: <Iconify icon="hugeicons:task-daily-01" width={20} />,
      component: () => <HrAttendanceNotificationManagementScreen />,
    },
  ];

  const [searchParams, setSearchParams] = useSearchParam({ tab: 'employee' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.tab]
  );

  // const closeHandler = () => {

  // }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <CustomBreadcrumbs
          heading="Notification Settings"
          links={[{ name: 'HR' }, { name: 'Notification Settings' }]}
          sx={{ px: 1, mb: 2 }}
          description="In the Notification Settings, you can customize the message for each notification and enable or disable it as needed."
        />
        {/* <Button startIcon={<Iconify icon="eva:arrow-back-fill" />} size="small" variant='contained' onClick={closeHandler}>Back</Button> */}
      </Box>

      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
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
      <Box px={1} pt={2} height="100%">
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

export default HRStaticNotificationScreen;
