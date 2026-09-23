import type { SubjectScheduleBreakdown } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { Iconify } from 'src/components/iconify';
import { Box, Paper, Stack, Typography } from '@mui/material';

const ITEMS = [
  {
    key: 'allocatedPeriodsPerWeek',
    label: 'Target / division',
    icon: 'solar:calendar-mark-outline',
  },
  {
    key: 'scheduledPeriods',
    label: 'Scheduled slots',
    icon: 'solar:clock-circle-outline',
  },
  {
    key: 'divisionCount',
    label: 'Divisions',
    icon: 'solar:users-group-rounded-outline',
  },
] as const;

export function SubjectScheduleSummary({ data }: { data: SubjectScheduleBreakdown }) {
  return (
    <Stack spacing={1.5} component="section" aria-labelledby="weekly-overview-title">
      <Box>
        <Typography id="weekly-overview-title" variant="subtitle2">
          Weekly overview
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Allocation targets and timetable coverage at a glance
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {ITEMS.map((item) => (
          <Paper key={item.key} variant="outlined" sx={{ minHeight: 108, p: 1.5, borderRadius: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 1.25,
                color: 'text.secondary',
                bgcolor: 'action.hover',
                mb: 1,
              }}
            >
              <Iconify icon={item.icon} width={18} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {data[item.key]}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
              {item.label}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Stack>
  );
}
