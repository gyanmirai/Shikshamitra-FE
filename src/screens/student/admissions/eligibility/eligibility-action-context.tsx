import type { EligibilitySummary } from 'src/redux/student/admissions/admission-eligibility-types';

import { fDateTime } from 'src/utils/format-time';
import { Stack, Typography } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';

import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';

export function EligibilityActionContext({
  summary,
  exceptionId,
}: {
  summary: EligibilitySummary;
  exceptionId?: string;
}) {
  const evaluation = summary.latestEvaluation;
  const exception = evaluation?.exceptions.find((item) => item.id === exceptionId);
  return (
    <Stack spacing={1}>
      {evaluation && (
        <Typography variant="body2">
          For Check {evaluation.sequenceNumber}, Recorded {fDateTime(evaluation.evaluatedAt, ADMISSION_DATE_TIME_FORMAT)}.
        </Typography>
      )}
      {exception && (
        <StudentFeedback
          notificationKey="STU-0324"
          presentation="inline"
          severity="info"
          sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
        >
          Request reason: {exception.reason}
        </StudentFeedback>
      )}
      {summary.policy?.requireIndependentReviewer && (
        <Typography variant="caption" color="text.secondary">
          A different authorized reviewer must decide the exception.
        </Typography>
      )}
      {summary.policy?.exceptionApprovalRole && (
        <Typography variant="caption" color="text.secondary">
          Approval Role: {summary.policy.exceptionApprovalRole}
        </Typography>
      )}
    </Stack>
  );
}
