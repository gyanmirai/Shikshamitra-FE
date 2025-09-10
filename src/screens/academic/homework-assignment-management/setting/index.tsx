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

import HomeworkTypeCreation from './homeworkType';
import AssignmentTypeCreation from './assignmentType';

const TABS = [
  {
    icon: <Iconify icon="material-symbols-light:assignment-add" width={20} />,
    value: 'homeworkType',
    label: 'Homework Type',
    component: (props: any) => <HomeworkTypeCreation {...props} />,
  },
  {
    icon: <Iconify icon="lucide:file-type" width={20} />,
    value: 'assignmentType',
    label: 'Assignment Type',
    component: (props: any) => <AssignmentTypeCreation {...props} />,
  },
];

const HomeworkSetting = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'homeworkType' });

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
        heading="Setting"
        description={
          currentActiveComponent?.value === 'homeworkType'
            ? 'Design and organize various types of homework for students.'
            : 'Create and manage different types of assignments for student assessment'
        }
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework & Assignment', href: '/academic/homeworkCreation' },
          { name: 'Setting' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={renderButton[searchParams?.tab as keyof typeof renderButton]}
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
              addHomeworkTypeDialog={addHomeworkTypeDialog}
              addAssignmentTypeDialog={addAssignmentTypeDialog}
            />
          )}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};

export default HomeworkSetting;
