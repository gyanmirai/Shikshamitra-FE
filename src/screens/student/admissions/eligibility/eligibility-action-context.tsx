import type { EligibilitySummary } from 'src/redux/student/admissions/admission-eligibility-types';

import { fDateTime } from 'src/utils/format-time';
import { Alert, Stack, Typography } from '@mui/material';

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
          For check {evaluation.sequenceNumber}, recorded {fDateTime(evaluation.evaluatedAt)}.
        </Typography>
      )}
      {exception && (
        <Alert severity="info" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          Request reason: {exception.reason}
        </Alert>
      )}
      {summary.policy?.requireIndependentReviewer && (
        <Typography variant="caption" color="text.secondary">
          A different authorized reviewer must decide the exception.
        </Typography>
      )}
      {summary.policy?.exceptionApprovalRole && (
        <Typography variant="caption" color="text.secondary">
          Approval role: {summary.policy.exceptionApprovalRole}
        </Typography>
      )}
    </Stack>
  );
}
