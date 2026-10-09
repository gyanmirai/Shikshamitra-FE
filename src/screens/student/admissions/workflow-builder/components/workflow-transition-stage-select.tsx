import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { MenuItem, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { readAdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';
import { readAdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';

import { isDocumentOutcomeCondition } from './workflow-document-route';
import { isApplicationStageType } from '../workflow-stage-configuration';
import { isAssessmentOutcomeCondition } from './workflow-assessment-route';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

type Props = {
  formik: FormikProps<WorkflowTransitionFormValues>;
  stages: AdmissionWorkflowStage[];
  readOnly: boolean;
};

export function WorkflowTransitionStageSelect({
  formik,
  field,
  label,
  stages,
  readOnly,
}: Props & { field: 'fromStageId' | 'toStageId'; label: string }) {
  const touched = formik.touched[field];
  const error = formik.errors[field];
  return (
    <ShakingTextField error={Boolean(touched && error)}>
      <TextField
        select
        fullWidth
        size="small"
        label={label}
        disabled={readOnly}
        {...formik.getFieldProps(field)}
        onChange={(event) => {
          const stageId = event.target.value;
          const selectedStage = stages.find((stage) => stage.id === stageId);
          const supportsAssessment =
            selectedStage?.stageType === 2 &&
            readAdmissionAssessmentPolicy(selectedStage.configurationJson)?.enabled === true;
          const supportsDocuments =
            selectedStage?.stageType === 5 &&
            readAdmissionDocumentPolicy(selectedStage.configurationJson)?.enabled === true;
          const guidedOutcomeChanged =
            [
              'inquiry.management.outcome',
              'eligibility.outcome',
              'review.decision',
              'offer.status',
              'seat.status',
            ].includes(formik.values.conditionField) ||
            (formik.values.conditionField === 'payment.status' && selectedStage?.stageType !== 4);
          if (
            field === 'fromStageId' &&
            ((!supportsAssessment && isAssessmentOutcomeCondition(formik.values)) ||
              (!supportsDocuments && isDocumentOutcomeCondition(formik.values)) ||
              guidedOutcomeChanged)
          ) {
            formik.setValues({
              ...formik.values,
              fromStageId: stageId,
              hasCondition: false,
              isDefault: true,
              conditionField: '',
              conditionOperator: 'Equals',
              conditionValue: '',
            });
          } else {
            formik.setFieldValue(field, stageId);
          }
        }}
        error={Boolean(touched && error)}
        helperText={touched && error}
      >
        {stages
          .filter(
            (stage) =>
              (isApplicationStageType(stage.stageType) || stage.id === formik.values[field]) &&
              (field !== 'toStageId' || stage.id !== formik.values.fromStageId)
          )
          .map((stage) => (
            <MenuItem key={stage.id} value={stage.id}>
              {stage.name}
            </MenuItem>
          ))}
      </TextField>
    </ShakingTextField>
  );
}
