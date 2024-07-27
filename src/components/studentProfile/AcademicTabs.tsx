import React from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Scrollbar } from '../scrollbar';
import { CustomTabs } from '../custom-tabs';
import AcademicActivity from './academicActivity';
import AcademicDashboard from './academicDashboard';

const TABS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'activity', label: 'Activity' },
  { value: 'performance', label: 'Performance' },
  { value: 'studentPlanner', label: 'Student Planner' },
];
const AcademicTabs = () => {
  const tabs = useTabs('dashboard');
  return (
    <Card sx={{ '& *': { fontSize: '12px !important', '& svg': { fontSize: '18px !important' } } }}>
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
          {tabs.value === 'dashboard' && <AcademicDashboard />}
          {tabs.value === 'activity' && <AcademicActivity />}
        </Box>
      </Scrollbar>
    </Card>
  );
};

export default AcademicTabs;
