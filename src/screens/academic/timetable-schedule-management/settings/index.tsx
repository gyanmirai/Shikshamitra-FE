'use client';

import React, { useMemo, useState } from 'react';

import { Add } from '@mui/icons-material';
import { Tab, Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RoomDetails from './components/roomSetting/roomDetails';
import LectureSlots from './components/lectureSlots/lectureSlots';
import WeeklyLectures from './components/weeklyLectures/weeklyLectures';

const TABS = [
  {
    icon: <Iconify icon="mdi:lecture" width={20} />,
    value: 'weeklyLectures',
    label: 'Weekly Lectures',
    component: (props: any) => <WeeklyLectures {...props} />,
  },
  {
    icon: <Iconify icon="lucide-lab:slot-card" width={20} />,
    value: 'lectureSlots',
    label: 'Lecture Slots',
    component: (props: any) => <LectureSlots {...props} />,
  },
  {
    icon: <Iconify icon="cbi:roomsother" width={20} />,
    value: 'roomDetails',
    label: 'Room Details',
    component: (props: any) => <RoomDetails {...props} />,
  },
];

const TimetableSettingScreen = () => {
  // URL search parameter state for managing active tab, defaults to 'weeklyLectures'
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'weeklyLectures' });
  const [isEdit, setIsEdit] = useState(false);

  // Dialog visibility states for adding different types of entries
  const addWeeklyLectureDialog = useBoolean(false);
  const addLectureSlotDialog = useBoolean(false);
  const addRoomDialog = useBoolean(false);

  // Memoized index of current active tab from TABS array
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  // State to track if user clicked back to previous tab
  const [isBackClick, setIsBackClick] = useState(false);

  const renderButton = useMemo(
    () => ({
      weeklyLectures: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          onClick={() => {
            addWeeklyLectureDialog.onTrue();
            setIsEdit(false);
          }}
          size="small"
        >
          Weekly Lecture
        </Button>
      ),
      lectureSlots: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          onClick={() => {
            addLectureSlotDialog.onTrue();
            setIsEdit(false);
          }}
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
    [addRoomDialog.onTrue, addWeeklyLectureDialog, addLectureSlotDialog]
  );

  const currentActiveTab = useMemo(
    () => TABS.find((tab) => tab.value === searchParams.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        description="Configure timetable settings by defining weekly lectures, lecture slots, and room allocations."
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
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
            if (currentIndex > newIndex) {
              setIsBackClick(true);
            } else {
              setIsBackClick(false);
            }

            setSearchParams({ tab: value });
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Card>
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
        <Scrollbar sx={{ p: 1 }}>
          {currentActiveTab?.component && (
            <currentActiveTab.component
              addWeeklyLectureDialog={addWeeklyLectureDialog}
              addLectureSlotDialog={addLectureSlotDialog}
              addRoomDialog={addRoomDialog}
              isEdit={isEdit}
              setIsEdit={setIsEdit}
            />
          )}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};

export default TimetableSettingScreen;
