import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';

import { WORKFLOW_CONDITION_OPERATORS } from './workflow-transition-form';
import { parseEditableAdmissionChoices } from '../form-dialog/field-choice-options';
import {
  getTypedConditionFields,
  getTypedConditionOperators,
} from './components/admission-condition-fields';

export type WorkflowConditionField = {
  value: string;
  label: string;
  fieldType?: number;
  choices?: { value: string; label: string }[];
};

export function getRouteSourceFormIds(
  stages: AdmissionWorkflowStage[],
  transitions: AdmissionWorkflowTransition[],
  fromStageId: string
): string[] {
  const ancestors = new Set([fromStageId]);
  let changed = true;
  while (changed) {
    const parents = transitions.filter(
      (route) => ancestors.has(route.toStageId) && !ancestors.has(route.fromStageId)
    );
    changed = parents.length > 0;
    parents.forEach((route) => ancestors.add(route.fromStageId));
  }
  return [
    ...new Set(
      stages
        .filter((stage) => stage.stageType === 1 && ancestors.has(stage.id))
        .map((stage) => readStageConfiguration(stage.configurationJson)?.formDefinitionId)
        .filter((id): id is string => typeof id === 'string' && Boolean(id))
    ),
  ];
}

export function getRouteConditionFields(
  forms: AdmissionForm[],
  stages: AdmissionWorkflowStage[],
  transitions: AdmissionWorkflowTransition[],
  fromStageId: string
): WorkflowConditionField[] {
  const formIds = new Set(getRouteSourceFormIds(stages, transitions, fromStageId));
  const result: WorkflowConditionField[] = [
    { value: 'application.status', label: 'Application status', fieldType: 6 },
  ];
  forms
    .filter((form) => formIds.has(form.id))
    .forEach((form) => {
      getTypedConditionFields(form, 'application').forEach((field) => {
        if (result.some((item) => item.value === field.value)) return;
        const source = form.sections
          .flatMap((section) => (section.isRepeatable ? [] : section.fields))
          .find((item) => `application.${item.code}` === field.value);
        if (!source) return;
        result.push({
          ...field,
          label: `${field.label} · ${form.name}`,
          choices:
            field.fieldType === 9
              ? [
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]
              : parseEditableAdmissionChoices(source.optionsJson).choices,
        });
      });
    });
  return result;
}

export function getRouteOperators(fieldType?: number) {
  return getTypedConditionOperators(fieldType).filter((item) =>
    WORKFLOW_CONDITION_OPERATORS.some((operator) => operator === item.value)
  );
}

export function isValidRouteNumber(value: string, operator: string): boolean {
  if (['IsEmpty', 'IsNotEmpty'].includes(operator)) return true;
  const numbers = ['In', 'NotIn'].includes(operator) ? value.split(',') : [value];
  return numbers.every((number) => /^-?\d+(\.\d+)?$/.test(number.trim()));
}

export const ROUTE_OPERATOR_LABELS: Record<string, string> = {
  Equals: 'is',
  NotEquals: 'is not',
  GreaterThan: 'is greater than',
  GreaterThanOrEqual: 'is at least',
  LessThan: 'is less than',
  LessThanOrEqual: 'is at most',
  Contains: 'contains',
  IsEmpty: 'is empty',
  IsNotEmpty: 'is not empty',
  In: 'is one of',
  NotIn: 'is not one of',
};
