import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { Button, Skeleton } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { StudentFeedback } from 'src/components/student-feedback';
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
    return <Skeleton variant="rounded" height={48} aria-label="Checking Assessment Slots" />;
  if (sessions.isError || !sessions.currentData)
    return (
      <StudentFeedback
        notificationKey="STU-0268"
        presentation="toast"
        severity="error"
        toastAction={
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
      </StudentFeedback>
    );
  const available = getAvailableAssessmentSessions(sessions.currentData);
  if (available.length)
    return (
      <StudentFeedback notificationKey="STU-0269" presentation="inline" severity="info">
        This applicant has no assessment slot booked. Book an available slot before starting the
        entrance exam.
      </StudentFeedback>
    );
  const href = getAssessmentSchedulingUrl(scope, new URLSearchParams(params.toString()));
  return (
    <StudentFeedback
      notificationKey="STU-0270"
      presentation="persistent"
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
        ? 'No Assessment Slots Are Available for This Stage. '
        : 'No Assessment Slot Has Been Created for This Stage. '}
      {canManageSessions
        ? 'Create an Assessment Slot in Assessments, Then Book It for This Applicant Before Starting the Entrance Exam.'
        : 'Ask an Admissions Administrator to Create an Available Slot, Then Book It for This Applicant Before Starting the Entrance Exam.'}
    </StudentFeedback>
  );
}
