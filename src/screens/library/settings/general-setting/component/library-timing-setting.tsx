'use client';

import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { libraryTimingDataDummy } from '../data/general-setting-data';

const LibraryTimingSetting: React.FC = () => {
  // Global start time state for all library timings
  const [globalStartTime, setGlobalStartTime] = useState<string>('');
  // Global end time state for all library timings
  const [globalEndTime, setGlobalEndTime] = useState<string>('');
  // Schedule state containing array of library timing data with day, start time, end time and holiday status
  const [schedule, setSchedule] = useState(libraryTimingDataDummy);
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
      <CustomizableTable
        isFilter={false}
        isPagination={false}
        isLoading={false}
        isSearch={false}
        tableId="library-timing-setting"
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
