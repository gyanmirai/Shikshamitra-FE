import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { Alert, Stack, Typography, LinearProgress } from '@mui/material';

import { DocumentRequirementCard } from './document-requirement-card';

import type { DocumentAction } from './document-action-model';
import type { useDocumentPermissions } from './use-document-permissions';

export function DocumentChecklistContent({
  summary,
  permissions,
  disabled,
  readOnly,
  onAction,
}: {
  summary: ApplicationDocumentVerification;
  permissions: ReturnType<typeof useDocumentPermissions>;
  disabled: boolean;
  readOnly: boolean;
  onAction: (action: DocumentAction, requirement: AdmissionDocumentRequirement) => void;
}) {
  const required = summary.requirements.filter((item) => item.isRequired);
  const complete = required.filter(
    (item) => item.status === 'accepted' || item.status === 'waived'
  ).length;
  return (
    <Stack spacing={2}>
      {required.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="body2">
            {complete} of {required.length} required documents resolved
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(complete / required.length) * 100}
            aria-label="Required document progress"
          />
        </Stack>
      )}
      {!readOnly && summary.blockers.length > 0 && (
        <Alert severity="info">
          <Stack spacing={0.5}>
            {summary.blockers.map((blocker) => (
              <Typography key={blocker} variant="body2">
                {blocker}
              </Typography>
            ))}
          </Stack>
        </Alert>
      )}
      {!readOnly && summary.canComplete && (
        <Alert severity="success">
          Document requirements are complete. Continue to the next workflow step.
        </Alert>
      )}
      {summary.policy?.requireIndependentReview && (
        <Typography variant="body2" color="text.secondary">
          A different authorized reviewer must check evidence collected by staff.
        </Typography>
      )}
      {summary.requirements.length === 0 ? (
        <Alert severity="info">No document requirements are configured for this step.</Alert>
      ) : (
        summary.requirements.map((requirement) => (
          <DocumentRequirementCard
            key={requirement.code}
            requirement={requirement}
            permissions={permissions}
            disabled={disabled}
            readOnly={readOnly}
            onAction={(action) => onAction(action, requirement)}
          />
        ))
      )}
    </Stack>
  );
}
