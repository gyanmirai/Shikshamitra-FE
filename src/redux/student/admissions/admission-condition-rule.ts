export const CONDITION_OPERATORS = [
  { value: 'Equals', label: 'Equals' },
  { value: 'NotEquals', label: 'Does not equal' },
  { value: 'Contains', label: 'Contains' },
  { value: 'NotContains', label: 'Does not contain' },
  { value: 'StartsWith', label: 'Starts with' },
  { value: 'EndsWith', label: 'Ends with' },
  { value: 'IsEmpty', label: 'Is empty' },
  { value: 'IsNotEmpty', label: 'Has a value' },
  { value: 'GreaterThan', label: 'Greater than' },
  { value: 'GreaterThanOrEqual', label: 'At least' },
  { value: 'LessThan', label: 'Less than' },
  { value: 'LessThanOrEqual', label: 'At most' },
  { value: 'In', label: 'Is one of' },
  { value: 'NotIn', label: 'Is not one of' },
] as const;
export type AdmissionConditionLeaf = {
  field: string;
  operator: string;
  value?: string | number | boolean | string[];
};
export type AdmissionConditionGroup = {
  operator: 'ALL' | 'ANY';
  conditions: AdmissionConditionRule[];
};
export type AdmissionConditionRule = AdmissionConditionLeaf | AdmissionConditionGroup;
export const emptyCondition = (): AdmissionConditionLeaf => ({
  field: '',
  operator: 'Equals',
  value: '',
});
export const needsConditionValue = (operator: string) =>
  !['IsEmpty', 'IsNotEmpty'].includes(operator);

function readable(value: unknown, depth = 0): value is AdmissionConditionRule {
  if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 5) return false;
  const item = value as Record<string, unknown>;
  if ('conditions' in item)
    return (
      (item.operator === 'ALL' || item.operator === 'ANY') &&
      Array.isArray(item.conditions) &&
      item.conditions.length <= 30 &&
      item.conditions.every((child) => readable(child, depth + 1))
    );
  return (
    typeof item.field === 'string' &&
    CONDITION_OPERATORS.some(({ value: op }) => op === item.operator) &&
    (item.value === undefined ||
      ['string', 'number', 'boolean'].includes(typeof item.value) ||
      (Array.isArray(item.value) && item.value.every((entry) => typeof entry === 'string')))
  );
}

export function readAdmissionCondition(json?: string | null): AdmissionConditionRule | null {
  if (!json) return null;
  try {
    const value: unknown = JSON.parse(json);
    return readable(value) ? value : null;
  } catch {
    return null;
  }
}

export function getAdmissionConditionError(json?: string | null): string | undefined {
  if (json && json.length > 8192) return 'Simplify this condition to fit within 8,192 characters.';
  const rule = readAdmissionCondition(json);
  if (!rule) return 'Add a supported condition to decide when this document is required.';
  if (countLeaves(rule) > 30) return 'Use no more than 30 conditions for one document.';
  return validateRule(rule);
}

function countLeaves(rule: AdmissionConditionRule): number {
  return 'conditions' in rule
    ? rule.conditions.reduce((total, item) => total + countLeaves(item), 0)
    : 1;
}

function validateRule(rule: AdmissionConditionRule): string | undefined {
  if ('conditions' in rule) {
    if (!rule.conditions.length) return 'Add at least one condition to each group.';
    return rule.conditions.map(validateRule).find(Boolean);
  }
  if (rule.field.length > 128) return 'Use a field reference with no more than 128 characters.';
  if (!/^(application|inquiry|assessment)\.[A-Za-z0-9_.-]+$/.test(rule.field)) {
    return 'Choose an application, inquiry, or assessment field for the condition.';
  }
  if (
    needsConditionValue(rule.operator) &&
    (rule.value === undefined || String(rule.value).trim() === '')
  ) {
    return 'Enter a comparison value for the condition.';
  }
  if (
    /^(GreaterThan|LessThan)/.test(rule.operator) &&
    (Array.isArray(rule.value) ||
      typeof rule.value === 'boolean' ||
      !Number.isFinite(Number(rule.value)))
  ) {
    return 'Enter a number for this comparison.';
  }
  return undefined;
}
