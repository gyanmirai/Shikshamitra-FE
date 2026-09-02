import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { varAlpha } from 'src/theme/styles';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import type { SeatingPlanListRow } from '../../types';

function divisionLabel(name: string) {
  if (name === 'Total') return name;
  return /^div(ision)?\s+/i.test(name) ? name.replace(/^division\s+/i, 'Div ') : `Div ${name}`;
}

export default function DivisionProgressCell({ row }: { row: SeatingPlanListRow }) {
  const divisionProgress = row.divisionProgress ?? [];
  const divisions =
    divisionProgress.length > 0
      ? divisionProgress
      : [
          {
            divisionId: row.examId,
            divisionName: 'Total',
            totalStudents: row.totalStudents,
            allocatedStudents: row.allocatedStudents,
            pendingStudents: row.pendingStudents,
            progress: row.progress,
          },
        ];

  const totalProgress =
    row.totalStudents > 0 ? Math.round((row.allocatedStudents / row.totalStudents) * 100) : 0;
  const chipColor = totalProgress >= 100 ? 'success' : totalProgress > 0 ? 'warning' : 'default';

  return (
    <Stack spacing={0.75} sx={{ minWidth: 200, maxWidth: 260, py: 0.5 }}>
      <Chip
        size="small"
        variant="soft"
        color={chipColor}
        label={`Total: ${row.allocatedStudents}/${row.totalStudents} allocated (${totalProgress}%)`}
        sx={{ alignSelf: 'flex-start', height: 22, fontSize: '0.7rem', fontWeight: 700 }}
      />
      {divisions.map((division) => {
        const divisionProgressValue = Math.min(100, Math.max(0, division.progress));
        const label = divisionLabel(division.divisionName);
        return (
          <Tooltip
            key={division.divisionId}
            title={`${label}: ${division.allocatedStudents}/${division.totalStudents} allocated`}
            arrow
          >
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Typography
                  variant="caption"
                  color="text.primary"
                  noWrap
                  sx={{ maxWidth: 110, fontWeight: 700 }}
                >
                  {label}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ flexShrink: 0, fontWeight: 600 }}
                >
                  {division.allocatedStudents}/{division.totalStudents} allocated
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={divisionProgressValue}
                aria-label={`${label} allocation progress`}
                color={
                  divisionProgressValue >= 100
                    ? 'success'
                    : divisionProgressValue > 0
                      ? 'warning'
                      : 'inherit'
                }
                sx={{
                  mt: 0.35,
                  height: 5,
                  borderRadius: 3,
                  bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
                  '& .MuiLinearProgress-bar': { borderRadius: 3 },
                }}
              />
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
}
