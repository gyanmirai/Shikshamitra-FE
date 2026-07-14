'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Tooltip, Typography, LinearProgress } from '@mui/material';

import type { SubjectCapacityRow } from '../types';

interface SubjectCapacityOverviewProps {
  subjects: SubjectCapacityRow[];
  totalStudents: number;
}

export default function SubjectCapacityOverview({
  subjects,
  totalStudents,
}: SubjectCapacityOverviewProps) {
  if (subjects.length === 0) return null;

  return (
    <Card sx={{ p: 2, mb: 1.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Subject Capacity Overview
      </Typography>
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={2}
        sx={{
          '& > *': { flex: '1 1 220px', minWidth: 220 },
        }}
      >
        {subjects.map((subject) => {
          const pct = totalStudents > 0 ? Math.round((subject.assignedCount / totalStudents) * 100) : 0;
          const color = subject.subjectColor || '#3b82f6';

          return (
            <Box key={subject.subjectId}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" fontWeight={600} noWrap sx={{ flexGrow: 1 }}>
                  {subject.subjectName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {subject.assignedCount}/{totalStudents}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 1 },
                }}
              />
              <Tooltip title="Maximum capacity has not been configured for this subject" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <Iconify
                    icon="solar:info-circle-bold-duotone"
                    sx={{ width: 14, height: 14, color: 'text.disabled' }}
                  />
                  <Typography variant="caption" color="text.disabled">
                    Capacity not configured
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}
