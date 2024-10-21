import type { Division, Standards } from 'src/types/school';

import React, { useMemo, useState } from 'react';

import { Box, Button, Switch, Typography } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

import { SchoolTimetableCalendar } from 'src/sections/calendar/view';
import { CalendarEvent } from 'src/sections/calendar/view/calendarTimeTable';
import { uuidv4 } from 'src/utils/uuidv4';

// eslint-disable-next-line react-hooks/rules-of-hooks


const CurrentTimetableOverview = () => {
  const [classes, setClasses] = useState<string>('');
  const [showTimeTable, setShowTimeTable] = useState<boolean>(false);
  const [division, setDivision] = useState<any>();
  const [teacher, setTeacher] = useState<string>('');
  const [isTeacherView, setIsTeacherView] = useState<boolean>(false);
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [timetableEvents, setTimetableEvents] = useState<CalendarEvent[]>([]);

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const handleCreateTimetable = () => {
    setShowTimeTable(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ mr: 2 }}>Student Timetable</Typography>
          <Switch
            inputProps={{ 'aria-label': 'Toggle view' }}
            checked={isTeacherView}
            onChange={() => setIsTeacherView((prev) => !prev)}
          />
          <Typography sx={{ ml: 1 }}>Teacher Timetable</Typography>
        </Box>
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
            setDivisionOptions(selectedClass?.divisions || []);
            setDivision([]); // Reset division on class change
            setTeacher(''); // Reset teacher on class change
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
            setDivision(val as string[]);
          }}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        {isTeacherView && (
          <CustomSelect
            label="Teacher"
            options={[
              { id: '1', name: 'Mr. Smith' },
              { id: '2', name: 'Ms. Johnson' },
              { id: '3', name: 'Mr. Brown' },
            ]}
            value={teacher}
            labelKey="name"
            valueKey="id"
            disabled={!isTeacherView}
            onChange={(val) => {
              setTeacher(val as string);
            }}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
        )}
        <Button
          variant="contained"
          onClick={handleCreateTimetable}
          sx={{ alignSelf: 'flex-end' }}
          disabled={!classes || !division.length || (isTeacherView && !teacher)}
        >
          Show Timetable
        </Button>
      </Box>

      {showTimeTable && (
        <SchoolTimetableCalendar
          teacherId={isTeacherView ? teacher : undefined}
          grade={1}
          division="A"
        />
      )}
    </Box>
  );
};

export default CurrentTimetableOverview;
