'use client';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import NewStudentNotificationForInquiry from './static-notification/inquiry-notification-management';
import AdmissionNotificationManagement from './static-notification/admission-notification-management';
import AttendanceNotificationManagement from './static-notification/attendance-notification-management';
import RegistrationNotificationManagement from './static-notification/registration-notification-management';
import StudentRecordNotificationManagement from './static-notification/student-record-notification-management';

const StudentNotificationTabScreen = () => {
  const TABS = [
    {
      value: 'inquiryManagement',
      label: 'Inquiry Management',
      icon: <Iconify icon="ix:inquiry" width={20} />,
      component: () => <NewStudentNotificationForInquiry />,
    },
    {
      value: 'registrationManagement',
      label: 'Registration Management',
      icon: <Iconify icon="medical-icon:i-registration" width={20} />,
      component: () => <RegistrationNotificationManagement />,
    },
    {
      value: 'admissionManagement',
      label: 'Admission Management',
      icon: <Iconify icon="fluent-mdl2:open-enrollment" width={20} />,
      component: () => <AdmissionNotificationManagement />,
    },
    {
      value: 'studentRecordManagement',
      label: 'StudentRecord Management',
      icon: <Iconify icon="hugeicons:task-daily-02" width={20} />,
      component: () => <StudentRecordNotificationManagement />,
    },

    {
      value: 'attendanceManagement',
      label: 'Attendance Management',
      icon: <Iconify icon="" width={20} />,
      component: () => <AttendanceNotificationManagement />,
    },
  ];

  const [searchParams, setSearchParams] = useSearchParam({ tab: 'inquiryManagement' });

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
          links={[{ name: 'Student' }, { name: 'Notification Settings' }]}
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

export default StudentNotificationTabScreen;
