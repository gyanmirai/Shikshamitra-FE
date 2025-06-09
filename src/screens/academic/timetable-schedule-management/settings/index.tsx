'use client';

import React, { useMemo } from 'react';

import { Add } from '@mui/icons-material';
import { Tab, Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
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
    component: (props: any) => <WeeklyLectures {...props} />,
  },
  {
    value: 'lectureSlots',
    label: 'Lecture Slots',
    component: (props: any) => <LectureSlots {...props} />,
  },
  {
    value: 'roomDetails',
    label: 'Room Details',
    component: (props: any) => <RoomDetails {...props} />,
  },
];

const TimetableSettingScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'weeklyLectures' });

  const addWeeklyLectureDialog = useBoolean(false);
  const addLectureSlotDialog = useBoolean(false);
  const addRoomDialog = useBoolean(false);

  const renderButton = useMemo(
    () => ({
      weeklyLectures: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          onClick={addWeeklyLectureDialog.onTrue}
          size="small"
        >
          Weekly Lecture
        </Button>
      ),
      lectureSlots: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          onClick={addLectureSlotDialog.onTrue}
          variant="contained"
          size="small"
        >
          Lecture Slot
        </Button>
      ),
      roomDetails: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          onClick={addRoomDialog.onTrue}
          variant="contained"
          size="small"
        >
          Room
        </Button>
      ),
    }),
    [addWeeklyLectureDialog.onTrue, addLectureSlotDialog.onTrue, addRoomDialog.onTrue]
  );

  const currentActiveTab = useMemo(
    () => TABS.find((tab) => tab.value === searchParams.tab),
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
        action={renderButton[searchParams.tab as keyof typeof renderButton]}
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
        {currentActiveTab?.component && (
          <currentActiveTab.component
            addWeeklyLectureDialog={addWeeklyLectureDialog}
            addLectureSlotDialog={addLectureSlotDialog}
            addRoomDialog={addRoomDialog}
          />
        )}
      </Box>
    </Box>
  );
};

export default TimetableSettingScreen;
