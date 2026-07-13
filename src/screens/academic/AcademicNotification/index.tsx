'use client';

import { Box, Tab, Paper } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTabs } from 'src/components/custom-tabs';
import { FormSlider } from 'src/components/form-slider';
import { Iconify } from 'src/components/iconify/iconify';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TimetableNotificationManagement from './Components/TimetableNotificationManagement';
import CurriculumNotificationManagement from './Components/CurriculumNotificationManagement';
import ExaminationNotificationManagement from './Components/ExaminationNotificationManagement';
import HomeworkAssignmentNotificationManagement from './Components/HomeworkAssignmentNotificationManagement';

const TABS = [
  {
    value: 'curriculumManagement',
    label: 'Curriculum',
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
  // const [searchParams, setSearchParams] = useSearchParam({ tab: 'curriculumManagement' });

  const { getAllParams, setParam: setSearchParams } = useCustomSearchParams({
    tab: 'curriculumManagement',
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
  const [isViewMode, setIsViewMode] = useState(false);

  const [isBackClick, setIsBackClick] = useState(false);
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {dialog?.value ? (
        <CustomBreadcrumbs
          heading={isViewMode ? 'View Notification' : 'Edit Notification'}
          description="Configure notifications for curriculum, timetable, homework, and examinations."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            {
              name: 'Notification',
              href: '/academic/notification',
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
          description="Configure notifications for curriculum, timetable, homework, and examinations."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Notification', href: '/academic/notification' },
          ]}
          sx={{ px: 1 }}
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
            sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
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
        <Paper sx={{ height: '100%' }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component
              dialog={dialog}
              setIsViewMode={setIsViewMode}
              // searchParams={searchParams}
              // setSearchParams={setSearchParams}
            />
          )}{' '}
        </Paper>
      </FormSlider>
    </Box>
  );
};

export default AcademicNotificationScreen;
