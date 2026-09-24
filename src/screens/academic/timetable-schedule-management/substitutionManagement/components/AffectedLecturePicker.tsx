import { Add, CheckCircle } from '@mui/icons-material';
import { Box, Chip, Grid, Alert, Stack, Button, Skeleton, Typography } from '@mui/material';

import type { AffectedLectureRow } from '../substitutionData';

type AffectedLecturePickerProps = {
  lectures: AffectedLectureRow[];
  selectedLectureId: string;
  hasTeacher: boolean;
  hasAcademicMedium: boolean;
  hasValidRange: boolean;
  invalidRangeMessage?: string;
  loading: boolean;
  loadError: boolean;
  onSelect: (lecture: AffectedLectureRow) => void;
};

export function AffectedLecturePicker({
  lectures,
  selectedLectureId,
  hasTeacher,
  hasAcademicMedium,
  hasValidRange,
  invalidRangeMessage = 'End time must be later than start time.',
  loading,
  loadError,
  onSelect,
}: AffectedLecturePickerProps) {
  if (!hasTeacher) {
    return <Alert severity="info">Select the unavailable teacher to load affected lectures.</Alert>;
  }

  if (!hasAcademicMedium) {
    return <Alert severity="info">Select an academic medium to load affected lectures.</Alert>;
  }

  if (!hasValidRange) {
    return <Alert severity="error">{invalidRangeMessage}</Alert>;
  }

  if (loading) {
    return (
      <Stack spacing={1} aria-label="Loading affected lectures">
        {[0, 1].map((item) => (
          <Skeleton key={item} variant="rounded" height={82} />
        ))}
      </Stack>
    );
  }

  if (loadError) {
    return (
      <Alert severity="error">
        Affected lectures could not be loaded. Review the teacher and time window, then try again.
      </Alert>
    );
  }

  if (lectures.length === 0) {
    return (
      <Alert severity="info">
        No published timetable lectures are affected in this time window.
      </Alert>
    );
  }

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="caption" color="text.secondary">
          Lectures from the published timetable for the selected academic medium.
        </Typography>
      </Grid>
      {lectures.map((lecture) => {
        const lectureId = lecture.slotSubjectId || lecture.id;
        const isSelected = lectureId === selectedLectureId || lecture.period === selectedLectureId;
        const canSelect = lecture.canCreateSubstitution !== false;

        return (
          <Grid key={lecture.id} size={{ xs: 12 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: (theme) =>
                  `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                bgcolor: isSelected ? 'action.selected' : 'background.paper',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
                spacing={1.5}
              >
                <Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                    <Typography variant="subtitle2">
                      {lecture.period} · {lecture.startTime}-{lecture.endTime}
                    </Typography>
                    <Chip
                      size="small"
                      label={`Class ${lecture.className}-${lecture.divisionName}`}
                      color="primary"
                      variant="soft"
                    />
                    <Chip size="small" label={lecture.subjectName} color="info" variant="soft" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {lecture.roomName || 'Room not assigned'} · {lecture.teacherName}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant={isSelected ? 'contained' : 'outlined'}
                  startIcon={isSelected || !canSelect ? <CheckCircle /> : <Add />}
                  disabled={!canSelect}
                  onClick={() => onSelect(lecture)}
                  sx={{ minHeight: 44, flexShrink: 0 }}
                >
                  {!canSelect
                    ? lecture.createSubstitutionBlockReason ||
                      (lecture.existingSubstitutionId ? 'Already assigned' : 'Unavailable')
                    : isSelected
                      ? 'Selected'
                      : 'Select lecture'}
                </Button>
              </Stack>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}
