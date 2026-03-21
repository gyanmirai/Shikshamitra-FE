import type { LabelColor } from 'src/components/label';

import React from 'react';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
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
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 1.5,
        boxShadow: 'none',
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.divider, 0.4),
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'transparent',
          boxShadow: (theme) => theme.customShadows.z4,
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}
        >
          <Typography variant="subtitle2" noWrap sx={{ color: 'text.primary' }}>
            {title}
          </Typography>
          <Label color={color} variant="soft">
            {ScheduleExamStatus[status]}
          </Label>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ color: 'text.secondary', typography: 'caption' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify icon="solar:calendar-date-bold" width={14} />
            {date}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify icon="solar:file-check-bold" width={14} />
            {submissionType}
          </Box>
        </Stack>
      </Box>

      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          bgcolor: (theme) =>
            alpha(theme.palette[color === 'default' ? 'primary' : color].main, 0.08),
          color: (theme) => theme.palette[color === 'default' ? 'primary' : color].main,
        }}
      >
        <Iconify
          icon={
            type === 'Assignment'
              ? 'solar:document-text-bold-duotone'
              : 'solar:notebook-bold-duotone'
          }
          width={24}
        />
      </Box>
    </Card>
  );
};

export default HomeworkAssignmentCard;
