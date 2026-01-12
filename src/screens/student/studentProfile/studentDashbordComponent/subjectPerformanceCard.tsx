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
  <Stack spacing={1.5} mb={2.5}>
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <SubjectColorIndicator color={color} />
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {subject}
      </Typography>
      <Box flexGrow={1} />
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {percentage}%
        </Typography>
        <Chip
          label={grade}
          size="small"
          sx={{
            fontWeight: 700,
            borderRadius: 1,
            height: 24,
            width: 36,
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
    </Stack>
    <LinearProgress
      variant="determinate"
      value={percentage}
      sx={{
        height: 8,
        borderRadius: 4,
        bgcolor: `${color}22`,
        '& .MuiLinearProgress-bar': {
          backgroundColor: color,
          borderRadius: 4,
        },
      }}
    />
  </Stack>
);

export default SubjectPerformanceItem;
