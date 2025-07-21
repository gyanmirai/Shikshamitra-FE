import React from 'react';

import { Box, Card, Stack, Typography, LinearProgress } from '@mui/material';

import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

const chapterProgress = [
  { subject: 'Mathematics', updatedOn: '20-06-2025', completed: 12, total: 15, color: '#1976d2' },
  { subject: 'Physics', updatedOn: '18-06-2025', completed: 8, total: 15, color: '#2e7d32' },
  { subject: 'Chemistry', updatedOn: '18-06-2025', completed: 8, total: 15, color: '#d32f2f' },
];

const ClassManagementSubjectProgress = () => (
  <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Typography variant="h6" mb={3}>
      Chapter Progress Overview
    </Typography>
    <Stack spacing={1.5}>
      {chapterProgress.map((item, index) => (
        <SubjectProgressChart
          key={index}
          subject={item.subject}
          updatedDate={item.updatedOn}
          completedChapters={item.completed}
          totalChapters={item.total}
          color={item.color}
        />
      ))}
    </Stack>
  </Card>
);

export default ClassManagementSubjectProgress;

interface SubjectProgressChartProps {
  subject: string;
  updatedDate: string;
  completedChapters: number;
  totalChapters: number;
  color: string;
}

const SubjectProgressChart: React.FC<SubjectProgressChartProps> = ({
  subject,
  updatedDate,
  completedChapters,
  totalChapters,
  color,
}) => {
  const percentage = Math.round((completedChapters / totalChapters) * 100);

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
            {completedChapters}/{totalChapters}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Updated: {updatedDate}
        </Typography>
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
