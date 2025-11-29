'use client';

import { Box, Card, Stack, Checkbox, Typography } from '@mui/material';

const responsibilities = [
  { title: 'Attendance Follow-up', description: 'Check absentees for Class 9A', checked: false },
  {
    title: 'Student Issues',
    description: 'Resolve conflict between Student A and B',
    checked: false,
  },
  { title: 'Notices', description: 'Distribute exam schedule', checked: true },
  {
    title: 'Parent Meeting',
    description: 'Schedule call with parent of Student C',
    checked: false,
  },
];

const TeacherClassResponsibilities = () => (
  <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Typography variant="h6" mb={2}>
      Class Teacher Responsibilities
    </Typography>
    <Stack spacing={1}>
      {responsibilities.map((item, index) => (
        <Card
          key={index}
          variant="outlined"
          sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center' }}
        >
          <Box flexGrow={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          </Box>
          <Checkbox checked={item.checked} />
        </Card>
      ))}
    </Stack>
  </Card>
);

export default TeacherClassResponsibilities;
