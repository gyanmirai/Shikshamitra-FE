import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { Stack, Switch, TextField, FormControlLabel } from '@mui/material';
import { readAdmissionReviewPolicy } from 'src/redux/student/admissions/admission-review-policy';
import { readAdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';
import { readAdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';
import { readAdmissionEligibilityPolicy } from 'src/redux/student/admissions/admission-eligibility-policy';

import { WorkflowPreservedCondition } from './workflow-preserved-condition';
import { WorkflowTransitionStageSelect } from './workflow-transition-stage-select';
import { WorkflowReviewRoute, isReviewOutcomeCondition } from './workflow-review-route';
import { WorkflowTransitionConditionFields } from './workflow-transition-condition-fields';
import { WorkflowDocumentRoute, isDocumentOutcomeCondition } from './workflow-document-route';
import { WorkflowAssessmentRoute, isAssessmentOutcomeCondition } from './workflow-assessment-route';
import {
  WorkflowEligibilityRoute,
  isEligibilityOutcomeCondition,
} from './workflow-eligibility-route';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

type Props = {
  formik: FormikProps<WorkflowTransitionFormValues>;
  stages: AdmissionWorkflowStage[];
  readOnly: boolean;
};

export function WorkflowTransitionFields({ formik, stages, readOnly }: Props) {
  const from = stages.find((stage) => stage.id === formik.values.fromStageId);
  const assessment =
    from?.stageType === 2 &&
    readAdmissionAssessmentPolicy(from.configurationJson)?.enabled === true;
  const documents =
    from?.stageType === 5 && readAdmissionDocumentPolicy(from.configurationJson)?.enabled === true;
  const eligibility =
    from?.stageType === 3 &&
    readAdmissionEligibilityPolicy(from.configurationJson)?.enabled === true;
  const review =
    from?.stageType === 6 && readAdmissionReviewPolicy(from.configurationJson)?.enabled === true;
  const showCondition =
    formik.values.hasCondition &&
    !formik.values.preserveCondition &&
    (!assessment || !isAssessmentOutcomeCondition(formik.values)) &&
    (!documents || !isDocumentOutcomeCondition(formik.values)) &&
    (!eligibility || !isEligibilityOutcomeCondition(formik.values)) &&
    (!review || !isReviewOutcomeCondition(formik.values));
  return (
    <Stack spacing={2} sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
      <WorkflowTransitionStageSelect
        formik={formik}
        field="fromStageId"
        label="From stage *"
        stages={stages}
        readOnly={readOnly}
      />
      <WorkflowTransitionStageSelect
        formik={formik}
        field="toStageId"
        label="To stage *"
        stages={stages}
        readOnly={readOnly}
      />
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Priority *"
        disabled={readOnly}
        {...formik.getFieldProps('priority')}
      />
      {formik.values.preserveCondition ? (
        <WorkflowPreservedCondition json={formik.values.conditionRuleJson ?? ''} />
      ) : assessment ? (
        <WorkflowAssessmentRoute formik={formik} readOnly={readOnly} />
      ) : documents ? (
        <WorkflowDocumentRoute formik={formik} readOnly={readOnly} />
      ) : eligibility ? (
        <WorkflowEligibilityRoute formik={formik} readOnly={readOnly} />
      ) : review ? (
        <WorkflowReviewRoute formik={formik} readOnly={readOnly} />
      ) : (
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={formik.values.hasCondition}
              disabled={readOnly}
              onChange={(_, value) => {
                formik.setFieldValue('hasCondition', value);
                if (value) formik.setFieldValue('isDefault', false);
              }}
            />
          }
          label="Use a condition"
        />
      )}
      {showCondition ? (
        <WorkflowTransitionConditionFields formik={formik} readOnly={readOnly} />
      ) : !assessment && !documents && !eligibility && !review && !formik.values.hasCondition ? (
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={formik.values.isDefault}
              disabled={readOnly}
              onChange={(_, value) => formik.setFieldValue('isDefault', value)}
            />
          }
          label="Default route"
        />
      ) : null}
    </Stack>
  );
}
