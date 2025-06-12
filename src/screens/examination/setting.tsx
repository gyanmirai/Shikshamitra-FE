'use client';

import React, { useMemo } from 'react';

import { Add } from '@mui/icons-material';
import { Tab, Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import GradeScaling from './settings/gradeScaleManagement/gradeScaling';
import ExamTypeSettings from './settings/examAssessmentTypeSetting.tsx/examTypeSetting/examTypeSetting';

import type { TabComponentType } from '../hr/leave-request';

const TABS = [
  {
    value: 'gradeScaling',
    label: 'Grade Scaling',
    description: 'Configure grade scaling for assessments.',
    component: (props: any) => <GradeScaling {...props} />,
  },
  {
    value: 'examType',
    label: 'Exam Type',
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

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        description={currentActiveComponent?.description}
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Examination', href: '/academic/examinationDashboard' },
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
            addGradeScalingDialog={addGradeScalingDialog}
            addExamTypeDialog={addExamTypeDialog}
          />
        )}
      </Box>
    </Box>
  );
};

export default Setting;
