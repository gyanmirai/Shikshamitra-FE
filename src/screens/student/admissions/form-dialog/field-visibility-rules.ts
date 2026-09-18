export type EditableAdmissionVisibilityRule = {
  field: string;
  operator: string;
  value?: string | number | boolean;
};

export type EditableAdmissionVisibilityRuleResult = {
  rule: EditableAdmissionVisibilityRule | null;
  error?: string;
};

const SIMPLE_OPERATORS = new Set([
  'Equals',
  'NotEquals',
  'Contains',
  'NotContains',
  'StartsWith',
  'EndsWith',
  'GreaterThan',
  'GreaterThanOrEqual',
  'LessThan',
  'LessThanOrEqual',
  'In',
  'NotIn',
  'IsEmpty',
  'IsNotEmpty',
]);

export function parseEditableAdmissionVisibilityRule(
  value?: string | null
): EditableAdmissionVisibilityRuleResult {
  if (!value) return { rule: null };
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { rule: null, error: 'The saved visibility rule is not a supported condition.' };
    }

    const candidate = parsed as Record<string, unknown>;
    if (
      typeof candidate.field !== 'string' ||
      !candidate.field ||
      typeof candidate.operator !== 'string' ||
      !SIMPLE_OPERATORS.has(candidate.operator)
    ) {
      return { rule: null, error: 'The saved visibility rule uses an advanced format.' };
    }

    const supportedKeys = new Set(['field', 'operator', 'value']);
    if (Object.keys(candidate).some((key) => !supportedKeys.has(key))) {
      return { rule: null, error: 'The saved visibility rule uses an advanced format.' };
    }

    const valueType = typeof candidate.value;
    if (
      candidate.value !== undefined &&
      valueType !== 'string' &&
      valueType !== 'number' &&
      valueType !== 'boolean'
    ) {
      return { rule: null, error: 'The saved visibility rule uses an advanced value.' };
    }

    return {
      rule: {
        field: candidate.field,
        operator: candidate.operator,
        ...(candidate.value === undefined
          ? {}
          : { value: candidate.value as string | number | boolean }),
      },
    };
  } catch {
    return { rule: null, error: 'The saved visibility rule contains invalid JSON.' };
  }
}

export function serializeEditableAdmissionVisibilityRule(
  rule: EditableAdmissionVisibilityRule | null
) {
  return rule?.field ? JSON.stringify(rule) : undefined;
}
