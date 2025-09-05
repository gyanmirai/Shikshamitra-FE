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

import GradeScaling from './settings/gradeScaleManagement/gradeScaling';
import { FormSlider } from '../student/enrollment/register/register-form';
import ExamTypeSettings from './settings/examAssessmentTypeSetting.tsx/examTypeSetting/examTypeSetting';

import type { TabComponentType } from '../hr/leave-request';

const TABS = [
  {
    value: 'gradeScaling',
    label: 'Grade Scaling',
    icon: <Iconify icon="carbon:document-subject" width={20} />,
    description: 'Configure grade scaling for assessments.',
    component: (props: any) => <GradeScaling {...props} />,
  },
  {
    value: 'examType',
    label: 'Exam Type',
    icon: <Iconify icon="carbon:document-subject" width={20} />,
    description: 'Configure exam types.',
    component: (props: any) => <ExamTypeSettings {...props} />,
  },
];

const Setting = (props: TabComponentType) => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'gradeScaling' });

  // Dialog state for each tab
  const addGradeScalingDialog = useBoolean(false);
  const addExamTypeDialog = useBoolean(false);

  // Render corresponding add button based on selected tab
  const renderButton = useMemo(
    () => ({
      gradeScaling: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          size="small"
          onClick={addGradeScalingDialog.onTrue}
        >
          Grade Scale
        </Button>
      ),
      examType: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          size="small"
          onClick={addExamTypeDialog.onTrue}
        >
          Exam Type
        </Button>
      ),
    }),
    [addGradeScalingDialog.onTrue, addExamTypeDialog.onTrue]
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
        description={currentActiveComponent?.description}
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Examination', href: '/academic/scheduleExam' },
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
              addGradeScalingDialog={addGradeScalingDialog}
              addExamTypeDialog={addExamTypeDialog}
            />
          )}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};

export default Setting;
