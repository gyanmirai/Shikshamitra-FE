'use client';

import React, { useMemo } from 'react';

import { Tab, Box, Card, Button } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Settings from './settings';
import GradeEntry from './gradeEntry';
import ScheduleExam from './schedule-exam';
import GradingAndAnalytics from './gradingAndAnalytics';
import AssessmentManagement from './assessment-management';
import ExaminationDashboardTab from './dashboard/examination-dashboard-tab';

import type { TabComponentType } from '../hr/leave-request';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: (props: TabComponentType) => <ExaminationDashboardTab {...props} />,
  },
  // {
  //   value: 'examOverview',
  //   label: 'Exam Overview',
  //   component: (props: TabComponentType) => <ExamOverview {...props} />,
  // },
  {
    value: 'scheduleExam',
    label: 'Schedule Exam',
    component: (props: TabComponentType) => <ScheduleExam {...props} />,
  },

  {
    value: 'assessmentManagement',
    label: 'Assessment Management',
    component: (props: TabComponentType) => <AssessmentManagement {...props} />,
  },
  {
    value: 'gradeEntry',
    label: 'Grade Entry',
    component: (props: TabComponentType) => <GradeEntry {...props} />,
  },

  {
    value: 'studentPerformanceAndAnalytics',
    label: 'Student Performace Analytics',
    component: (props: TabComponentType) => <GradingAndAnalytics {...props} />,
  },
  {
    value: 'settings',
    label: 'Settings',
    component: (props: TabComponentType) => <Settings {...props} />,
  },
];

const ExaminationPageScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dashboard' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Examination"
        links={[
          { name: 'Examination and Assessment' },
          { name: 'Examination' },
          { name: currentActiveComponent?.label },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box
        sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}
      >
        <Button startIcon={<Iconify icon="mdi:calendar" />} color="secondary" variant="contained">
          Schedule Exam
        </Button>
        <Button startIcon={<Iconify icon="mdi:upload" />} color="primary" variant="contained">
          Upload Mark
        </Button>

        <Button
          startIcon={<Iconify icon="mdi:file-document-outline" />}
          color="error"
          variant="contained"
        >
          Generate Report
        </Button>

        <Button
          startIcon={<Iconify icon="mingcute:notification-fill" />}
          color="warning"
          variant="contained"
        >
          send notification
        </Button>
      </Box>
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}{' '}
      </Box>
    </Box>
  );
};

export default ExaminationPageScreen;
