import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { useState } from 'react';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, Typography, LinearProgress } from '@mui/material';

import { DocumentRequirementCard } from './document-requirement-card';
import { DocumentRequirementTable } from './document-requirement-table';

import type { DocumentAction } from './document-action-model';
import type { useDocumentPermissions } from './use-document-permissions';

export function DocumentChecklistContent({
  summary,
  permissions,
  disabled,
  readOnly,
  onAction,
  onView,
  layout = 'cards',
}: {
  summary: ApplicationDocumentVerification;
  permissions: ReturnType<typeof useDocumentPermissions>;
  disabled: boolean;
  readOnly: boolean;
  onAction: (action: DocumentAction, requirement: AdmissionDocumentRequirement) => void;
  onView?: (requirement: AdmissionDocumentRequirement) => void;
  layout?: 'cards' | 'table';
}) {
  const [showNotApplicable, setShowNotApplicable] = useState(false);
  const notApplicable = summary.requirements.filter((item) => item.status === 'notRequired');
  const visible = summary.requirements.filter(
    (item) => item.status !== 'notRequired' || showNotApplicable
  );
  const required = summary.requirements.filter((item) => item.isRequired);
  const complete = required.filter(
    (item) => item.status === 'accepted' || item.status === 'waived'
  ).length;
  return (
    <Stack spacing={2} sx={layout === 'table' ? { flex: 1, minWidth: 0, minHeight: 0 } : undefined}>
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
      {layout !== 'table' && !readOnly && summary.blockers.length > 0 && (
        <StudentFeedback notificationKey="STU-0312" presentation="inline" severity="info">
          <Stack spacing={0.5}>
            {summary.blockers.map((blocker) => (
              <Typography key={blocker} variant="body2">
                {blocker}
              </Typography>
            ))}
            {summary.canComplete && (
              <Typography variant="body2">
                Your workflow allows continuation. Complete these pending documents in Student
                Onboarding before activation.
              </Typography>
            )}
          </Stack>
        </StudentFeedback>
      )}
      {layout !== 'table' && !readOnly && summary.canComplete && summary.blockers.length === 0 && (
        <StudentFeedback notificationKey="STU-0313" presentation="inline" severity="success">
          Document requirements are complete. Continue to the next workflow step.
        </StudentFeedback>
      )}
      {summary.policy?.requireIndependentReview && (
        <Typography variant="body2" color="text.secondary">
          A different authorized reviewer must check evidence collected by staff.
        </Typography>
      )}
      {summary.requirements.length === 0 ? (
        <StudentFeedback notificationKey="STU-0314" presentation="inline" severity="info">
          No document requirements are configured for this step.
        </StudentFeedback>
      ) : layout === 'table' ? (
        <DocumentRequirementTable
          summary={summary}
          requirements={visible}
          permissions={permissions}
          onView={onView}
        />
      ) : (
        visible.map((requirement) => (
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
      {notApplicable.length > 0 && (
        <Button
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          aria-expanded={showNotApplicable}
          onClick={() => setShowNotApplicable((value) => !value)}
        >
          {showNotApplicable ? 'Hide' : 'Show'} documents not applicable to this applicant (
          {notApplicable.length})
        </Button>
      )}
    </Stack>
  );
}
