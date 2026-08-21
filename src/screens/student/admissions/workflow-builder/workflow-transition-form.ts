import type { AdmissionWorkflowTransition } from 'src/redux/student/admissions/admission-workflows-api';

import * as Yup from 'yup';

import type { SimpleTransitionCondition } from '../workflow-builder-utils';

export type WorkflowTransitionFormValues = AdmissionWorkflowTransition & {
  hasCondition: boolean;
  conditionField: string;
  conditionOperator: SimpleTransitionCondition['operator'];
  conditionValue: string;
};

export const WORKFLOW_CONDITION_OPERATORS: SimpleTransitionCondition['operator'][] = [
  'Equals', 'NotEquals', 'GreaterThan', 'GreaterThanOrEqual', 'LessThan', 'LessThanOrEqual',
  'Contains', 'IsEmpty', 'IsNotEmpty', 'In', 'NotIn',
];

export const workflowTransitionSchema = Yup.object({
  fromStageId: Yup.string().required('From stage is required'),
  toStageId: Yup.string().required('To stage is required').notOneOf([Yup.ref('fromStageId')], 'Choose a different destination'),
  priority: Yup.number().integer().min(0).required(),
  conditionField: Yup.string().when('hasCondition', {
    is: true,
    then: (item) => item.trim().required('Field is required'),
  }),
  conditionValue: Yup.string().when(['hasCondition', 'conditionOperator'], {
    is: (enabled: boolean, operator: string) => enabled && !['IsEmpty', 'IsNotEmpty'].includes(operator),
    then: (item) => item.required('Value is required'),
  }),
});
