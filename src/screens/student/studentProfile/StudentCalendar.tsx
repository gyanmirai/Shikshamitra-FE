'use client';

import { Box, Typography } from '@mui/material';
import CommonCalender from 'src/components/calender';

import type { StudentTabsComponentType } from '.';

const StudentCalendar = (props: StudentTabsComponentType) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <Typography variant="body2" color="text.secondary">
      No calendar events found.
    </Typography>
    <CommonCalender data={[]} />
  </Box>
);

export default StudentCalendar;
