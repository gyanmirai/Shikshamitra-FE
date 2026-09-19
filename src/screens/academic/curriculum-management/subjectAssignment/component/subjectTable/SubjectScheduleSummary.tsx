import type { SubjectScheduleBreakdown } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { Box, Paper, Typography } from '@mui/material';

const ITEMS = [
  { key: 'allocatedPeriodsPerWeek', label: 'Allocated / division' },
  { key: 'scheduledPeriods', label: 'Scheduled slots' },
  { key: 'divisionCount', label: 'Divisions' },
] as const;

export function SubjectScheduleSummary({ data }: { data: SubjectScheduleBreakdown }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
      {ITEMS.map((item) => (
        <Paper
          key={item.key}
          variant="outlined"
          sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'background.neutral' }}
        >
          <Typography variant="h6" fontWeight={700}>
            {data[item.key]}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.label}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
