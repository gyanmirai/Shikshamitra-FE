'use client';

import { Box, Tab, Paper } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/useBoolean';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import { useSearchParam } from 'src/hooks/useSearchParam';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import EmployeeNotificationManagement from './components/EmployeeNoticationManagement';
import AttendanceLeaveNotificationManagement from './components/AttendanceLeaveNotificationManagement';

// ----------------------------------------------------
// TABS CONFIG
// ----------------------------------------------------
const TABS = [
  {
    value: 'employee',
    label: 'Employee',
    icon: <Iconify icon="mdi:account-tie-outline" width={20} />,
    component: (props: any) => <EmployeeNotificationManagement {...props} />,
  },
  {
    value: 'attendanceLeave',
    label: 'Attendance & Leave',
    icon: <Iconify icon="mdi:clipboard-list-outline" width={20} />,
    component: (props: any) => <AttendanceLeaveNotificationManagement {...props} />,
  },
];

// ----------------------------------------------------
// MAIN SCREEN
// ----------------------------------------------------
const HRNotificationScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'employee' });
  const dialog = useBoolean(false);

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams?.tab]
  );

  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const [isViewMode, setIsViewMode] = useState(false);
  const [isBackClick, setIsBackClick] = useState(false);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {dialog.value ? (
        <CustomBreadcrumbs
          heading={isViewMode ? 'View Notification' : 'Edit Notification'}
          description="Configure notifications for employees, attendance, and leave management."
          links={[
            { name: 'HR/Staff', href: '/hr/dashboard' },
            {
              name: 'Notification',
              href: '/hr/notification',
              onClick(e) {
                dialog.onFalse();
              },
            },
            isViewMode ? { name: 'View Notification' } : { name: 'Edit Notification' },
          ]}
          isBack
          onBack={() => dialog.onFalse()}
          sx={{ px: 1 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Notification"
          description="Configure notifications for employees, attendance, and leave management."
          links={[
            { name: 'HR/Staff', href: '/hr/dashboard' },
            { name: 'Notification', href: '/hr/notification' },
          ]}
          sx={{ px: 1 }}
        />
      )}

      {/* Tabs */}
      <Paper
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        {!dialog.value && (
          <CustomTabs
            value={searchParams.tab}
            onChange={(e, value) => {
              const newIndex = TABS.findIndex((tab) => tab.value === value);
              setIsBackClick(currentIndex > newIndex);
              setSearchParams({ tab: value });
            }}
            sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: 2 }}
            role="tablist"
          >
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
            ))}
          </CustomTabs>
        )}
      </Paper>

      {/* Slider Content */}
      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: { p: 0, minHeight: 0 },
        }}
      >
        <Paper sx={{ height: '100%' }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component dialog={dialog} setIsViewMode={setIsViewMode} />
          )}
        </Paper>
      </FormSlider>
    </Box>
  );
};

export default HRNotificationScreen;
