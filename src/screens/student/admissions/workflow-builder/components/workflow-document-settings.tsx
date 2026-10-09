import type { FormikProps } from 'formik';
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

import { DocumentRequirementsList } from './document-requirements-list';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  available: boolean;
  readOnly: boolean;
};
export function WorkflowDocumentSettings({ formik, available, readOnly }: Props) {
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
        descriptionTooltip="Upload documents and accept required items before continuing. Rejected documents need replacement and fresh verification. Student document categories link accepted uploads to Student Records."
      >
        <Stack spacing={2}>
          {!available && (
            <Alert severity="info">
              Document checklists and review are not available in this environment yet.
            </Alert>
          )}
          {unreadable && <Alert severity="error">{invalid}</Alert>}
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
                documentTypes={documentTypes}
                onChange={(requirements) => update({ requirements })}
              />
              {invalid && <Alert severity="error">{invalid}</Alert>}
            </>
          )}
        </Stack>
      </FormSectionCard>
    </Stack>
  );
}
