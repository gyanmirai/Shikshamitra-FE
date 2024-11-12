import type { Division, Standards } from 'src/types/school';
import type { CalendarEvent } from 'src/sections/calendar/view/calendarTimeTable';

import React, { useMemo, useState } from 'react';

import { Box, Card, Button, Switch, Typography, FormControlLabel } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { uuidv4 } from 'src/utils/uuidv4';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

// eslint-disable-next-line import/no-cycle
import { CalendarTimeTable } from 'src/sections/calendar/view/calendarTimeTable';
import { TabComponentType } from 'src/screens/hr/leave-request';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const classRoomData = [
  { id: '1', name: '101' },
  { id: '2', name: '102' },
  { id: '3', name: '103' },
];

const NewTimetable = (props: TabComponentType) => {
  const [classes, setClasses] = useState<string>('');
  const [showTimeTable, setShowTimeTable] = useState<boolean>(false);
  const [division, setDivision] = useState<any>();
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [classRoomNumber, setClassRoomNumber] = useState<string>('');
  const [timetableEvents, setTimetableEvents] = useState<CalendarEvent[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const handleCreateTimetable = () => {
    setShowTimeTable(true);
  };

  const predefinedBreaks = useMemo<CalendarEvent[]>(
    () => [
      {
        id: uuidv4(),
        startTime: '12:00',
        endTime: '12:30',
        title: 'Lunch Break',
        textColor: '#FFD700',
        daysOfWeek: [1, 2, 3, 4, 5, 6], // Days when the break occurs
      },
      {
        id: uuidv4(),
        startTime: '13:00:00',
        endTime: '13:15:00',
        title: 'Short Break',
        textColor: '#FF4500',
        daysOfWeek: [1, 2, 3, 4, 5, 6],
      },
    ],
    []
  );

  const handleEventsChange = (events: CalendarEvent[]) => {
    console.log('Updated events from CalendarTimeTable:', events);
    setTimetableEvents(events);
  };

  const dialog = useBoolean();
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          value={classes}
          isLoading={isLoading}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            setClasses(val as string);
            setDivisionOptions(selectedClass?.divisions);
          }}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <CustomSelect
          label="Division"
          disabled={!classes}
          labelKey="name"
          valueKey="id"
          options={divisionOptions}
          value={division}
          onChange={(val) => {
            setDivision(val as string);
          }}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <CustomSelect
          label="Classroom"
          options={classRoomData}
          value={classRoomNumber}
          isSearch
          labelKey="name"
          valueKey="name"
          disabled={!classes || !division}
          onChange={(val) => {
            setClassRoomNumber(val as string);
          }}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          <Button
            variant="contained"
            onClick={handleCreateTimetable}
            disabled={!classes || !division || !classRoomNumber} // Disable if class or division not selected
          >
            Create Timetable
          </Button>
        </Box>
      </Box>
      {showTimeTable && (
        <>
          <CalendarTimeTable
            grade={1}
            division="A"
            duration="00:15:00"
            classRoomNumber={classRoomNumber}
            schoolStartTime="09:00"
            schoolEndTime="15:45"
            onEventsChange={handleEventsChange}
            breakEvents={predefinedBreaks} // Pass break events to CalendarTimeTable
          />
          <Card sx={{ p: 2, mb: 5 }}>
            <Box display="flex" gap={6}>
              <Box>
                <CustomSelect
                  options={[]}
                  label="list of available rooms"
                  name="class"
                  value=""
                  onChange={() => {}}
                  formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
                />
                &nbsp;
                <FormControlLabel control={<Switch />} label="Auto Assign" />
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Switch defaultChecked />
                <Typography>Weekly</Typography>
                <Switch />
                <Typography>Monthly</Typography>
              </Box>
              <Box>
                <CustomSelect
                  options={[]}
                  label="Frequency Selection"
                  name="class"
                  value=""
                  onChange={() => {}}
                  formControlProps={{ sx: { maxWidth: 350, width: '100%' } }}
                />
                &nbsp;
                <FormControlLabel control={<Switch />} label="Weekly" />
              </Box>
            </Box>
          </Card>
          <Box display="flex" gap={2}>
            <Button variant="contained" onClick={() => {}} color="warning">
              Save Draft
            </Button>
            <Button variant="contained" onClick={() => {}}>
              Publish
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default NewTimetable;
