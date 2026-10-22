import type { AssessmentAttempt } from 'src/redux/student/admissions/admission-assessment-types';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Box, Stack, Typography } from '@mui/material';

import { normalizeAssessmentDateTime } from './assessment-date-time';
import { AssessmentSubjectScoreHistory } from './assessment-subject-score-history';

export function AssessmentAttemptHistory({
  attempts,
  compact = false,
}: {
  attempts: AssessmentAttempt[];
  compact?: boolean;
}) {
  return (
    <Stack spacing={1}>
      {attempts.map((attempt) => (
        <Box
          key={attempt.id}
          sx={
            compact
              ? { py: 0.5, minWidth: 0, overflowWrap: 'anywhere' }
              : { border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5 }
          }
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Typography variant="subtitle2">Attempt {attempt.attemptNumber}</Typography>
            <Label
              color={
                attempt.outcome === 'passed'
                  ? 'success'
                  : attempt.outcome === 'failed'
                    ? 'error'
                    : 'default'
              }
            >
              {attempt.status === 'cancelled'
                ? 'Cancelled'
                : attempt.status === 'pendingReview'
                  ? 'Awaiting review'
                  : attempt.outcome}
            </Label>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {attempt.sessionName ||
              (attempt.sessionId ? 'Scheduled session' : 'Without scheduled session')}{' '}
            · Attendance: {attempt.attendance}
            {attempt.marks != null ? ` · Marks: ${attempt.marks}` : ''}
            {` · Created ${dayjs(attempt.createdAt).format('DD MMM YYYY, h:mm A')}`}
          </Typography>
          {attempt.effectiveProfile && <AssessmentSubjectScoreHistory attempt={attempt} />}
          {attempt.sessionStartsAt && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Scheduled:{' '}
              {dayjs(normalizeAssessmentDateTime(attempt.sessionStartsAt)).format(
                'DD MMM YYYY, h:mm A'
              )}
              {attempt.sessionEndsAt
                ? ` – ${dayjs(normalizeAssessmentDateTime(attempt.sessionEndsAt)).format('DD MMM YYYY, h:mm A')}`
                : ''}
              {attempt.sessionLocation ? ` · ${attempt.sessionLocation}` : ''}
            </Typography>
          )}
          {attempt.notes && (
            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
              {attempt.notes}
            </Typography>
          )}
          {attempt.reviewNotes && (
            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
              Review: {attempt.reviewNotes}
            </Typography>
          )}
          {attempt.reviewedAt && (
            <Typography variant="caption" color="text.secondary">
              Reviewed {dayjs(attempt.reviewedAt).format('DD MMM YYYY, h:mm A')}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  );
}
