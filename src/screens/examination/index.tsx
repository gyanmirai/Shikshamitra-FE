'use client';

import React, { useMemo } from 'react';
import { Add } from '@mui/icons-material';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Tab, Box, Card, Button } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Setting from './setting';
import QuizManagement from './quiz';
import GradeEntry from './gradeEntry/gradeEntry';
import ScheduleExam from './scheduleExam/ScheduleExam';
import GradingAndAnalytics from './gradingAndAnalytics';
import ExaminationDashboardTab from './dashboard/examination-dashboard-tab';
// eslint-disable-next-line import/no-named-as-default
import AssessmentManagement from './assessmentManagement.tsx/assessment-management';

import type { TabComponentType } from '../hr/leave-request';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: (props: TabComponentType) => <ExaminationDashboardTab {...props} />,
  },
  {
    value: 'scheduleExam',
    label: 'Schedule Exam',
    component: (props?: any) => <ScheduleExam {...props} />,
  },
  {
    value: 'gradeEntry',
    label: 'Grade Entry',
    component: (props: TabComponentType) => <GradeEntry {...props} />,
  },
  {
    value: 'assessmentManagement',
    label: 'Assessment Management',
    component: (props: TabComponentType) => <AssessmentManagement {...props} />,
  },
  {
    value: 'quizManagement',
    label: 'Quiz Management',
    component: (props: TabComponentType) => <QuizManagement {...props} />,
  },
  {
    value: 'studentPerformanceAndAnalytics',
    label: 'Student Performace Analytics',
    component: (props: TabComponentType) => <GradingAndAnalytics {...props} />,
  },
  {
    value: 'settings',
    label: 'Settings',
    component: (props: TabComponentType) => <Setting {...props} />,
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
        <Button
          startIcon={<Iconify icon="mdi:calendar" />}
          sx={{
            backgroundColor: (theme) => varAlpha(theme.vars.palette.secondary.mainChannel, 0.1),
            color: 'secondary.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.vars.palette.secondary.mainChannel, 0.1),
            },
          }}
          variant="contained"
          onClick={() => {
            setSearchParams?.({ tab: 'scheduleExam' });
          }}
        >
          Schedule Exam
        </Button>
        <Button
          startIcon={<Iconify icon="mdi:upload" />}
          sx={{
            backgroundColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
            color: 'primary.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
            },
          }}
          variant="contained"
          onClick={() => {
            setSearchParams?.({ tab: 'gradeEntry' });
          }}
        >
          Upload Mark
        </Button>

        <Button
          startIcon={<Add />}
          sx={{
            backgroundColor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.1),
            color: 'error.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.1),
            },
          }}
          variant="contained"
          onClick={() => {
            setSearchParams?.({ tab: 'assessmentManagement' });
          }}
        >
          Create Assessment
        </Button>
      </Box>
      <Card
        sx={{ '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } } }}
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
