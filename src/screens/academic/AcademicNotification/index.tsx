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

import TimetableNotificationManagement from './Components/TimetableNotificationManagement';
import CurriculumNotificationManagement from './Components/CurriculumNotificationManagement';
import ExaminationNotificationManagement from './Components/ExaminationNotificationManagement';
import HomeworkAssignmentNotificationManagement from './Components/HomeworkAssignmentNotificationManagement';

const TABS = [
  {
    value: 'curriculumManagement',
    label: 'Curriculum Management',
    icon: <Iconify icon="ph:books-light" width={20} />,
    component: (props: any) => <CurriculumNotificationManagement {...props} />,
  },
  {
    value: 'timetable',
    label: 'Timetable',
    icon: <Iconify icon="solar:calendar-outline" width={20} />,
    component: (props: any) => <TimetableNotificationManagement {...props} />,
  },
  {
    value: 'homeworkAssignment',
    label: 'Homework & Assignment',
    icon: <Iconify icon="mdi:book-edit-outline" width={20} />,
    component: (props: any) => <HomeworkAssignmentNotificationManagement {...props} />,
  },
  {
    value: 'examination',
    label: 'Examination',
    icon: <Iconify icon="mdi:clipboard-text-outline" width={20} />,
    component: (props: any) => <ExaminationNotificationManagement {...props} />,
  },
];

const AcademicNotificationScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'curriculumManagement' });
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
      {dialog?.value ? (
        <CustomBreadcrumbs
          heading="Notification Settings"
          description="Configure notifications for curriculum, timetable, homework, and examinations."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Notifications', href: '/academic/notifications' },
            { name: 'Settings' },
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
          description="Configure notifications for curriculum, timetable, homework, and examinations."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Notifications', href: '/academic/notifications' },
            { name: 'Settings' },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
      )}
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
              <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
            ))}
          </CustomTabs>
        )}
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
              dialog={dialog}
              // searchParams={searchParams}
              // setSearchParams={setSearchParams}
            />
          )}{' '}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};

export default AcademicNotificationScreen;
