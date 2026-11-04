'use client';

import React, { useState } from 'react';
import { Tab, Box, Paper } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { academicPaths } from 'src/constants/academic-menu';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HomeworkMarksAndFeedback from './homeworkMarksFeedback';
import AssignmentMarksAndFeedback from './assignmentMarksFeedback';

export interface MarksFeedbackTabProps {
  searchParams?: Record<string, string>;
  setSearchParams?: (key: string, value: string) => void;
  actionsContainer?: HTMLElement | null;
}

const TABS = [
  {
    icon: <Iconify icon="streamline-plump:file-check-alternate" width={20} />,
    value: 'homeworkMarks',
    label: 'Homework',
    component: (props: MarksFeedbackTabProps) => <HomeworkMarksAndFeedback {...props} />,
  },
  {
    icon: <Iconify icon="uil:file-check-alt" width={20} />,
    value: 'assignmentMarks',
    label: 'Assignment',
    component: (props: MarksFeedbackTabProps) => <AssignmentMarksAndFeedback {...props} />,
  },
];
const MarksFeedbackHomeworkAssignment = () => {
  const { getAllParams, setParam: setSearchParams } = useCustomSearchParams({
    tab: 'homeworkMarks',
  });
  const searchParams = getAllParams();

  const currentActiveComponent = TABS.find((tab) => tab.value === searchParams.tab) ?? TABS[0];
  const [actionsContainer, setActionsContainer] = useState<HTMLDivElement | null>(null);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'auto', md: 1 },
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <CustomBreadcrumbs
        heading="Evaluation & Feedback"
        description={
          currentActiveComponent?.value === 'homeworkMarks'
            ? 'Record and manage qualitative feedback for homework tasks.'
            : 'Record and manage marks and feedback for academic assignments.'
        }
        links={[
          { name: 'Academics', href: academicPaths.dashboard },
          { name: 'Homework & Assignment', href: academicPaths.homework.learningTasks },
          { name: 'Evaluation & Feedback' },
        ]}
      />
      <Paper
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        <CustomTabs
          value={currentActiveComponent.value}
          onChange={(_event, value: string) => setSearchParams('tab', value)}
          aria-label="Evaluation task type"
          variant="scrollable"
          scrollButtons="auto"
          slotProps={{ flexContainer: { gap: 1 } }}
          sx={{ minWidth: 0, maxWidth: 1 }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              id={`evaluation-tab-${tab.value}`}
              aria-controls={`evaluation-panel-${tab.value}`}
            />
          ))}
        </CustomTabs>
        <Box ref={setActionsContainer} sx={{ ml: 'auto', p: 1, '&:empty': { display: 'none' } }} />
      </Paper>
      <Box
        role="tabpanel"
        id={`evaluation-panel-${currentActiveComponent.value}`}
        aria-labelledby={`evaluation-tab-${currentActiveComponent.value}`}
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: { xs: 'visible', md: 'hidden' },
        }}
      >
        <Box
          sx={{ height: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          {currentActiveComponent.component && (
            <currentActiveComponent.component
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              actionsContainer={actionsContainer}
            />
          )}{' '}
        </Box>
      </Box>
    </Box>
  );
};
export default MarksFeedbackHomeworkAssignment;
