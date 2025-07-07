'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo, useState } from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HomeworkMarksAndFeedback from './homeworkMarksFeedback';
import AssignmentMarksAndFeedback from './assignmentMarksFeedback';

const TABS = [
  {
    icon: <Iconify icon="streamline-plump:file-check-alternate" width={20} />,
    value: 'homeworkMarks',
    label: 'Homework',
    component: (props: TabComponentType) => <HomeworkMarksAndFeedback {...props} />,
  },
  {
    icon: <Iconify icon="uil:file-check-alt" width={20} />,
    value: 'assignmentMarks',
    label: 'Assignment',
    component: (props: TabComponentType) => <AssignmentMarksAndFeedback {...props} />,
  },
];
const MarksFeedbackHomeworkAssignment = () => {
  // Initialize search params with default tab 'subjectSetting'
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'homeworkMarks' });

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
    <Box>
      <CustomBreadcrumbs
        heading="Assessment & Feedback"
        description={
          currentActiveComponent?.value === 'homeworkMarks'
            ? 'Record and manage marks and feedback for homework tasks.'
            : 'Add and manage marks/feedback for academic assignments'
        }
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework And Assignment', href: '/academic/homeworkCreation' },
          { name: 'Assessment & Feedback' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Card
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

            setSearchParams({ tab: value });
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
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
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          )}{' '}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};
export default MarksFeedbackHomeworkAssignment;
