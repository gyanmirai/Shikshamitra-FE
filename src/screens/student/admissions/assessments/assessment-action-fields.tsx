import type { FormikProps } from 'formik';
import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { Alert, Stack, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { AssessmentBookingField } from './assessment-booking-field';

import type { AssessmentAction, AssessmentActionValues } from './assessment-action-model';

type Props = {
  action: AssessmentAction;
  assessment: ManagedApplicationAssessment;
  formik: FormikProps<AssessmentActionValues>;
  admissionOfferingId: string;
  workflowStageDefinitionId: string;
};

export function AssessmentActionFields({
  action,
  assessment,
  formik,
  admissionOfferingId,
  workflowStageDefinitionId,
}: Props) {
  const { values, touched, errors, isSubmitting } = formik;
  return (
    <Stack spacing={2}>
      {action === 'book' &&
        (assessment.policy.schedulingEnabled ? (
          <AssessmentBookingField
            admissionOfferingId={admissionOfferingId}
            workflowStageDefinitionId={workflowStageDefinitionId}
            value={values.sessionId}
            onChange={(value) => formik.setFieldValue('sessionId', value)}
            error={touched.sessionId ? errors.sessionId : undefined}
            disabled={isSubmitting}
          />
        ) : (
          <Alert severity="info">
            Start a new assessment attempt. This stage does not require a scheduled session.
          </Alert>
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
        (assessment.policy.scoringEnabled ? (
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
        <Alert severity="info">
          Allow another attempt within the configured limit of {assessment.policy.maxAttempts}. Book
          the next attempt after saving.
        </Alert>
      )}
      {action === 'cancel' && (
        <Alert severity="warning">
          Cancel this attempt and release its session place. A new booking can then be made if the
          stage allows it.
        </Alert>
      )}
      {action === 'waive' && (
        <Alert severity="warning">
          This records an assessment waiver. Enter the reason for the admission audit history.
        </Alert>
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
