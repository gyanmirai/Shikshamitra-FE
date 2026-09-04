import { fNumber, fPercent, fCurrency } from 'src/utils/format-number';

export type VersionValueKind = 'boolean' | 'empty' | 'status' | 'text';

export type FormattedVersionValue = {
  kind: VersionValueKind;
  text: string;
};

export type VersionValueContext = {
  labelsById?: Record<string, string>;
};

const FIELD_LABELS: Record<string, string> = {
  policyid: 'Policy',
  academicyearid: 'Academic Year',
  applicablefeeheadids: 'Applicable Fee Heads',
  applicablefeeheads: 'Applicable Fee Heads',
  approvalroleids: 'Approval Roles',
  roundingmethod: 'Rounding Method',
  roundoff: 'Rounding Method',
};

const ENUM_LABELS: Record<string, Record<string, string>> = {
  status: {
    '0': 'Draft',
    '1': 'Active',
    '2': 'Archived',
  },
  valuesource: {
    '0': 'Policy Fixed',
    '1': 'Request Entered Within Limits',
  },
  calculationmethod: {
    '0': 'Percentage',
    '1': 'Fixed Amount',
    '2': 'Full Waiver',
  },
  feeheadscope: {
    '0': 'Entire Fee Structure',
    '1': 'Selected Fee Heads',
  },
  applyon: {
    '0': 'All Outstanding Fees',
    '1': 'Current Installment',
    '2': 'Future Installments',
  },
  roundingmethod: {
    '0': 'None',
    '1': 'Round Up',
    '2': 'Round Down',
    '3': 'Nearest Rupee',
  },
  roundoff: {
    '0': 'None',
    '1': 'Round Up',
    '2': 'Round Down',
    '3': 'Nearest Rupee',
  },
};

const normalizeFieldKey = (fieldName: string) =>
  fieldName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const humanizeToken = (value: string) => {
  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return spaced ? spaced.charAt(0).toUpperCase() + spaced.slice(1) : '';
};

const looksSerialized = (value: string) =>
  value === 'true' ||
  value === 'false' ||
  value === 'null' ||
  /^-?\d+(\.\d+)?$/.test(value) ||
  (value.startsWith('"') && value.endsWith('"')) ||
  (value.startsWith('[') && value.endsWith(']')) ||
  (value.startsWith('{') && value.endsWith('}'));

export const deserializeVersionValue = (value: unknown): unknown => {
  let result = value;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (typeof result !== 'string') break;

    const trimmed = result.trim();
    if (!looksSerialized(trimmed)) return result;

    try {
      result = JSON.parse(trimmed);
    } catch {
      return result;
    }
  }

  return result;
};

export const formatFinancePolicyVersionField = (fieldName: string) => {
  if (!fieldName) return '';

  const fieldKey = normalizeFieldKey(fieldName);
  return FIELD_LABELS[fieldKey] || humanizeToken(fieldName);
};

const findReferenceLabel = (value: unknown, context?: VersionValueContext) => {
  if (typeof value !== 'string') return undefined;
  return context?.labelsById?.[value.toLowerCase()];
};

const formatObject = (value: Record<string, unknown>, context?: VersionValueContext) =>
  Object.entries(value)
    .map(([key, item]) => {
      const formatted = formatFinancePolicyVersionValue(key, item, context);
      return `${formatFinancePolicyVersionField(key)}: ${formatted.text}`;
    })
    .join('; ');

export const formatFinancePolicyVersionValue = (
  fieldName: string,
  rawValue: unknown,
  context?: VersionValueContext
): FormattedVersionValue => {
  const value = deserializeVersionValue(rawValue);
  const fieldKey = normalizeFieldKey(fieldName);

  if (value === null || value === undefined || value === '') {
    return { kind: 'empty', text: 'Empty' };
  }

  if (typeof value === 'boolean') {
    return { kind: 'boolean', text: value ? 'Yes' : 'No' };
  }

  const enumLabel = ENUM_LABELS[fieldKey]?.[String(value).toLowerCase()];
  if (enumLabel) {
    return { kind: fieldKey === 'status' ? 'status' : 'text', text: enumLabel };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: 'empty', text: 'None' };

    const text = value
      .map((item) => {
        const referenceLabel = findReferenceLabel(item, context);
        if (referenceLabel) return referenceLabel;
        if (item && typeof item === 'object') {
          return formatObject(item as Record<string, unknown>, context);
        }
        return String(deserializeVersionValue(item));
      })
      .join(', ');

    return { kind: 'text', text };
  }

  if (value && typeof value === 'object') {
    return { kind: 'text', text: formatObject(value as Record<string, unknown>, context) };
  }

  const referenceLabel = findReferenceLabel(value, context);
  if (referenceLabel) return { kind: 'text', text: referenceLabel };

  if (typeof value === 'number') {
    if (fieldKey.includes('percentage')) {
      return { kind: 'text', text: fPercent(value) };
    }
    if (fieldKey.includes('amount')) {
      return { kind: 'text', text: fCurrency(value) };
    }
    return { kind: 'text', text: fNumber(value) };
  }

  if (ENUM_LABELS[fieldKey]) {
    return {
      kind: fieldKey === 'status' ? 'status' : 'text',
      text: humanizeToken(String(value)),
    };
  }

  return { kind: 'text', text: String(value) };
};
