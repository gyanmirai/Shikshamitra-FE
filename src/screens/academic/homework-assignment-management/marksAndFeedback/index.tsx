'use client';

import { Tab, Box, Paper } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import HomeworkMarksAndFeedback from './homeworkMarksFeedback';
import AssignmentMarksAndFeedback from './assignmentMarksFeedback';

export interface MarksFeedbackTabProps {
  searchParams?: Record<string, string>;
  setSearchParams?: (key: string, value: string) => void;
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
  // Initialize search params with default tab 'subjectSetting'
  const { getAllParams, setParam: setSearchParams } = useCustomSearchParams({
    tab: 'homeworkMarks',
  });
  const searchParams = getAllParams();

  // Find and memoize the currently active tab component based on search params
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const [isBackClick, setIsBackClick] = useState(false);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Evaluation & Feedback"
        description={
          currentActiveComponent?.value === 'homeworkMarks'
            ? 'Record and manage marks and feedback for homework tasks.'
            : 'Add and manage marks/feedback for academic assignments'
        }
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework And Assignment', href: '/academic/homeworkCreation' },
          { name: 'Evaluation & Feedback' },
        ]}
      />
      <Paper
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
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
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: 2 }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
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
            <currentActiveComponent.component
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          )}{' '}
        </Box>
      </FormSlider>
    </Box>
  );
};
export default MarksFeedbackHomeworkAssignment;
