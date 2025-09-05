import React from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Tab, Box, Card } from '@mui/material';

import { Scrollbar } from '../scrollbar';
import { CustomTabs } from '../custom-tabs';
import AcademicTimetable from './academicTimetable';
import SubjectPerformance from './subjectPerformance';
// import HomeworkAssignment from './homeworkAssignment';
import ProfileExamination from './profileExamination';
import MyProfileSubmission from './studentProfileHomeworkAssignment';

const TABS = [
  { value: 'timetable', label: 'Timetable' },
  { value: 'subjectPerformace', label: 'Subject Performance' },
  { value: 'homework/assignments', label: 'Homework/Assignments' },
  { value: 'examination', label: 'Examination' },
];
const AcademicTabs = () => {
  const tabs = useTabs('timetable');
  return (
    <Card sx={{}}>
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
          {tabs.value === 'subjectPerformace' && <SubjectPerformance />}
          {tabs.value === 'homework/assignments' && <MyProfileSubmission />}
          {tabs.value === 'examination' && <ProfileExamination />}
        </Box>
      </Scrollbar>
    </Card>
  );
};

export default AcademicTabs;
