import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Box, Card, Stack, Typography } from '@mui/material';
import { ScheduleExamStatus, ScheduleExamStatusColor } from 'src/enums/schedule-exam-status';

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
      sx={{
        p: 2,
        borderRadius: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'action.hover',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            {date}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Type: {submissionType}
          </Typography>
        </Stack>
      </Box>
      <Stack alignItems="flex-end" spacing={1}>
        <Label color={color} variant="soft">
          {ScheduleExamStatus[status]}
        </Label>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {type}
        </Typography>
      </Stack>
    </Card>
  );
};

export default HomeworkAssignmentCard;
