import React from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Tab, Box, Card } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import TeacherSchedule from 'src/screens/mainDashboard/teacher/schedule';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import CourseProgress from './subjectPerformance';

const TABS = [
  { value: 'timetable', label: 'Timetable' },
  { value: 'subjectPerformace', label: 'Subject Progress' },
];
const EmployeeAcademicTabs = () => {
  const tabs = useTabs('timetable');
  const currentIndex = React.useMemo(
    () => TABS.findIndex((tab) => tab.value === tabs.value),
    [tabs.value]
  );
  const [isBackClick, setIsBackClick] = React.useState(false);
  return (
    <Card>
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
          <Box sx={{ p: 1, gap: 1, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
            {tabs.value === 'timetable' && <TeacherSchedule />}
            {tabs.value === 'subjectPerformace' && <CourseProgress />}
          </Box>
        </Scrollbar>
      </FormSlider>
    </Card>
  );
};

export default EmployeeAcademicTabs;
