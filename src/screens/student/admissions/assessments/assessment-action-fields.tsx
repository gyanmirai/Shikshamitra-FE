import type { FormikProps } from 'formik';
import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { Stack, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { AssessmentBookingField } from './assessment-booking-field';
import { latestAssessmentAttempt } from './assessment-action-model';
import { AssessmentSubjectScoreFields } from './assessment-subject-score-fields';
import {
  assessmentResultProfile,
  validateAssessmentSubjectValues,
} from './assessment-subject-results';

import type { AssessmentAction, AssessmentActionValues } from './assessment-action-model';

type Props = {
  action: AssessmentAction;
  assessment: ManagedApplicationAssessment;
  formik: FormikProps<AssessmentActionValues>;
  admissionOfferingId: string;
  workflowStageDefinitionId: string;
  draftValidation?: boolean;
};

export function AssessmentActionFields({
  action,
  assessment,
  formik,
  admissionOfferingId,
  workflowStageDefinitionId,
  draftValidation = false,
}: Props) {
  const { values, touched, errors, isSubmitting } = formik;
  const profile = assessmentResultProfile(assessment, latestAssessmentAttempt(assessment));
  return (
    <Stack spacing={2}>
      {action === 'book' &&
        (assessment.policy.schedulingEnabled ? (
          <AssessmentBookingField
            admissionOfferingId={admissionOfferingId}
            workflowStageDefinitionId={workflowStageDefinitionId}
            value={values.sessionId}
            slotStartsAt={values.slotStartsAt ?? ''}
            onSlotChange={(value) => formik.setFieldValue('slotStartsAt', value)}
            onSlotRequirementChange={(value) => formik.setFieldValue('requiresSlot', value)}
            slotError={touched.slotStartsAt ? errors.slotStartsAt : undefined}
            onChange={(value) => formik.setFieldValue('sessionId', value)}
            error={touched.sessionId ? errors.sessionId : undefined}
            disabled={isSubmitting}
          />
        ) : (
          <StudentFeedback notificationKey="STU-0239" presentation="inline" severity="info">
            Start a new assessment attempt. This stage does not require a scheduled session.
          </StudentFeedback>
        ))}
      {action === 'attendance' && (
        <CustomSelect
          label="Attendance"
          value={values.attendance}
          disabled={isSubmitting}
          onChange={(value) => formik.setFieldValue('attendance', value)}
          options={[
            { value: 'present', label: 'Present' },
            { value: 'absent', label: 'Absent' },
          ]}
        />
      )}
      {action === 'result' &&
        (assessment.policy.scoringMode === 'subjects' && !profile ? (
          <StudentFeedback notificationKey="STU-0240" presentation="persistent" severity="warning">
            The class assessment profile is unavailable. Refresh before recording results.
          </StudentFeedback>
        ) : profile ? (
          <AssessmentSubjectScoreFields
            profile={profile}
            values={values.subjectScores ?? {}}
            errors={
              errors.subjectScores || formik.submitCount > 0
                ? validateAssessmentSubjectValues(profile, values.subjectScores, draftValidation)
                : {}
            }
            disabled={isSubmitting}
            onChange={(code, value) =>
              formik.setFieldValue('subjectScores', { ...values.subjectScores, [code]: value })
            }
          />
        ) : assessment.policy.scoringEnabled ? (
          <NumericFormatCustom
            fullWidth
            required
            size="small"
            prefix=""
            decimalScale={2}
            label={`Marks out of ${assessment.policy.totalMarks}`}
            value={values.marks}
            name="marks"
            disabled={isSubmitting}
            onBlur={formik.handleBlur}
            onValueChange={({ floatValue }) => formik.setFieldValue('marks', floatValue ?? '')}
            error={Boolean(touched.marks && errors.marks)}
            helperText={
              (touched.marks && errors.marks) ||
              `Passing marks: ${assessment.policy.passingMarks}. The result is calculated from these marks.`
            }
          />
        ) : (
          <CustomSelect
            label="Result"
            value={values.outcome}
            disabled={isSubmitting}
            error={Boolean(touched.outcome && errors.outcome)}
            helperText={touched.outcome ? errors.outcome : undefined}
            onChange={(value) => formik.setFieldValue('outcome', value)}
            options={[
              { value: 'passed', label: 'Passed' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
        ))}
      {action === 'retake' && (
        <StudentFeedback notificationKey="STU-0241" presentation="inline" severity="info">
          Allow another attempt within the configured limit of {assessment.policy.maxAttempts}. Book
          the next attempt after saving.
        </StudentFeedback>
      )}
      {action === 'cancel' && (
        <StudentFeedback notificationKey="STU-0242" presentation="inline" severity="warning">
          Cancel this attempt and release its session place. A new booking can then be made if the
          stage allows it.
        </StudentFeedback>
      )}
      {action === 'waive' && (
        <StudentFeedback notificationKey="STU-0243" presentation="inline" severity="warning">
          This records an assessment waiver. Enter the reason for the admission audit history.
        </StudentFeedback>
      )}
      {action !== 'book' && (
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={3}
          label="Notes / reason"
          disabled={isSubmitting}
          {...formik.getFieldProps('notes')}
          error={Boolean(touched.notes && errors.notes)}
          helperText={touched.notes ? errors.notes : undefined}
        />
      )}
    </Stack>
  );
}
