'use client';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';

import Quizzes from './quizes';
import Assignments from './assignments';
import Assessments from './assessments';
import LearningMaterial from './learningMaterial';

const TABS = [
  {
    value: 'assignment',
    label: 'Assignment',
    component: () => <Assignments />,
  },
  {
    value: 'learningMaterial',
    label: 'Learning Material',
    component: () => <LearningMaterial />,
  },
  {
    value: 'quizzes',
    label: 'Quizzes ',
    component: () => <Quizzes />,
  },
  {
    value: 'Assessments',
    label: 'Assessments',
    component: () => <Assessments />,
  },
  // {
  //   value: 'overallGrades',
  //   label: 'Overall Grades',
  //   component: () => <OverallGrades />,
  // },
];

const RenderTabs = () => {
  const tabs = useTabs('assignment');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <>
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>
    </>
  );
};

export default RenderTabs;
