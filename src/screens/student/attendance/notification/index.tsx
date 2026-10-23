'use client';

import type { RootState } from 'src/redux/store';

import { Box, Tab } from '@mui/material';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTabs } from 'src/components/custom-tabs';
import { FormSlider } from 'src/components/form-slider';
import { Iconify } from 'src/components/iconify/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import React, { useMemo, useState, useCallback } from 'react';
import { StudentFeedback } from 'src/components/student-feedback';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import AttendanceNotificationManagement from 'src/screens/student/studentNotification/Components/AttendanceNotification';
import EnrollmentNotificationManagement from 'src/screens/student/studentNotification/Components/EnrollmentNotification';

// Stable component references defined OUTSIDE the component to prevent
// new function identities on every render (which cases remount + re-fetch loops)
const AttendanceNotificationTab = (props: any) => <AttendanceNotificationManagement {...props} />;
const EnrollmentNotificationTab = (props: any) => <EnrollmentNotificationManagement {...props} />;

const TABS = [
  {
    value: 'attendance',
    label: 'Attendance',
    icon: <Iconify icon="mdi:calendar-check-outline" width={20} />,
    component: AttendanceNotificationTab,
    permissions: ['Students.Notification.AttendanceManagement.View'],
  },
  {
    value: 'enrollment',
    label: 'Enrollment',
    icon: <Iconify icon="mdi:account-school-outline" width={20} />,
    component: EnrollmentNotificationTab,
    permissions: [
      'Students.Notification.InquiryManagement.View',
      'Students.Notification.RegistrationManagement.View',
      'Students.Notification.AdmissionManagement.View',
    ],
  },
];

const StudentNotificationScreen = () => {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const visibleTabs = useMemo(
    () => TABS.filter((tab) => hasGrantedPermission(permissions, tab.permissions)),
    [permissions]
  );
  // Read tab directly from the URL to prevent useSearchParam custom hook loop
  const nativeSearchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requestedTab = nativeSearchParams.get('tab');
  const activeTab = visibleTabs.some((tab) => tab.value === requestedTab)
    ? requestedTab!
    : (visibleTabs[0]?.value ?? '');

  const setActiveTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(nativeSearchParams.toString());
      params.set('tab', tab);
      router.push(`${pathname}?${params.toString()}`);
    },
    [nativeSearchParams, router, pathname]
  );

  const dialog = useBoolean(false);

  const currentActiveComponent = useMemo(
    () => visibleTabs.find((tab) => tab.value === activeTab),
    [activeTab, visibleTabs]
  );
  const currentIndex = visibleTabs.findIndex((tab) => tab.value === activeTab);

  const [isViewMode, setIsViewMode] = useState(false);
  const [isBackClick, setIsBackClick] = useState(false);

  // Must be capitalized so React treats it as a component (not a DOM element)
  const ActiveComponent = currentActiveComponent?.component as React.ComponentType<any> | undefined;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {dialog.value ? (
        <CustomBreadcrumbs
          heading={isViewMode ? 'View Notification' : 'Edit Notification'}
          description="Configure notifications for student attendance and enrollment."
          links={[
            { name: 'Student', href: '/student/dashboard' },
            {
              name: 'Notification',
              href: '/student/attendance/notification',
              onClick(e) {
                dialog.onFalse();
              },
            },
            isViewMode ? { name: 'View Notification' } : { name: 'Edit Notification' },
          ]}
          isBack
          onBack={() => {
            dialog.onFalse();
          }}
          sx={{ px: 1 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Notification"
          description="Configure notifications for student attendance and enrollment."
          links={[
            { name: 'Student', href: '/student/dashboard' },
            { name: 'Notification', href: '/student/attendance/notification' },
          ]}
          sx={{ px: 1 }}
        />
      )}

      {!dialog.value && visibleTabs.length > 0 && (
        <CustomTabs
          value={activeTab}
          onChange={(e, value) => {
            const newIndex = visibleTabs.findIndex((tab) => tab.value === value);
            setIsBackClick(currentIndex > newIndex);
            setActiveTab(value);
          }}
          sx={{
            '& .MuiTabs-flexContainer': { gap: 1.5 },
            mb: 1,
            p: 0,
            borderRadius: 2,
          }}
          role="tablist"
        >
          {visibleTabs.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      )}

      {visibleTabs.length === 0 && (
        <StudentFeedback notificationKey="STU-0629" presentation="inline" severity="info">
          No notification workspace is available for your current access.
        </StudentFeedback>
      )}
      {currentIndex >= 0 && (
        <FormSlider
          steps={visibleTabs}
          isBackClick={isBackClick}
          step={currentIndex}
          containerProps={{
            sx: {
              p: 0,
              minHeight: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <Box sx={{ height: '100%', flex: 1 }}>
            {ActiveComponent && <ActiveComponent dialog={dialog} setIsViewMode={setIsViewMode} />}
          </Box>
        </FormSlider>
      )}
    </Box>
  );
};

export default StudentNotificationScreen;
