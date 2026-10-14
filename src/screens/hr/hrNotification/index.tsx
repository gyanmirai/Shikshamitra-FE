'use client';

import { Box, Tab, Paper } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { hrPaths } from 'src/constants/hr-menus';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTabs } from 'src/components/custom-tabs';
import { FormSlider } from 'src/components/form-slider';
import { Iconify } from 'src/components/iconify/iconify';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import EmployeeNotificationManagement from './Components/EmployeeNoticationManagement';
import AttendanceLeaveNotificationManagement from './Components/AttendanceLeaveNotificationManagement';

// ----------------------------------------------------
// TABS CONFIG
// ----------------------------------------------------
const TABS = [
  {
    value: 'employee',
    label: 'Staff',
    icon: <Iconify icon="mdi:account-tie-outline" width={20} />,
    component: (props: any) => <EmployeeNotificationManagement {...props} />,
  },
  {
    value: 'attendanceLeave',
    label: 'Attendance Management',
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
    <Box
      sx={{ height: '100%', minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}
    >
      {dialog.value ? (
        <CustomBreadcrumbs
          heading={isViewMode ? 'View Notification' : 'Edit Notification'}
          description="Configure notifications for staff, attendance, and leave management."
          links={[
            { name: 'HR/Staff', href: hrPaths.dashboard },
            {
              name: 'Notification',
              href: hrPaths.notification,
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
          description="Configure notifications for staff, attendance, and leave management."
          links={[{ name: 'HR/Staff', href: hrPaths.dashboard }, { name: 'Notification' }]}
          sx={{ px: 1 }}
        />
      )}

      {/* Tabs */}
      <Paper sx={{ flexShrink: 0 }}>
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
            aria-label="Notification settings"
            variant="scrollable"
            scrollButtons="auto"
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                id={`hr-notification-tab-${tab.value}`}
                aria-controls="hr-notification-panel"
                value={tab.value}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
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
        <Paper
          id="hr-notification-panel"
          role="tabpanel"
          aria-labelledby={`hr-notification-tab-${searchParams.tab}`}
          sx={{ height: '100%', minHeight: 0, minWidth: 0 }}
        >
          {currentActiveComponent?.component && (
            <currentActiveComponent.component dialog={dialog} setIsViewMode={setIsViewMode} />
          )}
        </Paper>
      </FormSlider>
    </Box>
  );
};

export default HRNotificationScreen;
