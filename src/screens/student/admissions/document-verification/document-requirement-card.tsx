import type { AdmissionDocumentRequirement } from 'src/redux/student/admissions/admission-document-types';

import { useId } from 'react';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { StudentFeedback } from 'src/components/student-feedback';
import { Paper, Stack, Button, Collapse, Typography } from '@mui/material';

import { DocumentStatusLabel } from './document-status';
import { DocumentDownloadButton } from './document-download-button';
import { DocumentEvidenceHistory } from './document-evidence-history';
import { DocumentRequirementActions } from './document-requirement-actions';

import type { DocumentAction } from './document-action-model';
import type { useDocumentPermissions } from './use-document-permissions';

const collectionLabels = {
  upload: 'Upload a copy',
  original: 'Check the physical original',
  either: 'Upload a copy or check the physical original',
  both: 'Upload a copy and check the physical original',
};
export function DocumentRequirementCard({
  requirement,
  permissions,
  disabled,
  readOnly,
  onAction,
}: {
  requirement: AdmissionDocumentRequirement;
  permissions: ReturnType<typeof useDocumentPermissions>;
  disabled: boolean;
  readOnly: boolean;
  onAction: (action: DocumentAction) => void;
}) {
  const history = useBoolean();
  const historyId = useId();
  const latest = requirement.evidence.at(-1);
  const review = latest?.reviews.at(-1);
  return (
    <Paper variant="outlined" sx={{ p: 2, minWidth: 0 }}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          gap={1}
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
        >
          <Stack spacing={0.25}>
            <Typography variant="subtitle1">{requirement.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {requirement.status === 'notRequired'
                ? 'Not applicable to this applicant'
                : requirement.requirement === 'conditional'
                  ? `Conditional · ${requirement.isRequired ? 'Required for this applicant' : 'Based on applicant details'}`
                  : requirement.isRequired
                    ? 'Required'
                    : 'Optional'}
              {' · '}
              {collectionLabels[requirement.collectionMode]}
            </Typography>
          </Stack>
          <DocumentStatusLabel status={requirement.status} />
        </Stack>
        {requirement.description && (
          <Typography variant="body2" color="text.secondary">
            {requirement.description}
          </Typography>
        )}
        {requirement.blockers.map((blocker) => (
          <Typography key={blocker} variant="body2" color="text.secondary">
            {blocker}
          </Typography>
        ))}
        {latest && (
          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {latest.fileName ||
                (latest.kind === 'waiver' ? 'Requirement waived' : 'Physical original recorded')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Version {latest.versionNumber} · Recorded {fDateTime(latest.submittedAt)}
            </Typography>
            {latest.originalSeen && (
              <Typography variant="body2">
                Original sighted
                {latest.originalSeenAt ? ` · ${fDateTime(latest.originalSeenAt)}` : ''}
              </Typography>
            )}
            {latest.kind === 'waiver' && latest.notes && (
              <Typography variant="body2">{latest.notes}</Typography>
            )}
            {review?.decision === 'rejected' && review.reason && (
              <StudentFeedback
                notificationKey="STU-0318"
                presentation="persistent"
                severity="warning"
              >
                {review.reason}
              </StudentFeedback>
            )}
            <Stack direction="row" gap={1} flexWrap="wrap">
              {latest.canDownload && latest.fileName && permissions.download && (
                <DocumentDownloadButton evidenceId={latest.id} fileName={latest.fileName} />
              )}
              <Button
                size="small"
                aria-expanded={history.value}
                aria-controls={historyId}
                onClick={history.onToggle}
              >
                {history.value ? 'Hide history' : `View history (${requirement.evidence.length})`}
              </Button>
            </Stack>
          </Stack>
        )}
        {!readOnly && (
          <DocumentRequirementActions
            requirement={requirement}
            permissions={permissions}
            disabled={disabled}
            onAction={onAction}
          />
        )}
        <Collapse in={history.value} unmountOnExit id={historyId}>
          <DocumentEvidenceHistory
            evidence={requirement.evidence}
            allowDownload={permissions.download}
          />
        </Collapse>
      </Stack>
    </Paper>
  );
}
