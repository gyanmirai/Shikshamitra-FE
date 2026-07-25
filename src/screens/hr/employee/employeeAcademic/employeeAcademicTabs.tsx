import React from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Tab, Box, Card } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { FormSlider } from 'src/components/form-slider';
import TeacherSchedule from 'src/screens/mainDashboard/teacher/schedule';

import CourseProgress from './subjectPerformance';

const TABS = [
  { value: 'timetable', label: 'Timetable' },
  { value: 'subjectPerformace', label: 'Subject Progress' },
];

interface EmployeeAcademicTabsProps {
  employee?: any;
}

const EmployeeAcademicTabs = ({ employee }: EmployeeAcademicTabsProps) => {
  const tabs = useTabs('timetable');
  const currentIndex = React.useMemo(
    () => TABS.findIndex((tab) => tab.value === tabs.value),
    [tabs.value]
  );
  const [isBackClick, setIsBackClick] = React.useState(false);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)' }}>
      <Scrollbar sx={{ flexGrow: 1, height: '100%' }}>
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
            <Box sx={{ p: 1, gap: 1, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
              {tabs.value === 'timetable' && (
                <TeacherSchedule employeeId={employee?.id || employee?._id} />
              )}
              {tabs.value === 'subjectPerformace' && <CourseProgress />}
            </Box>
          </FormSlider>
        </Card>
      </Scrollbar>
    </Box>
  );
};

export default EmployeeAcademicTabs;
