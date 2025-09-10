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
      variant="outlined"
      sx={{
        px: 2,
        py: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 2,
      }}
    >
      <Box>
        <Typography variant="subtitle1">{subject}</Typography>
        <Typography variant="body2" color="text.secondary">
          {date}
        </Typography>
      </Box>
      <Label color={color}>{ScheduleExamStatus[status]}</Label>
    </Card>
  );
};

export default ExamCard;
