'use client';

import React from 'react';
import { Box, Card, Stack, Typography, LinearProgress } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

const subjectProgress = [
  { subject: 'Mathematics', percentage: 80, color: '#1976d2' },
  { subject: 'Science', percentage: 72, color: '#2e7d32' },
  { subject: 'English', percentage: 91, color: '#ed6c02' },
  { subject: 'History', percentage: 65, color: '#d32f2f' },
];

const PrincipalSubjectCompletion = () => (
  <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Typography variant="h6" mb={3}>
      Subject Completion Overview
    </Typography>
    <Stack spacing={1.5}>
      {subjectProgress.map((item, index) => (
        <SubjectProgressItem
          key={index}
          subject={item.subject}
          percentage={item.percentage}
          color={item.color}
        />
      ))}
    </Stack>
  </Card>
);

export default PrincipalSubjectCompletion;

interface SubjectProgressItemProps {
  subject: string;
  percentage: number;
  color: string;
}

const SubjectProgressItem: React.FC<SubjectProgressItemProps> = ({
  subject,
  percentage,
  color,
}) => (
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
        <Typography variant="subtitle2">{percentage}%</Typography>
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
