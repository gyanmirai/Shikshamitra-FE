'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RoomDetails from './components/roomSetting/roomDetails';
import LectureSlots from './components/lectureSlots/lectureSlots';
import WeeklyLectures from './components/weeklyLectures/weeklyLectures';

const TABS = [
  {
    value: 'weeklyLectures',
    label: 'Weekly Lectures',
    component: (props?: TabComponentType) => <WeeklyLectures />,
    // component: (props: TabComponentType) => <GradingScale {...props} />,
  },
  {
    value: 'lectureSlots',
    label: 'Lecture Slots',
    component: (props?: TabComponentType) => <LectureSlots />,
  },
  {
    value: 'roomDetails',
    label: 'Room Details',
    component: (props?: TabComponentType) => <RoomDetails />,
    // component: (props: TabComponentType) => <GradeSubmission {...props} />,
  },
];

const TimetableSettingScreen = (props: TabComponentType) => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'weeklyLectures' });
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Timetable', href: '/academic/newTimetable' },
          { name: 'Setting' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}{' '}
      </Box>
    </Box>
  );
};

export default TimetableSettingScreen;
