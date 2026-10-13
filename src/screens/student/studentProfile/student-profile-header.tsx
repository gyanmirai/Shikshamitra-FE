import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';

import { Label } from 'src/components/label';
import { Box, Paper, Stack, Avatar, Typography } from '@mui/material';

export function StudentProfileHeader({
  student,
  compact = false,
}: {
  student: StudentRecordProfile;
  compact?: boolean;
}) {
  const name =
    [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') ||
    'Restricted student identity';
  const status = { 6: 'Active', 7: 'Inactive', 8: 'Left' }[student.status] ?? 'Unavailable';
  return (
    <Paper variant="outlined" sx={{ p: 1.5, flexShrink: 0 }}>
      <Stack direction="row" spacing={2} alignItems="center" useFlexGap flexWrap="wrap">
        <Avatar
          alt={name}
          sx={{
            width: compact ? 32 : 40,
            height: compact ? 32 : 40,
            bgcolor: 'background.neutral',
            color: 'text.secondary',
          }}
        >
          {student.firstName?.[0]}
          {student.lastName?.[0]}
        </Avatar>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{ flex: '1 1 200px', minWidth: 0 }}
        >
          <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
            {name}
          </Typography>
          <Label color={student.status === 6 ? 'success' : 'default'}>{status}</Label>
        </Stack>
        {[
          { label: 'GR number', value: student.grNumber ?? student.grNo },
          {
            label: 'Class / Division',
            value: [student.standardName, student.divisionName].filter(Boolean).join(' · '),
          },
          { label: 'Roll number', value: student.rollNo },
          { label: 'Medium', value: student.academicMediumName },
        ].map((field) => (
          <Box
            key={field.label}
            sx={{ flex: '0 1 auto', minWidth: { xs: 'calc(50% - 16px)', sm: 90 } }}
          >
            <Typography variant="caption" color="text.secondary">
              {field.label}
            </Typography>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {field.value == null || field.value === '' ? '—' : field.value}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
