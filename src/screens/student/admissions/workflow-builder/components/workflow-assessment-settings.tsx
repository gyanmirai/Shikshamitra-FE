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
import { useAssessmentFieldValidation } from '../hooks/use-assessment-field-validation';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  available: boolean;
  readOnly: boolean;
};

export function WorkflowAssessmentSettings({ formik, available, readOnly }: Props) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionAssessmentPolicy(json);
  const profiles = policy?.classProfiles ?? [];
  const interactionValidation = useAssessmentFieldValidation(formik.submitCount, [
    'profiles',
    'maxAttempts',
    'totalMarks',
    'passingMarks',
    ...profiles.flatMap((profile) => [
      ...['profile', 'boardId', 'mediumId', 'standardIds', 'subjects', 'passingMarks'].map(
        (field) => `${profile.id}:${field}`
      ),
      ...profile.subjects.flatMap((subject) =>
        ['name', 'totalMarks', 'passingMarks'].map(
          (field) => `${profile.id}:${subject.code}:${field}`
        )
      ),
    ]),
  ]);
  const validation = {
    showError: interactionValidation.showError,
    onBlur: (key: string) => {
      formik.setFieldTouched('configurationJson', true, false);
      interactionValidation.onBlur(key);
    },
  };
  const enabled = policy?.enabled === true;
  const invalid = getAssessmentConfigurationError(json);
  const subjectProfiles =
    enabled && policy.version === 2 && policy.scoringEnabled && policy.scoringMode === 'subjects';
  const optionError =
    policy &&
    (!Number.isInteger(policy.maxAttempts) ||
      policy.maxAttempts < 1 ||
      policy.maxAttempts > 10 ||
      (policy.scoringEnabled &&
        !subjectProfiles &&
        (policy.totalMarks <= 0 ||
          policy.totalMarks > 10000 ||
          policy.passingMarks < 0 ||
          policy.passingMarks > policy.totalMarks)));
  const configurationError = Boolean(
    invalid &&
    ((json?.length ?? 0) > 64000 ||
      new Set(profiles.map((profile) => profile.id.toLowerCase())).size !== profiles.length ||
      (!subjectProfiles && !optionError))
  );
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
            <StudentFeedback notificationKey="STU-0538" presentation="inline" severity="error">
              {invalid}
            </StudentFeedback>
          )}
          {enabled && (
            <>
              <WorkflowAssessmentOptions
                policy={policy}
                onChange={update}
                readOnly={disabled}
                validation={validation}
              />
              {configurationError && formik.submitCount > 0 && (
                <StudentFeedback notificationKey="STU-0538" presentation="inline" severity="error">
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
            validation={validation}
            onChange={update}
          />
        )}
    </Stack>
  );
}
