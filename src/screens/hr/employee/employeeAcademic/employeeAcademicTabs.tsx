import React from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import AcademicTimetable from 'src/components/studentProfile/academicTimetable';

import CourseProgress from './subjectPerformance';
import DummyScheduledExamTable from './employeeExam';
import HomeworkAssignment from './homeworkAssignment';

const TABS = [
  { value: 'timetable', label: 'Timetable' },
  { value: 'subjectPerformace', label: 'Subject Progress' },
  { value: 'homework/assignments', label: 'Homework/Assignments' },
  { value: 'examination', label: 'Examination' },
];
const EmployeeAcademicTabs = () => {
  const tabs = useTabs('timetable');
  return (
    <Card sx={{ '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } } }}>
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

      <Scrollbar sx={{ minHeight: 384 }}>
        <Box sx={{ p: 3, gap: 1, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
          {tabs.value === 'timetable' && <AcademicTimetable />}
          {tabs.value === 'subjectPerformace' && <CourseProgress />}
          {tabs.value === 'homework/assignments' && <HomeworkAssignment />}
          {tabs.value === 'examination' && <DummyScheduledExamTable />}
        </Box>
      </Scrollbar>
    </Card>
  );
};

export default EmployeeAcademicTabs;
