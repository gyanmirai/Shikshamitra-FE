import type { SubjectScheduleBreakdown } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { Iconify } from 'src/components/iconify';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

export function SubjectScheduleEmptyState({ data }: { data: SubjectScheduleBreakdown }) {
  const hasAllocationTarget = data.allocatedPeriodsPerWeek > 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        minHeight: { xs: 240, sm: 260 },
        p: { xs: 2.5, sm: 3 },
        display: 'grid',
        placeItems: 'center',
        borderRadius: 2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack alignItems="center" spacing={1.25} sx={{ maxWidth: 400, textAlign: 'center' }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            color: 'text.secondary',
            bgcolor: 'action.hover',
          }}
        >
          <Iconify icon="solar:calendar-search-outline" width={28} />
        </Box>

        <Chip
          size="small"
          variant="soft"
          color="default"
          label={hasAllocationTarget ? 'Awaiting timetable setup' : 'Setup not started'}
        />

        <Box>
          <Typography variant="h6">
            {hasAllocationTarget
              ? 'Timetable slots have not been added'
              : 'Weekly schedule not configured'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {hasAllocationTarget
              ? `The target is ${data.allocatedPeriodsPerWeek} periods per division, but no matching timetable slots have been saved yet.`
              : 'Set a weekly allocation for this subject, then add its periods to the timetable.'}
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{ width: 1, maxWidth: 360, p: 1.5, borderRadius: 1.5, bgcolor: 'background.paper' }}
        >
          <Stack direction="row" spacing={1.25} alignItems="flex-start" textAlign="left">
            <Iconify
              icon="solar:lightbulb-minimalistic-outline"
              width={20}
              color="text.secondary"
            />
            <Box>
              <Typography variant="subtitle2">What appears here?</Typography>
              <Typography variant="caption" color="text.secondary">
                Saved lectures will be grouped by day with period time, division, teacher, room and
                status.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );
}
