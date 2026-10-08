import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { Alert, Stack, Button } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { useGetAdmissionDocumentTypesQuery } from 'src/redux/student/admissions/admission-document-settings-api';
import { getDocumentConfigurationError } from 'src/redux/student/admissions/admission-document-policy-validation';
import {
  DEFAULT_DOCUMENT_POLICY,
  readAdmissionDocumentPolicy,
  writeAdmissionDocumentPolicy,
} from 'src/redux/student/admissions/admission-document-policy';

import { WorkflowProcessChoice } from './workflow-process-choice';
import { DocumentReviewOptions } from './document-review-options';
import { DocumentRequirementsList } from './document-requirements-list';
import { DocumentCollectionSettings } from './document-collection-settings';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  available: boolean;
  readOnly: boolean;
  forms: AdmissionForm[];
  stages?: AdmissionWorkflowStage[];
};
export function WorkflowDocumentSettings({
  formik,
  available,
  readOnly,
  forms,
  stages = [],
}: Props) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionDocumentPolicy(json);
  const invalid = getDocumentConfigurationError(json);
  const unreadable = Boolean(invalid && !policy);
  const disabled = readOnly || !available || unreadable;
  const {
    data: documentTypes = [],
    isError,
    refetch,
  } = useGetAdmissionDocumentTypesQuery(undefined, { skip: !available || !policy?.enabled });
  const update = (change: Partial<AdmissionDocumentPolicy>) =>
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionDocumentPolicy(json, { ...(policy ?? DEFAULT_DOCUMENT_POLICY), ...change })
    );
  return (
    <Stack spacing={2}>
      <FormSectionCard
        icon="mdi:file-document-check-outline"
        title="Document checklist"
        descriptionTooltip="Collect evidence, review documents and resolve required items before continuing. Replacement documents require fresh review. Missing answers for conditional requirements must be resolved."
      >
        <Stack spacing={2}>
          {!available && (
            <Alert severity="info">
              Document checklists and review are not available in this environment yet.
            </Alert>
          )}
          {unreadable && <Alert severity="error">{invalid}</Alert>}
          <WorkflowProcessChoice
            label="Document verification process"
            value={policy?.enabled ? 'managed' : 'basic'}
            disabled={disabled}
            onChange={(value) => update({ enabled: value === 'managed' })}
            options={[
              {
                value: 'basic',
                title: 'Complete manually',
                description: 'Staff complete the stage using the existing workflow controls.',
                icon: 'mdi:check-circle-outline',
              },
              {
                value: 'managed',
                title: 'Collect and verify documents',
                description:
                  'Applicants receive a checklist. Staff review evidence, request replacements and resolve required documents.',
                icon: 'mdi:file-document-check-outline',
              },
            ]}
          />
          {policy?.enabled && (
            <>
              {isError && (
                <Alert
                  severity="warning"
                  action={
                    <Button size="small" onClick={() => refetch()}>
                      Retry
                    </Button>
                  }
                >
                  Student document categories could not load. You can configure admission evidence
                  and retry linking a category.
                </Alert>
              )}
              <DocumentRequirementsList
                requirements={policy.requirements}
                readOnly={disabled}
                forms={forms}
                documentTypes={documentTypes}
                onChange={(requirements) => update({ requirements })}
              />
              {invalid && <Alert severity="error">{invalid}</Alert>}
            </>
          )}
        </Stack>
      </FormSectionCard>
      {policy?.enabled && (
        <>
          <DocumentCollectionSettings
            policy={policy}
            stages={stages}
            disabled={disabled}
            onChange={update}
          />
          <DocumentReviewOptions policy={policy} disabled={disabled} onChange={update} />
        </>
      )}
    </Stack>
  );
}
