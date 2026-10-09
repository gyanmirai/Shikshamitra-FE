import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';

import { Alert, Stack } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomAccordion from 'src/components/custom-accordian';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  DEFAULT_ASSESSMENT_POLICY,
  readAdmissionAssessmentPolicy,
  writeAdmissionAssessmentPolicy,
  getAssessmentConfigurationError,
} from 'src/redux/student/admissions/admission-assessment-policy';

import { WorkflowAssessmentOptions } from './workflow-assessment-options';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  available: boolean;
  readOnly: boolean;
};

export function WorkflowAssessmentSettings({ formik, available, readOnly }: Props) {
  const setup = useBoolean(true);
  const json = formik.values.configurationJson;
  const policy = readAdmissionAssessmentPolicy(json);
  const enabled = policy?.enabled === true;
  const invalid = getAssessmentConfigurationError(json);
  const unreadable = Boolean(invalid && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionAssessmentPolicy>) => {
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionAssessmentPolicy(json, {
        ...(policy ?? DEFAULT_ASSESSMENT_POLICY),
        ...change,
      })
    );
  };

  return (
    <FormSectionCard
      icon="mdi:clipboard-text-outline"
      title="Assessment setup"
      descriptionTooltip={
        enabled
          ? `Staff must record an outcome.${policy.schedulingEnabled ? ' Book an exam session first in Assessments.' : ' No exam session or booking is required.'}${policy.attendanceRequired ? ' Record attendance.' : ''}${policy.scoringEnabled ? ' Enter marks unless the applicant is absent.' : ''} Failed, absent and retake outcomes need an explicit next step. Authorized staff can waive the assessment with a reason.`
          : 'Staff complete this stage using the existing workflow controls. Choose a result or exam process to use separate assessment records.'
      }
    >
      <CustomAccordion
        title="Assessment settings"
        expanded={setup.value || Boolean(invalid) || !available}
        onChange={setup.onToggle}
        content={
          <Stack spacing={2}>
            {!available && (
              <Alert severity="info">
                Assessment scheduling and records are not available in this environment yet.
              </Alert>
            )}
            {unreadable && <Alert severity="error">{invalid}</Alert>}
            {enabled && (
              <>
                <WorkflowAssessmentOptions policy={policy} onChange={update} readOnly={disabled} />
                {invalid && <Alert severity="error">{invalid}</Alert>}
              </>
            )}
          </Stack>
        }
      />
    </FormSectionCard>
  );
}
