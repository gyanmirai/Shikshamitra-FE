import React from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';

import CourseProgress from './subjectPerformance';
import EmployeeTimetable from './employeeTimetable';
import DummyScheduledExamTable from './employeeExam';
import HomeworkAssignment from './homeworkAssignment';

const TABS = [
  { value: 'timetable', label: 'Timetable' },
  { value: 'subjectPerformace', label: 'Subject Progress' },
  // { value: 'homework/assignments', label: 'Homework/Assignments' },
  // { value: 'examination', label: 'Examination' },
];
const EmployeeAcademicTabs = () => {
  const tabs = useTabs('timetable');
  const currentIndex = React.useMemo(
    () => TABS.findIndex((tab) => tab.value === tabs.value),
    [tabs.value]
  );
  const [isBackClick, setIsBackClick] = React.useState(false);
  return (
    <Card sx={{ '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } } }}>
      <CustomTabs
        value={tabs.value}
        onChange={(...rest) => {
          const newIndex = TABS.findIndex((tab) => tab.value === rest[1]);
          if (currentIndex > newIndex) {
            setIsBackClick(true);
          } else {
            setIsBackClick(false);
          }
          tabs.onChange(...rest);
        }}
        variant="fullWidth"
        slotProps={{ tab: { px: 0 } }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </CustomTabs>

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
        <Scrollbar sx={{ minHeight: 384 }}>
          <Box sx={{ p: 3, gap: 1, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
            {tabs.value === 'timetable' && <EmployeeTimetable />}
            {tabs.value === 'subjectPerformace' && <CourseProgress />}
            {tabs.value === 'homework/assignments' && <HomeworkAssignment />}
            {tabs.value === 'examination' && <DummyScheduledExamTable />}
          </Box>
        </Scrollbar>
      </FormSlider>
    </Card>
  );
};

export default EmployeeAcademicTabs;
