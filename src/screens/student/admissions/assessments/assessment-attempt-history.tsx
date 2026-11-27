import type { AssessmentAttempt } from 'src/redux/student/admissions/admission-assessment-types';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Box, Grid, Stack, Typography } from '@mui/material';

import { normalizeAssessmentDateTime } from './assessment-date-time';
import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';
import { AssessmentSubjectScoreHistory } from './assessment-subject-score-history';
import { assessmentProfileTotal } from './assessment-subject-results';

function CompactAttempt({
  attempt,
  className,
}: {
  attempt: AssessmentAttempt;
  className?: string;
}) {
  const profile = attempt.effectiveProfile;
  const fields = [
    [
      'Session',
      attempt.sessionName ||
        (attempt.sessionId ? 'Scheduled session' : 'Without scheduled session'),
    ],
    ['Attendance', attempt.attendance],
    ['Created', dayjs(attempt.createdAt).format(ADMISSION_DATE_TIME_FORMAT)],
    [
      'Passing marks',
      profile && profile.passRule !== 'everySubject' ? String(profile.passingMarks) : '—',
    ],
  ];
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, minWidth: 0 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
        flexWrap="wrap"
      >
        <Stack direction="row" alignItems="center" spacing={1}>
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
        <Typography variant="subtitle2">
          {attempt.marks ?? 'Pending'}
          {profile ? ` / ${assessmentProfileTotal(profile)}` : ''}
        </Typography>
      </Stack>
      {(profile || className) && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {[profile?.name, className].filter(Boolean).join(' · ')}
        </Typography>
      )}
      <Grid container component="dl" spacing={1.5} sx={{ mt: 0.5, mb: 0, mx: 0 }}>
        {fields.map(([label, value]) => (
          <Grid key={label} size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
            <Typography component="dt" variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
              {value}
            </Typography>
          </Grid>
        ))}
      </Grid>
      {profile && (
        <Box sx={{ mt: 1 }}>
          <AssessmentSubjectScoreHistory attempt={attempt} />
        </Box>
      )}
      {attempt.sessionStartsAt && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Scheduled:{' '}
          {dayjs(normalizeAssessmentDateTime(attempt.sessionStartsAt)).format(
            ADMISSION_DATE_TIME_FORMAT
          )}
          {attempt.sessionEndsAt
            ? ` – ${dayjs(normalizeAssessmentDateTime(attempt.sessionEndsAt)).format(ADMISSION_DATE_TIME_FORMAT)}`
            : ''}
          {attempt.sessionLocation ? ` · ${attempt.sessionLocation}` : ''}
        </Typography>
      )}
      {attempt.notes && (
        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
          {attempt.notes}
        </Typography>
      )}
      {(attempt.reviewNotes || attempt.reviewedAt) && (
        <Box sx={{ mt: 1.5, p: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
          {attempt.reviewNotes && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {attempt.reviewNotes}
            </Typography>
          )}
          {attempt.reviewedAt && (
            <Typography variant="caption" color="text.secondary">
              Reviewed {dayjs(attempt.reviewedAt).format(ADMISSION_DATE_TIME_FORMAT)}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

export function AssessmentAttemptHistory({
  attempts,
  compact = false,
  className,
}: {
  attempts: AssessmentAttempt[];
  compact?: boolean;
  className?: string;
}) {
  return (
    <Stack spacing={1}>
      {attempts.map((attempt) =>
        compact ? (
          <CompactAttempt key={attempt.id} attempt={attempt} className={className} />
        ) : (
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
              {` · Created ${dayjs(attempt.createdAt).format(ADMISSION_DATE_TIME_FORMAT)}`}
            </Typography>
            {attempt.effectiveProfile && <AssessmentSubjectScoreHistory attempt={attempt} />}
            {attempt.sessionStartsAt && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Scheduled:{' '}
                {dayjs(normalizeAssessmentDateTime(attempt.sessionStartsAt)).format(
                  ADMISSION_DATE_TIME_FORMAT
                )}
                {attempt.sessionEndsAt
                  ? ` – ${dayjs(normalizeAssessmentDateTime(attempt.sessionEndsAt)).format(ADMISSION_DATE_TIME_FORMAT)}`
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
                Reviewed {dayjs(attempt.reviewedAt).format(ADMISSION_DATE_TIME_FORMAT)}
              </Typography>
            )}
          </Box>
        )
      )}
    </Stack>
  );
}
