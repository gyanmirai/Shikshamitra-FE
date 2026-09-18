import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { MenuItem, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { readAdmissionSeatPolicy } from 'src/redux/student/admissions/admission-seat-policy';
import { readAdmissionOfferPolicy } from 'src/redux/student/admissions/admission-offer-policy';
import { readAdmissionReviewPolicy } from 'src/redux/student/admissions/admission-review-policy';
import { readAdmissionInquiryPolicy } from 'src/redux/student/admissions/admission-inquiry-policy';
import { readAdmissionPaymentPolicy } from 'src/redux/student/admissions/admission-payment-policy';
import { readAdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';
import { readAdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';
import { readAdmissionEligibilityPolicy } from 'src/redux/student/admissions/admission-eligibility-policy';

import { isReviewOutcomeCondition } from './workflow-review-route';
import { isDocumentOutcomeCondition } from './workflow-document-route';
import { isAssessmentOutcomeCondition } from './workflow-assessment-route';
import { isEligibilityOutcomeCondition } from './workflow-eligibility-route';

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
          const supportsEligibility =
            selectedStage?.stageType === 3 &&
            readAdmissionEligibilityPolicy(selectedStage.configurationJson)?.enabled === true;
          const supportsReview =
            selectedStage?.stageType === 6 &&
            readAdmissionReviewPolicy(selectedStage.configurationJson)?.enabled === true;
          const guidedFieldByType: Partial<Record<number, string>> = {
            0: 'inquiry.management.outcome',
            4: 'payment.status',
            8: 'offer.status',
            9: 'seat.status',
          };
          const selectedGuidedField = selectedStage
            ? guidedFieldByType[selectedStage.stageType]
            : undefined;
          const supportsGuidedOutcome =
            (selectedStage?.stageType === 0 &&
              readAdmissionInquiryPolicy(selectedStage.configurationJson)?.enabled === true) ||
            (selectedStage?.stageType === 4 &&
              readAdmissionPaymentPolicy(selectedStage.configurationJson)?.enabled === true) ||
            (selectedStage?.stageType === 8 &&
              readAdmissionOfferPolicy(selectedStage.configurationJson)?.enabled === true) ||
            (selectedStage?.stageType === 9 &&
              readAdmissionSeatPolicy(selectedStage.configurationJson)?.enabled === true);
          const guidedOutcomeChanged =
            [
              'inquiry.management.outcome',
              'payment.status',
              'offer.status',
              'seat.status',
            ].includes(formik.values.conditionField) &&
            (!supportsGuidedOutcome || formik.values.conditionField !== selectedGuidedField);
          if (
            field === 'fromStageId' &&
            ((!supportsAssessment && isAssessmentOutcomeCondition(formik.values)) ||
              (!supportsDocuments && isDocumentOutcomeCondition(formik.values)) ||
              (!supportsEligibility && isEligibilityOutcomeCondition(formik.values)) ||
              (!supportsReview && isReviewOutcomeCondition(formik.values)) ||
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
          .filter((stage) => field !== 'toStageId' || stage.id !== formik.values.fromStageId)
          .map((stage) => (
            <MenuItem key={stage.id} value={stage.id}>
              {stage.name}
            </MenuItem>
          ))}
      </TextField>
    </ShakingTextField>
  );
}
