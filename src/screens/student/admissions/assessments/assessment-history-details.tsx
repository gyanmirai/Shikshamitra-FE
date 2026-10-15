import { Alert, Stack, Skeleton } from '@mui/material';
import { useGetApplicationAssessmentQuery } from 'src/redux/student/admissions/admission-assessments-api';

import { AdmissionQueryError } from '../admission-query-error';
import { AssessmentAttemptCard } from './assessment-attempt-card';
import { AssessmentAttemptHistory } from './assessment-attempt-history';
import { useAssessmentPermissions } from './use-assessment-permissions';

export function AssessmentHistoryDetails({
  applicationId,
  stageInstanceId,
  compact = false,
}: {
  applicationId: string;
  stageInstanceId: string;
  compact?: boolean;
}) {
  const permissions = useAssessmentPermissions();
  const query = useGetApplicationAssessmentQuery(
    { applicationId, stageInstanceId },
    { skip: !permissions.view }
  );
  const assessment = query.currentData;
  if (!permissions.view)
    return <Alert severity="info">Assessment access is required to view these results.</Alert>;
  if (query.isLoading) return <Skeleton variant="rounded" height={100} />;
  if (query.isError || !assessment) return <AdmissionQueryError onRetry={query.refetch} />;
  return assessment.attempts.length ? (
    compact ? (
      <Stack spacing={1.5}>
        {[...assessment.attempts]
          .sort((a, b) => b.attemptNumber - a.attemptNumber)
          .map((attempt) => (
            <AssessmentAttemptCard
              key={attempt.id}
              assessment={assessment}
              attempt={attempt}
              readOnly
            />
          ))}
      </Stack>
    ) : (
      <AssessmentAttemptHistory attempts={assessment.attempts} />
    )
  ) : (
    <Alert severity="info">No assessment attempts were recorded for this step.</Alert>
  );
}
