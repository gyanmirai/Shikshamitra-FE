import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import { Alert, Button, Skeleton } from '@mui/material';
import { useGetAssessmentSessionsQuery } from 'src/redux/student/admissions/admission-assessment-sessions-api';

import {
  getAssessmentSchedulingUrl,
  getAvailableAssessmentSessions,
} from './assessment-session-availability';

export function AssessmentSchedulingGuidance({
  admissionOfferingId,
  workflowStageDefinitionId,
  canView,
  canManageSessions,
  disabled,
  onOpenAssessments,
}: {
  admissionOfferingId: string;
  workflowStageDefinitionId: string;
  canView: boolean;
  canManageSessions: boolean;
  disabled: boolean;
  onOpenAssessments?: (url: string) => void;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const scope = { admissionOfferingId, workflowStageDefinitionId };
  // The booking field uses the same RTK Query arguments and shares this cache entry.
  const sessions = useGetAssessmentSessionsQuery(scope, { skip: !canView });
  if (!canView) return null;
  if (sessions.isLoading || (!sessions.currentData && sessions.isFetching))
    return <Skeleton variant="rounded" height={48} aria-label="Checking assessment slots" />;
  if (sessions.isError || !sessions.currentData)
    return (
      <Alert
        severity="error"
        action={
          <Button
            size="small"
            color="inherit"
            disabled={disabled || sessions.isFetching}
            onClick={sessions.refetch}
          >
            Retry
          </Button>
        }
      >
        Assessment slots could not be loaded. Retry before booking the entrance exam.
      </Alert>
    );
  const available = getAvailableAssessmentSessions(sessions.currentData);
  if (available.length)
    return (
      <Alert severity="info">
        This applicant has no assessment slot booked. Book an available slot before starting the
        entrance exam.
      </Alert>
    );
  const href = getAssessmentSchedulingUrl(scope, new URLSearchParams(params.toString()));
  return (
    <Alert
      severity="warning"
      action={
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          disabled={disabled || sessions.isFetching}
          endIcon={<Iconify icon="mdi:arrow-top-right" width={16} />}
          onClick={() => (onOpenAssessments ? onOpenAssessments(href) : router.push(href))}
        >
          Go to Assessments
        </Button>
      }
    >
      {sessions.currentData.length
        ? 'No assessment slots are available for this stage. '
        : 'No assessment slot has been created for this stage. '}
      {canManageSessions
        ? 'Create an assessment slot in Assessments, then book it for this applicant before starting the entrance exam.'
        : 'Ask an admissions administrator to create an available slot, then book it for this applicant before starting the entrance exam.'}
    </Alert>
  );
}
