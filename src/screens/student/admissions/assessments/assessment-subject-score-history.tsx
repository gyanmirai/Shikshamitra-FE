import type { AssessmentAttempt } from 'src/redux/student/admissions/admission-assessment-types';

import { Stack, Typography } from '@mui/material';

import { assessmentProfileTotal, assessmentPassRuleLabels } from './assessment-subject-results';

/** History uses only the attempt snapshot, never today's subject catalog or policy. */
export function AssessmentSubjectScoreHistory({ attempt }: { attempt: AssessmentAttempt }) {
  const profile = attempt.effectiveProfile;
  if (!profile) return null;
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2">{profile.name}</Typography>
      <Typography variant="caption" color="text.secondary">
        {assessmentPassRuleLabels[profile.passRule]}
        {profile.passRule !== 'everySubject' ? ` · Passing: ${profile.passingMarks}` : ''}
      </Typography>
      {profile.subjects.map((subject) => {
        const score = attempt.subjectScores?.find(({ code }) => code === subject.code)?.marks;
        return (
          <Stack key={subject.code} direction="row" justifyContent="space-between" gap={1}>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {subject.name}
            </Typography>
            <Typography variant="body2" sx={{ flexShrink: 0 }}>
              {score == null ? 'Pending' : score} / {subject.totalMarks}
            </Typography>
          </Stack>
        );
      })}
      {attempt.marks != null && (
        <Typography variant="body2" fontWeight={600}>
          Total: {attempt.marks} / {assessmentProfileTotal(profile)}
        </Typography>
      )}
      {attempt.status === 'pending' &&
        attempt.subjectScores?.some(({ marks }) => marks != null) && (
          <Typography variant="caption" color="text.secondary">
            Draft result · not submitted
          </Typography>
        )}
    </Stack>
  );
}
