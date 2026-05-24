import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Alert, Stack, Typography } from '@mui/material';

const EmployeeExam = () => (
  <Box>
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Iconify icon="solar:notebook-bookmark-linear" width={24} />
        <Box>
          <Typography variant="subtitle2">Staff exam schedule is not connected.</Typography>
          <Alert severity="info" sx={{ mt: 1 }}>
            Exam and timetable data will appear here after the employee academic API is connected.
          </Alert>
        </Box>
      </Stack>
    </Card>
  </Box>
);

export default EmployeeExam;
