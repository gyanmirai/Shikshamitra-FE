import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import AllocationStatusBadge from '../common/AllocationStatusBadge';
import { getSeatingPlanPrimaryAction } from './seating-plan-actions';

import type { SeatingPlanListRow } from '../../types';

interface Props {
  rows: SeatingPlanListRow[];
  isLoading?: boolean;
  canAdd: boolean;
  emptyState: ReactNode;
  onPreview: (row: SeatingPlanListRow) => void;
  onPrimaryAction: (row: SeatingPlanListRow) => void;
}

export default function SeatingPlanMobileList({
  rows,
  isLoading,
  canAdd,
  emptyState,
  onPreview,
  onPrimaryAction,
}: Props) {
  if (isLoading) {
    return (
      <Stack spacing={1} aria-label="Loading examination seating plans">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} variant="rounded" height={190} />
        ))}
      </Stack>
    );
  }

  if (rows.length === 0) return emptyState;

  return (
    <Stack component="section" aria-label="Examination seating plans" spacing={1}>
      {rows.map((row) => {
        const action = getSeatingPlanPrimaryAction(row.status);
        const progress = Math.min(100, Math.max(0, row.progress));
        return (
          <Paper key={row.id} component="article" variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1.5}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {row.examName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.examTypeName} · {row.standardName}
                  </Typography>
                </Box>
                <AllocationStatusBadge status={row.status} />
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Typography variant="body2">
                  {row.allocatedStudents} of {row.totalStudents} students seated
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.seatingPlanCount} plan{row.seatingPlanCount === 1 ? '' : 's'}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                aria-label={`${row.examName} allocation progress`}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  '& .MuiLinearProgress-bar': { borderRadius: 1 },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {row.plannedSubjectCount} of {row.subjectCount} subjects assigned ·{' '}
                {row.divisions.length} division{row.divisions.length === 1 ? '' : 's'}
              </Typography>
              <Typography variant="body2">
                {row.subjectNames.join(', ') || 'No subjects scheduled'}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                {canAdd && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    startIcon={<Iconify icon={action.icon} />}
                    onClick={() => onPrimaryAction(row)}
                    sx={{ minHeight: 44 }}
                  >
                    {action.label}
                  </Button>
                )}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:eye-outline" />}
                  onClick={() => onPreview(row)}
                  sx={{ minHeight: 44 }}
                >
                  Preview details
                </Button>
              </Stack>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
