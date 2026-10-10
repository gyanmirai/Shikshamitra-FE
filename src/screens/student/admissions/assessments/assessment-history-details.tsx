import { Alert, Skeleton } from '@mui/material';
import { useGetApplicationAssessmentQuery } from 'src/redux/student/admissions/admission-assessments-api';

import { AdmissionQueryError } from '../admission-query-error';
import { AssessmentAttemptTable } from './assessment-attempt-table';
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
  if (!permissions.view)
    return <Alert severity="info">Assessment access is required to view these results.</Alert>;
  if (query.isLoading) return <Skeleton variant="rounded" height={100} />;
  if (query.isError || !query.currentData) return <AdmissionQueryError onRetry={query.refetch} />;
  return query.currentData.attempts.length ? (
    compact ? (
      <AssessmentAttemptTable assessment={query.currentData} readOnly />
    ) : (
      <AssessmentAttemptHistory attempts={query.currentData.attempts} />
    )
  ) : (
    <Alert severity="info">No assessment attempts were recorded for this step.</Alert>
  );
}
