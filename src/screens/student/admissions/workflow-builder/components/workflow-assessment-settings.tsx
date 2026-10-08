import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';

import { Alert, Stack } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  DEFAULT_ASSESSMENT_POLICY,
  readAdmissionAssessmentPolicy,
  writeAdmissionAssessmentPolicy,
  getAssessmentConfigurationError,
} from 'src/redux/student/admissions/admission-assessment-policy';

import { WorkflowProcessChoice } from './workflow-process-choice';
import { WorkflowAssessmentOptions } from './workflow-assessment-options';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  available: boolean;
  readOnly: boolean;
};

export function WorkflowAssessmentSettings({ formik, available, readOnly }: Props) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionAssessmentPolicy(json);
  const enabled = policy?.enabled === true;
  const mode = enabled ? (policy.schedulingEnabled ? 'scheduled' : 'result') : 'legacy';
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
          ? `Staff must record an outcome.${policy.schedulingEnabled ? ' Book an exam session first in Assessments.' : ' No exam session or booking is required.'}${policy.attendanceRequired ? ' Record attendance.' : ''}${policy.scoringEnabled ? ' Enter marks unless the applicant is absent.' : ''}${policy.reviewRequired ? ' Another staff member must approve the result.' : ''} Failed, absent and retake outcomes need an explicit next step. Authorized staff can waive the assessment with a reason.`
          : 'Staff complete this stage using the existing workflow controls. Choose a result or exam process to use separate assessment records.'
      }
    >
      <Stack spacing={2}>
        {!available && (
          <Alert severity="info">
            Assessment scheduling and records are not available in this environment yet.
          </Alert>
        )}
        {unreadable && <Alert severity="error">{invalid}</Alert>}
        <WorkflowProcessChoice
          label="Assessment process"
          value={mode}
          disabled={disabled}
          onChange={(value) =>
            update({ enabled: value !== 'legacy', schedulingEnabled: value === 'scheduled' })
          }
          options={[
            {
              value: 'legacy',
              title: 'Complete manually',
              description: 'Staff complete this stage using the existing workflow controls.',
              icon: 'mdi:check-circle-outline',
            },
            {
              value: 'result',
              title: 'Record an assessment result',
              description: 'Staff record a result directly without exam sessions or bookings.',
              icon: 'mdi:clipboard-text-outline',
            },
            {
              value: 'scheduled',
              title: 'Schedule an entrance exam',
              description:
                'Staff create exam sessions in Assessments and book applicants before recording their results.',
              icon: 'mdi:calendar-check-outline',
            },
          ]}
        />
        {enabled && (
          <>
            <WorkflowAssessmentOptions policy={policy} onChange={update} readOnly={disabled} />
            {invalid && <Alert severity="error">{invalid}</Alert>}
          </>
        )}
      </Stack>
    </FormSectionCard>
  );
}
