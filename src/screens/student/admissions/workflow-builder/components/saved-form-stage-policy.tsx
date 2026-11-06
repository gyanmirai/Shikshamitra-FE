import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { Typography } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import { readAdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { SavedStageFacts } from './saved-stage-facts';

const enabled = (value: boolean) => (value ? 'Enabled' : 'Disabled');
export function SavedFormStagePolicy({
  stage,
  forms,
}: {
  stage: AdmissionWorkflowStage;
  forms: AdmissionForm[];
}) {
  const configuration = readStageConfiguration(stage.configurationJson) ?? {};

  const form = forms.find((item) => item.id === configuration.formDefinitionId);
  const policy = readAdmissionFormStagePolicy(stage.configurationJson);
  return (
    <FormSectionCard
      title="Form Completion"
      icon={GlobalIcons.documentIcon}
      descriptionTooltip="Saved form version and completion settings; viewing does not normalize or change the published configuration."
    >
      <SavedStageFacts
        items={[
          [
            'Published form version',
            form
              ? `${form.name} · v${form.version}`
              : configuration.formDefinitionId
                ? 'Saved form version unavailable'
                : 'No saved form version',
          ],
          ...(policy
            ? ([
                ['Responsibility', policy.responsibility],
                ['Save and resume', enabled(policy.allowSaveAndResume)],
                ['Due in days', policy.dueInDays],
                ['Late submission', enabled(policy.allowLateSubmission)],
                ['Advance after submit', enabled(policy.autoAdvanceOnSubmit)],
                ['Correction requests', enabled(policy.allowCorrectionRequests)],
                ['Submission attempts', policy.maxSubmissionAttempts],
                ['Section verification', enabled(policy.requireSectionVerification)],
                ['Verification sections', policy.verificationSectionCodes.join(', ') || 'None'],
              ] as [string, string | number | null][])
            : []),
        ]}
      />
      {!policy && configuration.form !== undefined && (
        <Typography role="alert" variant="body2">
          Saved form completion settings are unsupported or incomplete.
        </Typography>
      )}
    </FormSectionCard>
  );
}
