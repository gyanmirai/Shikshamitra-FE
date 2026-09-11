import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { CONDITION_OPERATORS } from 'src/redux/student/admissions/admission-condition-rule';

import { labelConditionFields } from './admission-condition-field-labels';

import type { ConditionFieldLabel } from './admission-condition-field-labels';

export type AdmissionConditionField = { value: string; label: string; fieldType?: number };

export function getTypedConditionFields(
  form: AdmissionForm | undefined,
  source: 'application' | 'inquiry'
): AdmissionConditionField[] {
  return getPublishedConditionFields(form ? [form] : [], source, [5, 10, 11, 12]);
}

export function getPublishedConditionFields(
  forms: AdmissionForm[],
  source: 'application' | 'inquiry',
  excludedTypes: number[],
  includeFormName = false
): AdmissionConditionField[] {
  const fields: ConditionFieldLabel[] = [];
  const seen = new Set<string>();
  forms
    .filter((form) => form.status === 1)
    .forEach((form) => {
      (form.sections ?? []).forEach((section) => {
        const context = [
          ...new Set([section.stepName?.trim(), section.name?.trim()].filter(Boolean)),
        ].join(' / ');
        section.fields
          .filter((field) => !excludedTypes.includes(field.fieldType))
          .forEach((field) => {
            const value = `${source}.${source === 'inquiry' ? field.bindingKey || field.code : field.code}`;
            if (seen.has(value)) return;
            seen.add(value);
            fields.push({
              value,
              label: includeFormName ? `${field.label} (${form.name})` : field.label,
              fieldType: field.fieldType,
              code: field.code,
              context,
            });
          });
      });
    });
  return labelConditionFields(fields);
}

export function getTypedConditionOperators(fieldType?: number): { value: string; label: string }[] {
  const basic = ['Equals', 'NotEquals', 'IsEmpty', 'IsNotEmpty'];
  let allowed: string[];
  if (fieldType === 2)
    allowed = [
      ...basic,
      'GreaterThan',
      'GreaterThanOrEqual',
      'LessThan',
      'LessThanOrEqual',
      'In',
      'NotIn',
    ];
  else if (fieldType === 9) allowed = basic;
  else if ([6, 7, 8].includes(fieldType ?? -1))
    allowed = [...basic, 'In', 'NotIn', ...(fieldType === 7 ? ['Contains', 'NotContains'] : [])];
  else allowed = [...basic, 'Contains', 'NotContains', 'StartsWith', 'EndsWith', 'In', 'NotIn'];
  return CONDITION_OPERATORS.filter((operator) => allowed.includes(operator.value));
}
