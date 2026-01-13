import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Box, Card, Typography } from '@mui/material';
import { ScheduleExamStatus, ScheduleExamStatusColor } from 'src/enums/schedule-exam-status';

interface ExamCardProps {
  subject: string;
  date: string;
  status: number;
}

const ExamCard: React.FC<ExamCardProps> = ({ subject, date, status }: ExamCardProps) => {
  const color = ScheduleExamStatusColor[status as ScheduleExamStatus] as LabelColor;

  return (
    <Card
      sx={{
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 1.5,
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
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {subject}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {date}
        </Typography>
      </Box>
      <Label color={color} variant="soft">
        {ScheduleExamStatus[status]}
      </Label>
    </Card>
  );
};

export default ExamCard;
