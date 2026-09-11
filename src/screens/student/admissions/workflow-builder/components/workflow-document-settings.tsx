import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { useGetAdmissionDocumentTypesQuery } from 'src/redux/student/admissions/admission-document-settings-api';
import { getDocumentConfigurationError } from 'src/redux/student/admissions/admission-document-policy-validation';
import {
  Alert,
  Paper,
  Radio,
  Stack,
  Button,
  RadioGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  DEFAULT_DOCUMENT_POLICY,
  readAdmissionDocumentPolicy,
  writeAdmissionDocumentPolicy,
} from 'src/redux/student/admissions/admission-document-policy';

import { DocumentReviewOptions } from './document-review-options';
import { DocumentRequirementsList } from './document-requirements-list';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  available: boolean;
  readOnly: boolean;
  forms: AdmissionForm[];
};
export function WorkflowDocumentSettings({ formik, available, readOnly, forms }: Props) {
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
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">Document verification setup</Typography>
          <Typography variant="body2" color="text.secondary">
            Decide what applicants provide and what staff must check before this stage can finish.
          </Typography>
        </Stack>
        {!available && (
          <Alert severity="info">
            Document checklists and review are not available in this environment yet.
          </Alert>
        )}
        {unreadable && <Alert severity="error">{invalid}</Alert>}
        <RadioGroup
          aria-label="Document verification process"
          value={policy?.enabled ? 'managed' : 'basic'}
          onChange={(_, value) => update({ enabled: value === 'managed' })}
        >
          <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
            <FormControlLabel
              value="basic"
              disabled={disabled}
              control={<Radio size="small" />}
              label="Basic completion (existing process)"
            />
            <Typography variant="body2" color="text.secondary">
              Staff complete the stage using the existing workflow controls.
            </Typography>
          </Paper>
          <Paper
            variant="outlined"
            sx={{ p: 1, borderColor: policy?.enabled ? 'primary.main' : 'divider' }}
          >
            <FormControlLabel
              value="managed"
              disabled={disabled}
              control={<Radio size="small" />}
              label="Collect and verify documents"
            />
            <Typography variant="body2" color="text.secondary">
              Applicants get a checklist. Staff review evidence, request replacements, and resolve
              required documents.
            </Typography>
          </Paper>
        </RadioGroup>
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
                Student document categories could not load. You can configure admission evidence and
                retry linking a category.
              </Alert>
            )}
            <DocumentRequirementsList
              requirements={policy.requirements}
              readOnly={disabled}
              forms={forms}
              documentTypes={documentTypes}
              onChange={(requirements) => update({ requirements })}
            />
            <DocumentReviewOptions policy={policy} disabled={disabled} onChange={update} />
            <Alert severity="info">
              Collect evidence → Review documents → Resolve required items → Continue admission.
              Replacements require fresh review. Missing answers for a conditional requirement must
              be resolved before continuing.
            </Alert>
            {invalid && <Alert severity="error">{invalid}</Alert>}
          </>
        )}
      </Stack>
    </Paper>
  );
}
