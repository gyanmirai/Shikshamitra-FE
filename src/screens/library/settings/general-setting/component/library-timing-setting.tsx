'use client';

import React, { useState } from 'react';

import { Box, Button, TextField } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

const LibraryTimingSetting: React.FC = () => {
  const [globalStartTime, setGlobalStartTime] = useState<string>('');
  const [globalEndTime, setGlobalEndTime] = useState<string>('');
  const [schedule, setSchedule] = useState([
    { id: 1, day: 'Monday', startTime: '', endTime: '', isHoliday: false },
    { id: 2, day: 'Tuesday', startTime: '', endTime: '', isHoliday: false },
    { id: 3, day: 'Wednesday', startTime: '', endTime: '', isHoliday: false },
    { id: 4, day: 'Thursday', startTime: '', endTime: '', isHoliday: false },
    { id: 5, day: 'Friday', startTime: '', endTime: '', isHoliday: false },
  ]);

  // Update global start time for all rows
  const handleGlobalStartTimeChange = (value: string) => {
    setGlobalStartTime(value);
    const updatedSchedule = schedule.map((row) => ({
      ...row,
      startTime: row.isHoliday ? row.startTime : value,
    }));
    setSchedule(updatedSchedule);
  };

  // Update global end time for all rows
  const handleGlobalEndTimeChange = (value: string) => {
    setGlobalEndTime(value);
    const updatedSchedule = schedule.map((row) => ({
      ...row,
      endTime: row.isHoliday ? row.endTime : value,
    }));
    setSchedule(updatedSchedule);
  };

  // Update individual row start or end time
  const handleRowTimeChange = (id: number, field: 'startTime' | 'endTime', value: string) => {
    const updatedSchedule = schedule.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          [field]: value,
        };
      }
      return row;
    });
    setSchedule(updatedSchedule);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined">Save</Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'day', label: 'Day' },
          {
            id: 'startTime',
            label: 'Start Time',
            renderColumn() {
              return (
                <Box sx={{ width: '120px' }}>
                  <TextField
                    type="time"
                    value={globalStartTime}
                    onChange={(e) => handleGlobalStartTimeChange(e.target.value)}
                    size="small"
                    sx={{ width: '100%' }}
                  />
                </Box>
              );
            },
            render(value, row) {
              return (
                <TextField
                  type="time"
                  value={row.startTime}
                  onChange={(e) => handleRowTimeChange(row.id, 'startTime', e.target.value)}
                  size="small"
                  disabled={row.isHoliday}
                  sx={{ width: '120px' }}
                />
              );
            },
          },
          {
            id: 'endTime',
            label: 'End Time',
            renderColumn() {
              return (
                <Box sx={{ width: '120px' }}>
                  <TextField
                    type="time"
                    value={globalEndTime}
                    onChange={(e) => handleGlobalEndTimeChange(e.target.value)}
                    size="small"
                    sx={{ width: '100%' }}
                  />
                </Box>
              );
            },
            render(value, row) {
              return (
                <TextField
                  type="time"
                  value={row.endTime}
                  onChange={(e) => handleRowTimeChange(row.id, 'endTime', e.target.value)}
                  size="small"
                  disabled={row.isHoliday}
                  sx={{ width: '120px' }}
                />
              );
            },
          },
        ]}
        data={schedule}
      />
    </Box>
  );
};

export default LibraryTimingSetting;
