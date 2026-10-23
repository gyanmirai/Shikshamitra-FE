import type {
  AdmissionWorkflow,
  AdmissionWorkflowGovernanceHistory,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { Card, Stack, Typography } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';

import { WORKFLOW_STATUS_LABELS } from '../workflow-builder-types';

const ACTION_LABELS = [
  'Created',
  'Validated',
  'Submitted',
  'Approved',
  'Changes requested',
  'Scheduled',
  'Published',
  'Superseded',
  'Archived',
  'Rollback draft created',
  'Reopened',
] as const;

export function WorkflowGovernanceHistory({
  workflow,
  history,
  loading,
}: {
  workflow: AdmissionWorkflow;
  history?: AdmissionWorkflowGovernanceHistory[];
  loading: boolean;
}) {
  const ownerName = history?.find(
    (item) => item.actorUserId && item.actorUserId === workflow.ownerUserId
  )?.actorName;

  return (
    <Stack spacing={1.5}>
      <StudentFeedback
        notificationKey="STU-0558"
        presentation="inline"
        severity="info"
        icon={false}
      >
        Owner: {ownerName || (workflow.ownerUserId ? 'Assigned user' : 'Legacy version')} · Change
        reason: {workflow.changeReason || 'Not recorded'}
      </StudentFeedback>
      {workflow.scheduledPublishAt && (
        <StudentFeedback notificationKey="STU-0559" presentation="inline" severity="warning">
          Publication is scheduled for {fDateTime(workflow.scheduledPublishAt)}.
        </StudentFeedback>
      )}
      {loading && (
        <StudentFeedback notificationKey="STU-0560" presentation="inline" severity="info">
          Loading governance history…
        </StudentFeedback>
      )}
      {!loading && !history?.length && (
        <StudentFeedback notificationKey="STU-0561" presentation="inline" severity="info">
          No governance events have been recorded for this version.
        </StudentFeedback>
      )}
      {history?.map((item) => (
        <Card key={item.id} variant="outlined" sx={{ p: 1.5 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <Typography fontWeight={600}>{ACTION_LABELS[item.action]}</Typography>
              <Typography variant="body2" color="text.secondary">
                {item.actorName || 'System'} · {fDateTime(item.occurredAt)}
              </Typography>
              {item.assignedApproverName && (
                <Typography variant="body2">Approver: {item.assignedApproverName}</Typography>
              )}
              {item.reason && <Typography variant="body2">{item.reason}</Typography>}
              {item.effectiveAt && (
                <Typography variant="caption" color="text.secondary">
                  Effective {fDateTime(item.effectiveAt)}
                </Typography>
              )}
            </Stack>
            <Label color="default">{WORKFLOW_STATUS_LABELS[item.toStatus]}</Label>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
