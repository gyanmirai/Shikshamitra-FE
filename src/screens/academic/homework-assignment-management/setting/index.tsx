'use client';

import React, { useMemo, useState } from 'react';

import { Add } from '@mui/icons-material';
import { Tab, Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HomeworkTypeCreation from './homeworkType';
import AssignmentTypeCreation from './assignmentType';

const TABS = [
  {
    value: 'homeworkType',
    label: 'Homework Type',
    component: (props: any) => <HomeworkTypeCreation {...props} />,
  },
  {
    value: 'assignmentType',
    label: 'Assignment Type',
    component: (props: any) => <AssignmentTypeCreation {...props} />,
  },
];

const HomeworkSetting = () => {
  const [activeTab, setActiveTab] = useState('homeworkType');

  const addHomeworkTypeDialog = useBoolean(false);
  const addAssignmentTypeDialog = useBoolean(false);

  const renderButton = useMemo(
    () => ({
      homeworkType: (
        <Button
          sx={{ width: '180px' }}
          startIcon={<Add />}
          onClick={addHomeworkTypeDialog.onTrue}
          variant="contained"
          size="small"
        >
          Homework Type
        </Button>
      ),
      assignmentType: (
        <Button
          sx={{ width: '180px' }}
          startIcon={<Add />}
          onClick={addAssignmentTypeDialog.onTrue}
          variant="contained"
          size="small"
        >
          Assignment Type
        </Button>
      ),
    }),
    [addHomeworkTypeDialog.onTrue, addAssignmentTypeDialog.onTrue]
  );

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === activeTab),
    [activeTab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        description={
          currentActiveComponent?.value === 'homeworkType'
            ? 'Create and manage homework types for assignments'
            : 'Create and manage assignment types for evaluations'
        }
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework & Assignment', href: '/academic/homeworkCreation' },
          { name: 'Setting' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={renderButton[activeTab as keyof typeof renderButton]}
      />

      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={activeTab}
          onChange={(e, value) => setActiveTab(value)}
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
            addHomeworkTypeDialog={addHomeworkTypeDialog}
            addAssignmentTypeDialog={addAssignmentTypeDialog}
          />
        )}
      </Box>
    </Box>
  );
};

export default HomeworkSetting;
