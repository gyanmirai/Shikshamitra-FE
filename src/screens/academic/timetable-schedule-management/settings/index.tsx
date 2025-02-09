'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RoomDetails from './components/roomDetails';
import LectureSlots from './components/lectureSlots';
import WeeklyLectures from './components/weeklyLectures';

const TABS = [
  {
    value: 'weeklyLectures',
    label: 'Weekly Lectures',
    component: () => <WeeklyLectures />,
    // component: (props: TabComponentType) => <GradingScale {...props} />,
  },
  {
    value: 'lectureSlots',
    label: 'Lecture Slots',
    component: () => <LectureSlots />,
  },
  {
    value: 'roomDetails',
    label: 'Room Details',
    component: () => <RoomDetails />,
    // component: (props: TabComponentType) => <GradeSubmission {...props} />,
  },
];

const TimetableSettingScreen = (props: TabComponentType) => {
  const tabs = useTabs('weeklyLectures');
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Settings"
        links={[{ name: 'Academic and Assignment' }, { name: 'Timetable ' }, { name: 'Settings' }]}
        sx={{ px: 1, mb: 2 }}
      />
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
    </Box>
  );
};

export default TimetableSettingScreen;
