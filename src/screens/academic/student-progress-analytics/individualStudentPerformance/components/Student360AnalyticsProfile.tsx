'use client';

import type {
  Academic360Health,
  Academic360StudentRow,
  Academic360DataCompleteness,
} from 'src/screens/academic/student-academic-360/types';

import { Iconify } from 'src/components/iconify';
import { getStudentName } from 'src/screens/academic/student-academic-360/types';
import { Box, Card, Chip, Stack, Avatar, Typography, LinearProgress } from '@mui/material';
import { HealthScoreGauge } from 'src/screens/academic/student-academic-360/components/HealthScoreGauge';

type Student360AnalyticsProfileProps = {
  student?: Academic360StudentRow;
  health?: Academic360Health | null;
  completeness?: Academic360DataCompleteness;
};

export function Student360AnalyticsProfile({
  student,
  health,
  completeness,
}: Student360AnalyticsProfileProps) {
  const studentName = student ? getStudentName(student) || 'Selected Student' : 'Selected Student';
  const photoUrl = student?.profileImageUrl || student?.photoUrl || '';
  const classLabel = [
    student?.standardName || student?.standard,
    student?.divisionName || student?.division,
  ]
    .filter(Boolean)
    .join(' - ');

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Avatar src={photoUrl || undefined} alt={studentName} sx={{ width: 84, height: 84 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap>
            {studentName}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.75 }}>
            <Chip size="small" variant="soft" label={classLabel || 'Class not available'} />
            <Chip size="small" variant="soft" label={`GR No: ${student?.grNo || '-'}`} />
            <Chip size="small" variant="soft" label={`Roll No: ${student?.rollNo || '-'}`} />
          </Stack>
          <Stack spacing={0.75} sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify
                icon="mdi:database-check-outline"
                width={18}
                sx={{ color: 'text.secondary' }}
              />
              <Typography variant="body2" color="text.secondary">
                Data completeness: {completeness?.percentage ?? 0}% -{' '}
                {completeness?.status || 'Limited data'}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={completeness?.percentage || 0}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Stack>
        </Box>
        <Stack alignItems="center" spacing={1}>
          <HealthScoreGauge score={health?.score} size={96} />
          <Chip
            size="small"
            color={health?.score ? 'success' : 'default'}
            variant="soft"
            label={health?.status || 'Insufficient Data'}
          />
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {health?.explanation ||
          'Academic health uses available attendance, learning task, subject progress, and alert data from Student Academic 360.'}
      </Typography>
    </Card>
  );
}
