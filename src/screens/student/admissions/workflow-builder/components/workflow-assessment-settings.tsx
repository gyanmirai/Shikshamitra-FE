import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';

import { Stack } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  DEFAULT_ASSESSMENT_POLICY,
  readAdmissionAssessmentPolicy,
  writeAdmissionAssessmentPolicy,
  getAssessmentConfigurationError,
} from 'src/redux/student/admissions/admission-assessment-policy';

import { WorkflowAssessmentOptions } from './workflow-assessment-options';
import { WorkflowAssessmentProfiles } from './workflow-assessment-profiles';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  available: boolean;
  readOnly: boolean;
};

export function WorkflowAssessmentSettings({ formik, available, readOnly }: Props) {
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
    <Stack spacing={2}>
      <FormSectionCard
        icon="mdi:clipboard-text-outline"
        title="Assessment Setup"
        descriptionTooltip={
          enabled
            ? `Staff Must Record an Outcome.${policy.schedulingEnabled ? ' Book an exam session first in Assessments.' : ' No exam session or booking is required.'}${policy.attendanceRequired ? ' Record attendance.' : ''}${policy.scoringEnabled ? ' Enter marks unless the applicant is absent.' : ''} Failed, Absent and Retake Outcomes Cannot Use the Usual Next Step. Staff Can Arrange an Allowed Retake or End the Journey as Withdrawn. Authorized Staff Can Waive the Assessment with a Reason.`
            : 'Staff Complete This Stage Using the Existing Workflow Controls. Choose a Result or Exam Process to Use Separate Assessment Records.'
        }
      >
        <Stack spacing={2}>
          {!available && (
            <StudentFeedback notificationKey="STU-0537" presentation="inline" severity="info">
              Assessment scheduling and records are not available in this environment yet.
            </StudentFeedback>
          )}
          {unreadable && (
            <StudentFeedback notificationKey="STU-0538" presentation="persistent" severity="error">
              {invalid}
            </StudentFeedback>
          )}
          {enabled && (
            <>
              <WorkflowAssessmentOptions policy={policy} onChange={update} readOnly={disabled} />
              {invalid && formik.submitCount > 0 && (
                <StudentFeedback
                  notificationKey="STU-0538"
                  presentation="persistent"
                  severity="error"
                >
                  {invalid}
                </StudentFeedback>
              )}
            </>
          )}
        </Stack>
      </FormSectionCard>
      {enabled &&
        policy.version === 2 &&
        policy.scoringEnabled &&
        policy.scoringMode === 'subjects' && (
          <WorkflowAssessmentProfiles
            policy={policy}
            disabled={disabled}
            showErrors={formik.submitCount > 0}
            onChange={update}
          />
        )}
    </Stack>
  );
}
