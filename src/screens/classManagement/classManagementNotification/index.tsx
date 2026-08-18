'use client';

import { Box, Tab, Paper } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTabs } from 'src/components/custom-tabs';
import { FormSlider } from 'src/components/form-slider';
import { Iconify } from 'src/components/iconify/iconify';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ChaptersProgressNotificationManagement from './Components/ChaptersProgressNotificationManagement';
import TeachersAssignmentNotificationManagement from './Components/TeachersAssignmentNotificationManagement';
import ClassTeacherAssignmentNotificationManagement from './Components/ClassTeacherAssignmentNotificationManagement';
import StudentElectiveAssignmentNotificationManagement from './Components/StudentElectiveAssignmentNotificationManagement';

const TABS = [
  {
    value: 'studentElectiveAssignment',
    label: 'Student Elective Assignment',
    icon: <Iconify icon="mdi:account-multiple-outline" width={20} />,
    component: (props: any) => <StudentElectiveAssignmentNotificationManagement {...props} />,
  },
  {
    value: 'chaptersProgress',
    label: 'Chapters Progress',
    icon: <Iconify icon="mdi:book-open-outline" width={20} />,
    component: (props: any) => <ChaptersProgressNotificationManagement {...props} />,
  },
  {
    value: 'teachersAssignment',
    label: 'Teachers Assignment',
    icon: <Iconify icon="mdi:teacher" width={20} />,
    component: (props: any) => <TeachersAssignmentNotificationManagement {...props} />,
  },
  {
    value: 'classTeacherAssignment',
    label: 'Class Teacher Assignment',
    icon: <Iconify icon="mdi:account-tie-outline" width={20} />,
    component: (props: any) => <ClassTeacherAssignmentNotificationManagement {...props} />,
  },
];

const ClassManagementNotificationScreen = () => {
  const { getAllParams, setParam: setSearchParams } = useCustomSearchParams({
    tab: 'studentElectiveAssignment',
  });
  const searchParams = getAllParams();
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
  const [isViewMode, setIsViewMode] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {dialog?.value ? (
        <CustomBreadcrumbs
          heading={isViewMode ? 'View Notification' : 'Edit Notification'}
          description="Configure notifications for class management modules such as student elective assignment, chapter progress, teacher assignment, and class teacher assignment."
          links={[
            { name: 'Class Management', href: '/classManagement/dashboard' },
            {
              name: 'Notification',
              href: '/classManagement/notification-management',
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
          sx={{ px: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Notification"
          description="Configure notifications for class management modules such as student elective assignment, chapter progress, teacher assignment, and class teacher assignment."
          links={[
            { name: 'Class Management', href: '/classManagement/dashboard' },
            { name: 'Notification', href: '/classManagement/notification-management' },
          ]}
          sx={{ px: 2 }}
        />
      )}

      <Paper
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
              setSearchParams('tab', value);
            }}
            sx={{ '& .MuiTabs-flexContainer': { gap: 1 }, borderRadius: 2 }}
            role="tablist"
          >
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
            ))}
          </CustomTabs>
        )}
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
            <currentActiveComponent.component dialog={dialog} setIsViewMode={setIsViewMode} />
          )}
        </Box>
      </FormSlider>
    </Box>
  );
};

export default ClassManagementNotificationScreen;
