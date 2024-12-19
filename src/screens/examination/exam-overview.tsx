import React from 'react';

import { Box, Switch, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

import { CalendarView } from 'src/sections/calendar/view';
import { TabComponentType } from '../hr/leave-request';

const ExamOverview = (props: TabComponentType) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography sx={{ mr: 1 }}>List View</Typography>
      <Switch
        onChange={(event) => {
          // Handle switch change
          console.log(event.target.checked ? 'Calendar View' : 'List View');
        }}
      />
      <Typography sx={{ ml: 1 }}>Calendar View</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <CustomSelect
        options={[]}
        label="class wise"
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
      />
      <CustomSelect
        options={[]}
        label="subject wise"
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
      />
      <CustomSelect
        options={[]}
        label="Teacher wise"
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
      />
      <CustomSelect
        options={[]}
        label="Sort by"
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
      />
    </Box>
    <CalendarView />
  </Box>
);

export default ExamOverview;
