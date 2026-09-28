import type { AdmissionWorkflowTransition } from 'src/redux/student/admissions/admission-workflows-api';

import * as Yup from 'yup';
import { hasInquiryCondition, INQUIRY_RULE_REPLACEMENT_MESSAGE } from './workflow-inquiry-retirement';

import type { SimpleTransitionCondition } from '../workflow-builder-utils';

export type WorkflowTransitionFormValues = AdmissionWorkflowTransition & {
  hasCondition: boolean;
  preserveCondition?: boolean;
  conditionField: string;
  conditionOperator: SimpleTransitionCondition['operator'];
  conditionValue: string;
};

export const WORKFLOW_CONDITION_OPERATORS: SimpleTransitionCondition['operator'][] = [
  'Equals',
  'NotEquals',
  'GreaterThan',
  'GreaterThanOrEqual',
  'LessThan',
  'LessThanOrEqual',
  'Contains',
  'IsEmpty',
  'IsNotEmpty',
  'In',
  'NotIn',
];

export const workflowTransitionSchema = Yup.object({
  fromStageId: Yup.string().required('From stage is required'),
  toStageId: Yup.string()
    .required('To stage is required')
    .notOneOf([Yup.ref('fromStageId')], 'Choose a different destination'),
  priority: Yup.number().integer().min(0).required(),
  conditionField: Yup.string().when(['hasCondition', 'preserveCondition'], {
    is: (enabled: boolean, preserved: boolean) => enabled && !preserved,
    then: (item) => item.trim().required('Field is required').test(
      'application-stage-field',
      INQUIRY_RULE_REPLACEMENT_MESSAGE,
      (value) => !/^inquiry\./i.test(value ?? '')
    ),
  }),
  conditionValue: Yup.string().when(['hasCondition', 'conditionOperator', 'preserveCondition'], {
    is: (enabled: boolean, operator: string, preserved: boolean) =>
      enabled && !preserved && !['IsEmpty', 'IsNotEmpty'].includes(operator),
    then: (item) => item.required('Value is required'),
  }),
});

export function getTransitionConditionEditorState(
  json?: string
): Pick<
  WorkflowTransitionFormValues,
  'hasCondition' | 'preserveCondition' | 'conditionField' | 'conditionOperator' | 'conditionValue'
> {
  const empty = { conditionField: '', conditionOperator: 'Equals' as const, conditionValue: '' };
  if (!json?.trim()) return { ...empty, hasCondition: false, preserveCondition: false };
  if (hasInquiryCondition(json)) return { ...empty, hasCondition: true, preserveCondition: true };
  try {
    const parsed: unknown = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const rule = parsed as Record<string, unknown>;
      const operator = WORKFLOW_CONDITION_OPERATORS.find((value) => value === rule.operator);
      const simple = Object.keys(rule).every((key) => ['field', 'operator', 'value'].includes(key));
      if (
        simple &&
        typeof rule.field === 'string' &&
        operator &&
        (rule.value === undefined || typeof rule.value === 'string')
      ) {
        return {
          hasCondition: true,
          preserveCondition: false,
          conditionField: rule.field,
          conditionOperator: operator,
          conditionValue: rule.value ?? '',
        };
      }
    }
  } catch {
    // Preserve unrecognized persisted configuration; never replace it with an empty condition.
  }
  return { ...empty, hasCondition: true, preserveCondition: true };
}
