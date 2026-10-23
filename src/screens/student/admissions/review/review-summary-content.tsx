import type { ReviewSummary } from 'src/redux/student/admissions/admission-review-types';

import dayjs from 'dayjs';
import { StudentFeedback } from 'src/components/student-feedback';
import { Chip, Link, Stack, Button, Typography } from '@mui/material';

import { ReviewHistory } from './review-history';
import { ReviewEvidence } from './review-evidence';
import { reviewStatusLabels } from './review-model';
import { ReviewRecordDetails } from './review-record-details';
import { useReviewPermissions } from './use-review-permissions';

export type ReviewAction = 'edit' | 'assign' | 'correct';
export function ReviewSummaryContent({
  summary,
  disabled,
  onAction,
}: {
  summary: ReviewSummary;
  disabled: boolean;
  onAction: (action: ReviewAction) => void;
}) {
  const permissions = useReviewPermissions();
  return (
    <Stack spacing={2}>
      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
        <Chip
          size="small"
          color={
            summary.isStale ? 'warning' : summary.status === 'approved' ? 'success' : 'default'
          }
          label={reviewStatusLabels[summary.status]}
        />
        {summary.isOverdue && <Chip size="small" color="warning" label="Overdue" />}
        <Typography variant="body2">
          Reviewer: {summary.assignedReviewerName || 'Unassigned'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {summary.dueAt
            ? `Due ${dayjs(summary.dueAt).format('DD MMM YYYY, h:mm A')}`
            : 'No deadline'}
        </Typography>
      </Stack>
      {summary.isStale && (
        <StudentFeedback notificationKey="STU-0468" presentation="persistent" severity="warning">
          The application or required evidence changed after the last review. Check the updated
          information and submit a fresh recommendation before a decision.
        </StudentFeedback>
      )}
      {summary.status === 'correctionRequested' && (
        <StudentFeedback notificationKey="STU-0469" presentation="inline" severity="info">
          Correct the application form below and resubmit it. Review the corrected details and
          submit a new recommendation here.
        </StudentFeedback>
      )}
      {summary.blockers.map((message) => (
        <StudentFeedback
          notificationKey="STU-0470"
          presentation="persistent"
          severity="info"
          key={message}
        >
          {message}
        </StudentFeedback>
      ))}
      {(summary.policy?.reviewerRole ||
        summary.policy?.approverRole ||
        summary.policy?.requireIndependentApprover) && (
        <Typography variant="body2" color="text.secondary">
          {summary.policy.reviewerRole ? `Reviewer role: ${summary.policy.reviewerRole}. ` : ''}
          {summary.policy.approverRole ? `Decision role: ${summary.policy.approverRole}. ` : ''}
          {summary.policy.requireIndependentApprover
            ? 'The final decision must be made by someone other than the recommending reviewer.'
            : ''}
        </Typography>
      )}
      <ReviewEvidence items={summary.prerequisites} />
      {summary.latestRecord ? (
        <ReviewRecordDetails record={summary.latestRecord} />
      ) : (
        <Typography variant="body2" color="text.secondary">
          No recommendation has been recorded. Start with the review checklist.
        </Typography>
      )}
      <Stack direction="row" gap={1} flexWrap="wrap">
        {((permissions.edit && summary.canSaveDraft) ||
          (permissions.submit && summary.canSubmit)) && (
          <Button variant="contained" disabled={disabled} onClick={() => onAction('edit')}>
            Review and recommend
          </Button>
        )}
        {permissions.assign && summary.canAssign && (
          <Button variant="outlined" disabled={disabled} onClick={() => onAction('assign')}>
            Assign reviewer
          </Button>
        )}
        {permissions.decide && permissions.reopen && summary.canRequestCorrection && (
          <Button variant="outlined" disabled={disabled} onClick={() => onAction('correct')}>
            Request corrections
          </Button>
        )}
      </Stack>
      <Typography variant="body2">
        A recommendation does not approve or reject this application. Use the authorized actions in{' '}
        <Link href="#admission-decision">Admission decision</Link> to record the final decision.
      </Typography>
      <ReviewHistory applicationId={summary.applicationId} stageId={summary.stageId} />
    </Stack>
  );
}
