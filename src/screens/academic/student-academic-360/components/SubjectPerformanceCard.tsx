'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography, LinearProgress } from '@mui/material';

import { Academic360EmptyState } from './Academic360EmptyState';

import type { Academic360SubjectPerformance } from '../types';

type SubjectPerformanceCardProps = {
  subjectPerformance?: Academic360SubjectPerformance[];
};

export function SubjectPerformanceCard({ subjectPerformance = [] }: SubjectPerformanceCardProps) {
  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: (theme) => `${theme.palette.primary.main}14`,
              color: 'primary.main',
            }}
          >
            <Iconify icon="mdi:chart-line" width={19} />
          </Box>
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            Subject Performance
          </Typography>
        </Stack>

        {subjectPerformance.length > 0 ? (
          <Stack spacing={1}>
            {subjectPerformance.slice(0, 5).map((subject) => (
              <Box key={subject.subjectId || subject.subjectName}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">{subject.subjectName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {subject.averagePercentage || 0}% avg · {subject.examCount || 0} exams
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={subject.averagePercentage || 0}
                  sx={{ mt: 0.5, height: 5, borderRadius: 1 }}
                  color={
                    (subject.averagePercentage || 0) >= 75
                      ? 'success'
                      : (subject.averagePercentage || 0) >= 50
                        ? 'warning'
                        : 'error'
                  }
                />
              </Box>
            ))}
          </Stack>
        ) : (
          <Academic360EmptyState
            icon="mdi:chart-line"
            color="info"
            title="No subject data yet"
            description="Subject-wise performance will appear here after marks are recorded across exams."
            compact
          />
        )}
      </Stack>
    </Card>
  );
}
