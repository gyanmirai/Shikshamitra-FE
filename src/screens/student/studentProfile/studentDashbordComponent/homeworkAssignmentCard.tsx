import type { LabelColor } from 'src/components/label';

import React from 'react';

import { Box, Card, Stack, Typography } from '@mui/material';

import { ScheduleExamStatus, ScheduleExamStatusColor } from 'src/enums/schedule-exam-status';

import { Label } from 'src/components/label';

interface HomeworkAssignmentCardProps {
  title: string;
  date: string;
  submissionType: string;
  type: string;
  status: number;
}

const HomeworkAssignmentCard: React.FC<HomeworkAssignmentCardProps> = ({
  title,
  date,
  submissionType,
  type,
  status,
}) => {
  const color = ScheduleExamStatusColor[status as ScheduleExamStatus] as LabelColor;

  return (
    <Card
      variant="outlined"
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <Box>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {date}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Submission Type: {submissionType}
        </Typography>
      </Box>
      <Stack alignItems="flex-end">
        <Label color={color} sx={{ mb: 1 }}>
          {ScheduleExamStatus[status]}
        </Label>
        <Typography variant="body2" color="text.secondary">
          {type}
        </Typography>
      </Stack>
    </Card>
  );
};

export default HomeworkAssignmentCard;
