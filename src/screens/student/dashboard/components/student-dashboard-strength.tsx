import type { StudentModuleDashboardSection } from 'src/redux/student/dashboard/student-module-dashboard-types';

import Link from 'next/link';
import { fNumber } from 'src/utils/format-number';
import { Box, Stack, ButtonBase, Typography, LinearProgress } from '@mui/material';

export default function StudentDashboardStrength({
  rows,
}: {
  rows: StudentModuleDashboardSection['classStrength'];
}) {
  const maximum = Math.max(1, ...rows.map((row) => row.students));
  return (
    <Stack spacing={1} sx={{ mt: 2 }}>
      <Typography variant="subtitle2">Class strength</Typography>
      <Typography variant="caption" color="text.secondary">
        Up to 12 largest visible classes with active permanent records
      </Typography>
      {rows.length ? (
        rows.map((row) => (
          <ButtonBase
            key={row.standardId ?? 'unassigned'}
            component={Link}
            href={row.href}
            prefetch={false}
            aria-label={`${row.label}: ${fNumber(row.students)} students. Open student directory`}
            sx={{
              p: 1,
              minHeight: 44,
              borderRadius: 1,
              display: 'block',
              textAlign: 'left',
              '&:hover': { bgcolor: 'action.hover' },
              '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="body2">{row.label}</Typography>
              <Typography variant="body2" sx={{ flexShrink: 0 }}>
                {fNumber(row.students)}
              </Typography>
            </Stack>
            <Box aria-hidden="true">
              <LinearProgress
                variant="determinate"
                value={(row.students / maximum) * 100}
                sx={{ height: 4, borderRadius: 1 }}
              />
            </Box>
          </ButtonBase>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No active permanent records in this year and scope.
        </Typography>
      )}
    </Stack>
  );
}
