import type { EligibilitySummary } from 'src/redux/student/admissions/admission-eligibility-types';

import { Stack, Button, Typography } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';

import { EligibilityHistory } from './eligibility-history';
import { EligibilityStatusLabel } from './eligibility-status';
import { EligibilityExceptions } from './eligibility-exceptions';
import { EligibilityEvaluation } from './eligibility-evaluation';
import { eligibilityActionLabels } from './eligibility-action-model';

import type { EligibilityAction } from './eligibility-action-model';
import type { useEligibilityPermissions } from './use-eligibility-permissions';

export function EligibilityResultContent({
  summary,
  permissions,
  disabled,
  onAction,
}: {
  summary: EligibilitySummary;
  permissions: ReturnType<typeof useEligibilityPermissions>;
  disabled: boolean;
  onAction: (action: EligibilityAction, exceptionId?: string) => void;
}) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
        <EligibilityStatusLabel status={summary.status} stale={summary.isStale} />
        <Typography variant="body2">
          Based on saved applicant information and this workflow version.
        </Typography>
      </Stack>
      {summary.isStale && (
        <StudentFeedback notificationKey="STU-0328" presentation="persistent" severity="warning">
          Applicant information has changed. Run the eligibility check again before continuing.
        </StudentFeedback>
      )}
      {summary.blockers.length > 0 && (
        <StudentFeedback notificationKey="STU-0329" presentation="persistent" severity="info">
          <Stack spacing={0.5}>
            {summary.blockers.map((blocker) => (
              <Typography key={blocker} variant="body2">
                {blocker}
              </Typography>
            ))}
          </Stack>
        </StudentFeedback>
      )}
      {summary.status === 'notChecked' && (
        <Typography variant="body2">
          Run the first check to see each rule and the recorded information used.
        </Typography>
      )}
      {summary.status === 'ineligible' && !summary.isStale && (
        <Typography variant="body2">
          A configured review route or an approved exception may allow the admission to continue.
        </Typography>
      )}
      <Stack direction="row" gap={1} flexWrap="wrap">
        {summary.canEvaluate && permissions.evaluate && (
          <Button variant="contained" disabled={disabled} onClick={() => onAction('evaluate')}>
            {summary.latestEvaluation
              ? 'Check eligibility again'
              : eligibilityActionLabels.evaluate}
          </Button>
        )}
        {summary.canRequestException && permissions.requestException && (
          <Button
            variant="outlined"
            disabled={disabled}
            onClick={() => onAction('requestException')}
          >
            {eligibilityActionLabels.requestException}
          </Button>
        )}
      </Stack>
      {summary.latestEvaluation && (
        <>
          <EligibilityEvaluation evaluation={summary.latestEvaluation} />
          <EligibilityExceptions
            exceptions={summary.latestEvaluation.exceptions}
            canReview={summary.canReviewException && permissions.reviewException}
            disabled={disabled}
            onReview={(id, approved) =>
              onAction(approved ? 'approveException' : 'rejectException', id)
            }
          />
        </>
      )}
      <EligibilityHistory
        stageKey={{ applicationId: summary.applicationId, stageId: summary.stageId }}
        latestEvaluationId={summary.latestEvaluation?.id}
      />
    </Stack>
  );
}
