import React, { useState } from 'react';

import { Box, TextField } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

const LibraryTimingSetting: React.FC = () => {
  const [globalStartTime, setGlobalStartTime] = useState('');
  const [globalEndTime, setGlobalEndTime] = useState('');
  const [schedule, setSchedule] = useState([
    { day: 'Monday', startTime: '', endTime: '', isHoliday: false },
    { day: 'Tuesday', startTime: '', endTime: '', isHoliday: false },
    { day: 'Wednesday', startTime: '', endTime: '', isHoliday: false },
    { day: 'Thursday', startTime: '', endTime: '', isHoliday: false },
    { day: 'Friday', startTime: '', endTime: '', isHoliday: false },
    { day: 'Saturday', startTime: '', endTime: '', isHoliday: false },
    { day: 'Sunday', startTime: '', endTime: '', isHoliday: false },
  ]);

  const handleGlobalUpdate = (field: string, value: string) => {
    const updatedSchedule = schedule.map((row) => ({
      ...row,
      // [field]: row.isHoliday ? row[field] : value, // Update only if not a holiday
    }));
    setSchedule(updatedSchedule);
    if (field === 'startTime') setGlobalStartTime(value);
    if (field === 'endTime') setGlobalEndTime(value);
  };

  const handleRowUpdate = (field: string, value: string) => {
    const updatedSchedule = [...schedule];
    // updatedSchedule[index][field] = value;
    setSchedule(updatedSchedule);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <TextField
          type="time"
          label="Start Time (Global)"
          value={globalStartTime}
          onChange={(e) => handleGlobalUpdate('startTime', e.target.value)}
          size="small"
          sx={{ width: '200px' }}
        />
        <TextField
          type="time"
          label="End Time (Global)"
          value={globalEndTime}
          onChange={(e) => handleGlobalUpdate('endTime', e.target.value)}
          size="small"
          sx={{ width: '200px' }}
        />
      </Box>
      <CustomizableTable
        isFilter={false}
        isShowedDense={false}
        isSearch={false}
        columns={[
          { id: 'day', label: 'Day' },
          {
            id: 'startTime',
            label: 'Start Time',
            render: (value: string, row: any,) => (
              <TextField
                type="time"
                value={row.startTime}
                onChange={(e) => handleRowUpdate('startTime', e.target.value)}
                disabled={row.isHoliday}
                variant="outlined"
                size="small"
                sx={{ width: '120px', margin: '0 auto' }}
              />
            ),
          },
          {
            id: 'endTime',
            label: 'End Time',
            render: (value: string, row: any,) => (
              <TextField
                type="time"
                value={row.endTime}
                onChange={(e) => handleRowUpdate('endTime', e.target.value)}
                disabled={row.isHoliday}
                variant="outlined"
                size="small"
                sx={{ width: '120px', margin: '0 auto' }}
              />
            ),
          },
        ]}
        data={schedule}
      />
    </Box>
  );
};

export default LibraryTimingSetting;
