type Rule = {
  operator?: string;
  conditions?: unknown[];
  field?: string;
  value?: unknown;
};

const normalize = (value: unknown) => String(value ?? '').replace(/^"|"$/g, '');
const compareText = (left: string, right: string) =>
  left.localeCompare(right, undefined, { sensitivity: 'accent' });
const toList = (value: unknown) =>
  Array.isArray(value) ? value.map(normalize) : normalize(value).split(',').map((item) => item.trim());

export function evaluateAdmissionRule(rule: unknown, values: Record<string, string>): boolean {
  if (!rule || typeof rule !== 'object') return true;
  const expression = rule as Rule;
  if (Array.isArray(expression.conditions)) {
    const results = expression.conditions.map((condition) => evaluateAdmissionRule(condition, values));
    return expression.operator?.toUpperCase() === 'ANY' ? results.some(Boolean) : results.every(Boolean);
  }
  const actual = expression.field ? values[expression.field] ?? '' : '';
  const expected = normalize(expression.value);
  const actualNumber = Number(actual);
  const expectedNumber = Number(expected);
  const numeric = Number.isFinite(actualNumber) && Number.isFinite(expectedNumber);
  switch (expression.operator?.toLowerCase()) {
    case 'equals': return compareText(actual, expected) === 0;
    case 'notequals': return compareText(actual, expected) !== 0;
    case 'contains': return actual.toLocaleLowerCase().includes(expected.toLocaleLowerCase());
    case 'notcontains': return !actual.toLocaleLowerCase().includes(expected.toLocaleLowerCase());
    case 'startswith': return actual.toLocaleLowerCase().startsWith(expected.toLocaleLowerCase());
    case 'endswith': return actual.toLocaleLowerCase().endsWith(expected.toLocaleLowerCase());
    case 'greaterthan': return numeric && actualNumber > expectedNumber;
    case 'greaterthanorequal': return numeric && actualNumber >= expectedNumber;
    case 'lessthan': return numeric && actualNumber < expectedNumber;
    case 'lessthanorequal': return numeric && actualNumber <= expectedNumber;
    case 'isempty': return !actual.trim();
    case 'isnotempty': return Boolean(actual.trim());
    case 'in': return toList(expression.value).some((item) => compareText(actual, item) === 0);
    case 'notin': return toList(expression.value).every((item) => compareText(actual, item) !== 0);
    default: return false;
  }
}

export function isAdmissionRuleVisible(ruleJson: string | null | undefined, values: Record<string, string>) {
  if (!ruleJson) return true;
  try {
    return evaluateAdmissionRule(JSON.parse(ruleJson), values);
  } catch {
    return false;
  }
}

export function readAdmissionFormValue(value?: string | null) {
  if (!value) return '';
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === 'string' ? parsed : String(parsed ?? '');
  } catch {
    return value;
  }
}
