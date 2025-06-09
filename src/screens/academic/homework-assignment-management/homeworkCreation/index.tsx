'use client';

import React, { useMemo } from 'react';

import { Add } from '@mui/icons-material';
import { Tab, Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HomeworkCreation from './component';
import AssignmentCreation from '../assignmentCreation';

const TABS = [
  {
    value: 'homeworkCreation',
    label: 'Homework Creation',
    component: (props: any) => <HomeworkCreation {...props} />,
  },
  {
    value: 'assignmentCreation',
    label: 'Assignment Creation',
    component: (props: any) => <AssignmentCreation {...props} />,
  },
];

const HomeworkAssignment = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'homeworkCreation' });

  // Dialog state for each tab
  const addHomeworkDialog = useBoolean(false);
  const addAssignmentDialog = useBoolean(false);

  // Render corresponding add button based on selected tab
  const renderButton = useMemo(
    () => ({
      homeworkCreation: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          size="small"
          onClick={addHomeworkDialog.onTrue}
        >
          Homework
        </Button>
      ),
      assignmentCreation: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          size="small"
          onClick={addAssignmentDialog.onTrue}
        >
          Assignment
        </Button>
      ),
    }),
    [addHomeworkDialog.onTrue, addAssignmentDialog.onTrue]
  );

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      {showBreadCumb && (
        <CustomBreadcrumbs
          heading="Set Coursework"
          description={
            currentActiveComponent?.value === 'homeworkCreation'
              ? 'Create and manage homework assignments for students'
              : 'Create and manage academic assignments and evaluations'
          }
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Homework & Assignment' },
            { name: 'Set Coursework' },
          ]}
          sx={{ px: 1, mb: 2 }}
          action={renderButton[searchParams?.tab as keyof typeof renderButton]}
        />
      )}
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
            addHomeworkDialog={addHomeworkDialog}
            addAssignmentDialog={addAssignmentDialog}
          />
        )}
      </Box>
    </Box>
  );
};

export default HomeworkAssignment;
