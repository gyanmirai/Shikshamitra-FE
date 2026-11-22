import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { getAdmissionFormStageConfigurationError } from 'src/redux/student/admissions/admission-form-stage-policy';

type Props = {
  configurationJson?: string;
  forms: AdmissionForm[];
  formDefinitionId: string;
  available: boolean;
};

export function WorkflowFormSettings({
  configurationJson,
  forms,
  formDefinitionId,
  available,
}: Props) {
  const error = getAdmissionFormStageConfigurationError(configurationJson, forms);
  if (available && formDefinitionId && !error) return null;

  return (
    <FormSectionCard
      title="Form Completion"
      aria-label="Form Completion"
      icon="mdi:file-check-outline"
    >
      {!available && (
        <StudentFeedback notificationKey="STU-0553" presentation="inline" severity="info">
          Managed Form settings are not available in this environment yet.
        </StudentFeedback>
      )}

      {!formDefinitionId ? (
        <StudentFeedback notificationKey="STU-0554" presentation="inline" severity="warning">
          Choose a published form in Stage details to finish setup.
        </StudentFeedback>
      ) : (
        error && (
          <StudentFeedback notificationKey="STU-0555" presentation="persistent" severity="error">
            {error}
          </StudentFeedback>
        )
      )}
    </FormSectionCard>
  );
}
