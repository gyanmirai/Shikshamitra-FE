'use client';

import { Box, Tab, Card } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import NewStudentNotificationForInquiry from './static-notification/inquiryNotificationManagement';
import AdmissionNotificationManagement from './static-notification/admissionNotificationManagement';
import AttendanceNotificationManagement from './static-notification/attendanceNotificationManagement';
import RegistrationNotificationManagement from './static-notification/registrationNotificationManagement';
import StudentRecordNotificationManagement from './static-notification/studentRecordNotificationManagement';

const TABS = [
  {
    value: 'inquiryManagement',
    label: 'Inquiry Management',
    icon: <Iconify icon="ix:inquiry" width={20} />,
    component: (props: any) => <NewStudentNotificationForInquiry {...props} />,
  },
  {
    value: 'registrationManagement',
    label: 'Registration Management',
    icon: <Iconify icon="medical-icon:i-registration" width={20} />,
    component: (props: any) => <RegistrationNotificationManagement {...props} />,
  },
  {
    value: 'admissionManagement',
    label: 'Admission Management',
    icon: <Iconify icon="fluent-mdl2:open-enrollment" width={20} />,
    component: (props: any) => <AdmissionNotificationManagement {...props} />,
  },
  {
    value: 'studentRecordManagement',
    label: 'StudentRecord Management',
    icon: <Iconify icon="hugeicons:task-daily-02" width={20} />,
    component: (props: any) => <StudentRecordNotificationManagement {...props} />,
  },
  {
    value: 'attendanceManagement',
    label: 'Attendance Management',
    icon: <Iconify icon="mdi:calendar-check" width={20} />,
    component: (props: any) => <AttendanceNotificationManagement {...props} />,
  },
];

const StudentNotificationTabScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'inquiryManagement' });
  const dialog = useBoolean(false);

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams?.tab]
  );

  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const [isBackClick, setIsBackClick] = useState(false);

  return (
    <Box sx={{ height: '100%' }}>
      {/* Breadcrumbs */}
      {dialog?.value ? (
        <CustomBreadcrumbs
          heading="Notification Settings"
          description="In the Notification Settings, you can customize the message for each notification and enable or disable it as needed."
          links={[
            { name: 'Student', href: '/student/enrollment/dashboard/' },
            { name: 'Notification Settings' },
          ]}
          isBack
          onBack={() => {
            dialog.onFalse();
          }}
          sx={{ px: 1, mb: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Notification Settings"
          description="In the Notification Settings, you can customize the message for each notification and enable or disable it as needed."
          links={[
            { name: 'Student', href: '/student/enrollment/dashboard/' },
            { name: 'Notification Settings' },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
      )}

      {/* Tabs Card - Hide when dialog is open */}
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        {!dialog?.value && (
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
                sx={{ fontSize: '12px' }}
                icon={tab.icon}
                key={tab.value}
                value={tab.value}
                label={tab.label}
              />
            ))}
          </CustomTabs>
        )}
      </Card>

      {/* Tab Content with Slider Animation */}
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
            <currentActiveComponent.component dialog={dialog} />
          )}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};

export default StudentNotificationTabScreen;
