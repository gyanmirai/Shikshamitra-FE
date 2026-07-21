'use client';

import { Box, Chip, Stack, Avatar, Typography } from '@mui/material';

import { readText, getStudentName } from '../types';

import type { Academic360StudentRow } from '../types';

type StudentSummaryStripProps = {
  student: Academic360StudentRow;
};

export function StudentSummaryStrip({ student }: StudentSummaryStripProps) {
  const name = getStudentName(student);

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
          {name.charAt(0).toUpperCase() || 'S'}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap>
            {name || 'Student'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            GR No. {readText(student.grNo)} | Roll No. {readText(student.rollNo)}
          </Typography>
        </Box>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Chip size="small" label={readText(student.standardName ?? student.standard, 'Class')} />
          <Chip size="small" label={readText(student.divisionName ?? student.division, 'Division')} />
          <Chip size="small" variant="soft" color="info" label={readText(student.academicMediumName, 'Medium')} />
        </Stack>
      </Stack>
    </Box>
  );
}
