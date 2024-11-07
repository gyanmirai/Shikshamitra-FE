import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';

import { Box, Button } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

import { SchoolTimetableCalendar } from 'src/sections/calendar/view';

// eslint-disable-next-line react-hooks/rules-of-hooks

const CurrentTimetableOverview = () => {
  const [classes, setClasses] = useState<string>('');
  const [showTimeTable, setShowTimeTable] = useState<boolean>(false);
  const [division, setDivision] = useState<any>();
  const [viewType, setViewType] = useState<string>('1');
  const [subject, setSubject] = useState<string>('');
  const [teacher, setTeacher] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const handleCreateTimetable = () => {
    setShowTimeTable(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <CustomSelect
          label="view Type"
          options={[
            { id: '1', name: 'Student' },
            { id: '2', name: 'Teacher' },
            { id: '3', name: 'Subject' },
          ]}
          value={viewType}
          isLoading={isLoading}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            setViewType(val as string);
          }}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
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
        {viewType === '3' && (
          <CustomSelect
            label="Subject"
            options={[
              { id: '1', name: 'Math' },
              { id: '2', name: 'English' },
              { id: '3', name: 'Science' },
            ]}
            value={subject}
            isSearch
            isLoading={isLoading}
            labelKey="name"
            disabled={!classes || !division}
            valueKey="id"
            onChange={(val) => {
              setSubject(val as string);
            }}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
        )}
        {viewType === '2' && (
          <CustomSelect
            label="Teacher"
            options={[
              { id: '1', name: 'Mr. Smith' },
              { id: '2', name: 'Ms. Johnson' },
              { id: '3', name: 'Mr. Brown' },
            ]}
            value={teacher}
            isSearch
            labelKey="name"
            valueKey="id"
            disabled={!classes || !division}
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
          disabled={
            !classes ||
            !division ||
            (viewType === '2' && !teacher) ||
            (viewType === '3' && !subject)
          }
        >
          Show Timetable
        </Button>
      </Box>

      {showTimeTable && (
        <>
          <SchoolTimetableCalendar
            teacherId={viewType === '2' ? teacher : undefined}
            subjectId={viewType === '3' ? subject : undefined}
            grade={1}
            division="A"
          />
          <Box display="flex" justifyContent="flex-end" alignItems="center" mb="6px">
            <Button variant="contained">Publish</Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CurrentTimetableOverview;
