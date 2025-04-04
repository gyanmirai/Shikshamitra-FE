'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import GradeScaling from './settings/gradeScaling';
import ExamAssessmentType from './settings/examType';
import RubricManagement from './settings/rubricManagement';

const TABS = [
  {
    value: 'rubricManagement',
    label: 'Rubric Management',
    description: 'Manage rubrics for assessments and grading.',
    component: () => <RubricManagement />,
  },
  {
    value: 'gradeScaling',
    label: 'Grade Scaling',
    description: 'Configure grade scaling for assessments.',
    component: () => <GradeScaling />,
  },
  {
    value: 'examAssessmentType',
    label: 'Exam & Assessment Type',
    description: 'Configure exam and assessment types.',
    component: () => <ExamAssessmentType />,
  },
  //   {
  //     value: 'eventType',
  //     label: 'Event Type',
  //     component: (props: TabComponentType) => <EventType {...props} />,
  //   },
];

const Setting = (props: TabComponentType) => {
  const tabs = useTabs('rubricManagement');
  const currentTab = TABS.find((tab) => tab.value === tabs.value);
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Settings"
        description={currentTab?.description}
        links={[
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Examination', href: '/academic/examinationDashboard' },
          { name: 'Settings' },
          { name: currentTab?.label || '' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Card
        sx={{
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

export default Setting;
