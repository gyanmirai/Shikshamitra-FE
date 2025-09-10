'use client';

import { Add } from '@mui/icons-material';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { Tab, Box, Card, Button } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import HomeworkCreation from './component';
import AssignmentCreation from '../assignmentCreation';

const TABS = [
  {
    icon: <Iconify icon="streamline-cyber:book-pencil" width={20} />,
    value: 'homeworkCreation',
    label: 'Homework',
    component: (props: any) => <HomeworkCreation {...props} />,
  },
  {
    icon: <Iconify icon="material-symbols:assignment-add-outline" width={20} />,
    value: 'assignmentCreation',
    label: 'Assignment',
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

  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const [isBackClick, setIsBackClick] = useState(false);

  return (
    <Box>
      {showBreadCumb && (
        <CustomBreadcrumbs
          heading="Learning Tasks"
          description={
            currentActiveComponent?.value === 'homeworkCreation'
              ? 'Assign and track daily homework to reinforce learning and evaluate students progress.'
              : 'Design comprehensive assignments to assess student understanding and measure their academic performance'
          }
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Homework & Assignment' },
            { name: 'Learning Tasks' },
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
              addHomeworkDialog={addHomeworkDialog}
              addAssignmentDialog={addAssignmentDialog}
            />
          )}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};

export default HomeworkAssignment;
