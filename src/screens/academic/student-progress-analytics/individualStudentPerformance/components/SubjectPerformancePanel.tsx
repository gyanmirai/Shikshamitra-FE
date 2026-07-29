'use client';

import type { Academic360SubjectPerformance } from 'src/screens/academic/student-academic-360/types';

import { Card, Stack, Typography, LinearProgress } from '@mui/material';
import { Academic360EmptyState } from 'src/screens/academic/student-academic-360/components/Academic360EmptyState';

type SubjectPerformancePanelProps = {
  subjects?: Academic360SubjectPerformance[];
};

const getProgressColor = (value?: number): 'success' | 'warning' | 'error' => {
  if ((value || 0) >= 75) return 'success';
  if ((value || 0) >= 50) return 'warning';
  return 'error';
};

export function SubjectPerformancePanel({ subjects = [] }: SubjectPerformancePanelProps) {
  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
        Subject Performance
      </Typography>
      {subjects.length > 0 ? (
        <Stack spacing={1.25}>
          {subjects.slice(0, 6).map((subject) => (
            <Stack key={subject.subjectId || subject.subjectName} spacing={0.5}>
              <Stack direction="row" justifyContent="space-between" gap={1}>
                <Typography variant="body2">{subject.subjectName || 'Subject'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {subject.averagePercentage ?? 0}% avg
                  {subject.latestGrade ? ` - ${subject.latestGrade}` : ''}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={subject.averagePercentage || 0}
                color={getProgressColor(subject.averagePercentage)}
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Stack>
          ))}
        </Stack>
      ) : (
        <Academic360EmptyState
          icon="mdi:chart-line"
          color="info"
          title="No subject analytics yet"
          description="Subject-wise analytics will appear when Academic 360 receives enough marks or progress records."
          compact
        />
      )}
    </Card>
  );
}
