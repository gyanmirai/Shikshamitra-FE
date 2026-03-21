'use client';

import React from 'react';
import { Box, Card, Stack, Typography, LinearProgress } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

const subjectProgress = [
  { subject: 'Mathematics', completed: 9, total: 12, color: '#1976d2' },
  { subject: 'Science', completed: 6, total: 14, color: '#2e7d32' },
  { subject: 'English', completed: 10, total: 10, color: '#ed6c02' },
];

const TeacherProgressOverview = () => (
  <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Typography variant="h6" mb={3}>
      Progress Overview
    </Typography>
    <Stack spacing={1.5}>
      {subjectProgress.map((item, index) => (
        <SubjectProgressItem
          key={index}
          subject={item.subject}
          completed={item.completed}
          total={item.total}
          color={item.color}
        />
      ))}
    </Stack>
  </Card>
);

export default TeacherProgressOverview;

interface SubjectProgressItemProps {
  subject: string;
  completed: number;
  total: number;
  color: string;
}

const SubjectProgressItem: React.FC<SubjectProgressItemProps> = ({
  subject,
  completed,
  total,
  color,
}) => {
  const percentage = Math.round((completed / total) * 100);

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        borderColor: 'divider',
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SubjectColorIndicator color={color} />
          <Typography variant="subtitle1" fontWeight={600}>
            {subject}
          </Typography>
          <Box flexGrow={1} />
          <Typography variant="subtitle2">
            {completed}/{total} ({percentage}%)
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 5,
            bgcolor: `${color}22`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
            },
          }}
        />
      </Stack>
    </Card>
  );
};
