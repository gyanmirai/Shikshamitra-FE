import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Box, Paper, Stack, Avatar, Divider, Typography } from '@mui/material';

export function StudentProfileHeader({
  student,
  compact = false,
}: {
  student: StudentRecordProfile;
  compact?: boolean;
}) {
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const board = currentYear?.boards?.find((item: Board) =>
    item.educationMediums?.some((medium: Medium) => medium.id === student.academicMediumId)
  );
  const yearName =
    student.enrollmentHistory?.find((item) => item.academicYearId === student.academicYearId)
      ?.academicYearName ??
    (currentYear?.id === student.academicYearId || !student.academicYearId
      ? currentYear?.name
      : null);
  const entry = student.entrySource
    ? {
        ActivatedOnboarding: 'Enrollment activated',
        CompletedOnboarding: 'Onboarding completed',
        LegacyOverride: 'Approved historical entry',
        Provisioning: 'Provisioning',
      }[student.entrySource]
    : undefined;
  const name =
    [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') ||
    'Restricted student identity';
  const status = { 6: 'Active', 7: 'Inactive', 8: 'Left' }[student.status] ?? 'Unavailable';
  return (
    <Paper variant="outlined" sx={{ p: 1.5, flexShrink: 0, minWidth: 0 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            md: 'minmax(0, 1fr) repeat(4, minmax(0, auto))',
          },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ minWidth: 0, gridColumn: { xs: '1 / -1', md: 'auto' } }}
        >
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
            sx={{ minWidth: 0 }}
          >
            <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
              {name}
            </Typography>
            <Label color={student.status === 6 ? 'success' : 'default'}>{status}</Label>
          </Stack>
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
          <Box key={field.label} sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {field.label}
            </Typography>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {field.value == null || field.value === '' ? '—' : field.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Divider sx={{ my: 1.5 }} />
      <Stack
        component="section"
        aria-label="Academic context"
        direction="row"
        spacing={2}
        useFlexGap
        flexWrap="wrap"
      >
        {[
          { label: 'Academic year', value: yearName },
          { label: 'Board', value: board?.name },
          { label: 'Record source', value: entry },
        ].map((field) => (
          <Stack
            key={field.label}
            component="dl"
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{ m: 0, minWidth: 0 }}
          >
            <Typography component="dt" variant="body2" color="text.secondary">
              {field.label}
            </Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
              {field.value || '—'}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
