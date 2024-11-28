import React, { useState } from 'react';

import { Box, TextField } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

const LibraryTimingSetting: React.FC = () => {
  const [schedule, setSchedule] = useState([
    { day: 'Monday', startTime: '', endTime: '', isHoliday: false },
    { day: 'Tuesday', startTime: '', endTime: '', isHoliday: false },
    { day: 'Wednesday', startTime: '', endTime: '', isHoliday: false },
    { day: 'Thursday', startTime: '', endTime: '', isHoliday: false },
    { day: 'Friday', startTime: '', endTime: '', isHoliday: false },
    { day: 'Saturday', startTime: '', endTime: '', isHoliday: false },
    { day: 'Sunday', startTime: '', endTime: '', isHoliday: false },
  ]);

  const handleUpdate = (field: string, value: any) => {
    // const updatedSchedule = [...schedule];
    // updatedSchedule[index][field] = value;

    // // If holiday is toggled, reset start and end time
    // if (field === 'isHoliday' && value) {
    //   updatedSchedule[index].startTime = '';
    //   updatedSchedule[index].endTime = '';
    // }

    // setSchedule(updatedSchedule);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <CustomizableTable
        isFilter={false}
        isShowedDense={false}
        isSearch={false}
        columns={[
          { id: 'day', label: 'Day' },
          {
            id: 'startTime',
            label: 'Start Time',
            render: (value: string, row: any) => (
              <TextField
                type="time"
                value={row.startTime}
                onChange={(e) => handleUpdate('startTime', e.target.value)}
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
            render: (value: string, row: any) => (
              <TextField
                type="time"
                value={row.endTime}
                onChange={(e) => handleUpdate('endTime', e.target.value)}
                disabled={row.isHoliday}
                variant="outlined"
                size="small"
                sx={{ width: '120px', margin: '0 auto' }}
              />
            ),
          },
          // {
          //   id: 'isHoliday',
          //   label: 'Holiday',
          //   render: (value: boolean, row: any,) => (
          //     <Switch
          //       checked={row.isHoliday}
          //       onChange={(e) => handleUpdate('isHoliday', e.target.checked)}
          //     />
          //   ),
          // },
        ]}
        data={schedule}
      />
    </Box>
  );
};

export default LibraryTimingSetting;
