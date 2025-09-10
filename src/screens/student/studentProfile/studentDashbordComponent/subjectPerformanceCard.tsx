import React from 'react';
import { Box, Chip, Stack, Typography, LinearProgress } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

interface SubjectPerformanceItemProps {
  subject: string;
  percentage: number;
  grade: string;
  color: string;
}

const SubjectPerformanceItem: React.FC<SubjectPerformanceItemProps> = ({
  subject,
  percentage,
  grade,
  color,
}) => (
  <Stack spacing={1} mb={2}>
    <Stack direction="row" alignItems="center" spacing={1}>
      <SubjectColorIndicator color={color} />
      <Typography variant="subtitle1" fontWeight={600}>
        {subject}
      </Typography>
      <Box flexGrow={1} />
      <Typography variant="subtitle2">{percentage}%</Typography>
      <Chip
        label={grade}
        size="small"
        sx={{
          fontWeight: 'bold',
          color: 'white',
          bgcolor:
            grade === 'A+'
              ? '#34c38f'
              : grade === 'A'
                ? '#45b5f5'
                : grade === 'B+'
                  ? '#fcb92c'
                  : '#f65f5f',
        }}
      />
    </Stack>
    <LinearProgress
      variant="determinate"
      value={percentage}
      sx={{
        height: 6,
        borderRadius: 3,
        bgcolor: `${color}22`,
        '& .MuiLinearProgress-bar': {
          backgroundColor: color,
        },
      }}
    />
  </Stack>
);

export default SubjectPerformanceItem;
