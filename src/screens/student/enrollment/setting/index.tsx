'use client';

import React from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ExamType from './exam-type';
import StudentDocumentType from './document-type';
import InquiryPreference from './inquiryPreference';
import EntranceExamSlots from './entrance-exam-slots';

const TABS = [
  // {
  //   value: 'notificationPreferences',
  //   label: 'Notification Preferences',
  //   component: () => <Notification />,
  // },
  {
    value: 'defaultDocumentTypes',
    label: 'Default Document Types',
    component: () => <StudentDocumentType />,
  },
  {
    value: 'inquiryPreference',
    label: 'Inquiry Preference',
    component: () => <InquiryPreference />,
  },
  {
    value: 'entranceExamSlots',
    label: 'Entrance Exam Slots',
    component: () => <EntranceExamSlots />,
  },
  {
    value: 'examType',
    label: 'Exam Type',
    component: () => <ExamType />,
  },
];

const StudentEnrollmentSettingScreen = () => {
  const tabs = useTabs('defaultDocumentTypes');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Setting' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Card
        sx={{
          // px: 1,
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>
    </Box>
  );
};

export default StudentEnrollmentSettingScreen;
