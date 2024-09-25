import React from 'react';

import { Box } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const CurrentTimetableOverview = () => (
  <Box>
    <Box display="flex" justifyContent="flex-end">
      <CustomSelect
        label="class"
        options={[]}
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: '300px', width: '100%' } }}
      />
    </Box>
    <CustomizableTable
      columns={[
        {
          label: 'days of the week',
          id: 'daysOfTheWeek',
        },
        {
          label: 'Period 1',
          id: 'period1',
        },
        {
          label: 'Period 2',
          id: 'period2',
        },
        {
          label: 'Period 3',
          id: 'period3',
        },
        {
          label: 'Period 4',
          id: 'period4',
        },
      ]}
      data={[
        {
          daysOfTheWeek: 'Monday',
          period1: 'Math',
          period2: 'English',
          period3: 'Science',
          period4: 'History',
        },
        {
          daysOfTheWeek: 'Tuesday',
          period1: 'Geography',
          period2: 'Math',
          period3: 'English',
          period4: 'Physical Education',
        },
        {
          daysOfTheWeek: 'Wednesday',
          period1: 'Science',
          period2: 'History',
          period3: 'Math',
          period4: 'English',
        },
        {
          daysOfTheWeek: 'Thursday',
          period1: 'Physical Education',
          period2: 'Geography',
          period3: 'Science',
          period4: 'Math',
        },
        {
          daysOfTheWeek: 'Friday',
          period1: 'History',
          period2: 'Math',
          period3: 'English',
          period4: 'Science',
        },
      ]}
    />
  </Box>
);

export default CurrentTimetableOverview;
