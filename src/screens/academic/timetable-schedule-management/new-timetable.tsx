import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';

import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

import { CalendarTimeTable } from 'src/sections/calendar/view/calendarTimeTable';

const NewTimetable = () => {
  const [classes, setClasses] = useState<string>('');
  const [showTimeTable, setShowTimeTable] = useState<boolean>(false);
  const [division, setDivision] = useState<any>();
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const handleCreateTimetable = () => {
    setShowTimeTable(true);
  };

  const dialog = useBoolean();
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
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
        <Box justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleCreateTimetable}
            disabled={!classes || !division} // Disable if class or division not selected
          >
            Create Timetable
          </Button>
        </Box>
      </Box>
      {showTimeTable && <CalendarTimeTable />}
    </Box>
  );
};

export default NewTimetable;
