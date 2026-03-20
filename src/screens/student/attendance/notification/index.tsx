'use client';

import { Box, Tab } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import React, { useMemo, useState, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';
import ExamNotificationManagement from 'src/screens/student/studentNotification/Components/ExamNotification';
import AttendanceNotificationManagement from 'src/screens/student/studentNotification/Components/AttendanceNotification';
import EnrollmentNotificationManagement from 'src/screens/student/studentNotification/Components/EnrollmentNotification';

// Stable component references defined OUTSIDE the component to prevent
// new function identities on every render (which cases remount + re-fetch loops)
const AttendanceNotificationTab = (props: any) => <AttendanceNotificationManagement {...props} />;
const EnrollmentNotificationTab = (props: any) => <EnrollmentNotificationManagement {...props} />;
const ExamNotificationTab = (props: any) => <ExamNotificationManagement {...props} />;

const TABS = [
  {
    value: 'attendance',
    label: 'Attendance',
    icon: <Iconify icon="mdi:calendar-check-outline" width={20} />,
    component: AttendanceNotificationTab,
  },
  {
    value: 'enrollment',
    label: 'Enrollment',
    icon: <Iconify icon="mdi:account-school-outline" width={20} />,
    component: EnrollmentNotificationTab,
  },
  {
    value: 'exam',
    label: 'Exam',
    icon: <Iconify icon="mdi:file-document-edit-outline" width={20} />,
    component: ExamNotificationTab,
  },
];

const StudentNotificationScreen = () => {
  // Read tab directly from the URL to prevent useSearchParam custom hook loop
  const nativeSearchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = nativeSearchParams.get('tab') || 'attendance';

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
    () => TABS.find((tab) => tab.value === activeTab),
    [activeTab]
  );
  const currentIndex = useMemo(() => TABS.findIndex((tab) => tab.value === activeTab), [activeTab]);

  const [isViewMode, setIsViewMode] = useState(false);
  const [isBackClick, setIsBackClick] = useState(false);

  // Must be capitalized so React treats it as a component (not a DOM element)
  const ActiveComponent = currentActiveComponent?.component as React.ComponentType<any> | undefined;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {dialog.value ? (
        <CustomBreadcrumbs
          heading={isViewMode ? 'View Notification' : 'Edit Notification'}
          description="Configure notifications for student attendance, enrollment, and exam management."
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
          description="Configure notifications for student attendance, enrollment, and exam management."
          links={[
            { name: 'Student', href: '/student/dashboard' },
            { name: 'Notification', href: '/student/attendance/notification' },
          ]}
          sx={{ px: 1 }}
        />
      )}

      {!dialog.value && (
        <CustomTabs
          value={activeTab}
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
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
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      )}

      <FormSlider
        steps={TABS}
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
    </Box>
  );
};

export default StudentNotificationScreen;
