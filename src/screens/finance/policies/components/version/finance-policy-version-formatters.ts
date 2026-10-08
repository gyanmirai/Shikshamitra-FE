import { fDate, fDateTime } from 'src/utils/format-time';
import { fNumber, fPercent, fCurrency } from 'src/utils/format-number';

export type VersionValueKind = 'boolean' | 'empty' | 'status' | 'text';

export type FormattedVersionValue = {
  kind: VersionValueKind;
  text: string;
};

export type VersionValueContext = {
  labelsById?: Record<string, string>;
  policyType?: string;
};

export const contextFromRefundSnapshot = (
  snapshot: Record<string, unknown> | undefined,
  context?: VersionValueContext
): VersionValueContext => {
  const labelsById = { ...context?.labelsById };
  if (!snapshot) return { labelsById, policyType: context?.policyType };
  const names = snapshot.FeeHeadNames ?? snapshot.feeHeadNames;
  if (names && typeof names === 'object' && !Array.isArray(names)) {
    Object.entries(names).forEach(([id, name]) => {
      if (typeof name === 'string' && name.trim()) labelsById[id.toLowerCase()] = name;
    });
  }
  const references = [
    ['ExpenseCategoryId', 'ExpenseCategoryName'],
    ['DefaultPayingBankAccountId', 'DefaultPayingBankAccountName'],
  ] as const;
  references.forEach(([idKey, nameKey]) => {
    const id = snapshot[idKey] ?? snapshot[idKey.charAt(0).toLowerCase() + idKey.slice(1)];
    const name = snapshot[nameKey] ?? snapshot[nameKey.charAt(0).toLowerCase() + nameKey.slice(1)];
    if (typeof id === 'string' && typeof name === 'string' && name.trim()) {
      labelsById[id.toLowerCase()] = name;
    }
  });
  return { labelsById, policyType: context?.policyType };
};

export const formatVersionTimestamp = (value: string) =>
  fDateTime(value, 'DD-MM-YYYY hh:mm A') || '—';

const FIELD_LABELS: Record<string, string> = {
  policyid: 'Policy',
  academicyearid: 'Academic Year',
  applicablefeeheadids: 'Applicable Fee Heads',
  applicablefeeheads: 'Applicable Fee Heads',
  expensecategoryid: 'Expense Category',
  defaultpayingbankaccountid: 'Default Paying Bank Account',
  allowedpayoutmethods: 'Allowed Payout Methods',
  amountmode: 'Amount Mode',
  deductiontype: 'Deduction Type',
  approvalroleids: 'Approval Roles',
  roundingmethod: 'Rounding Method',
  roundoff: 'Rounding Method',
  feeheadrules: 'Fee Head Proration Rules',
  ruletype: 'Rule Type',
  cutoffday: 'Cut-off Day',
  aftercutoffaction: 'After Cut-off Action',
  minimumchargedays: 'Minimum Charge Days',
  calculationbasis: 'Calculation Basis',
  monthlyrule: 'Monthly Rule',
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
  amountmode: {
    '0': 'Remaining paid amount',
    '1': 'Up to eligible amount',
    '2': 'Fixed amount',
    '3': 'Percentage of eligible amount',
    remainingpaidamount: 'Remaining paid amount',
    manualuptoeligible: 'Up to eligible amount',
    fixedamount: 'Fixed amount',
    percentage: 'Percentage of eligible amount',
  },
  deductiontype: {
    '0': 'No deduction',
    '1': 'Fixed amount',
    '2': 'Percentage',
    none: 'No deduction',
    fixedamount: 'Fixed amount',
    percentage: 'Percentage',
  },
  allowedpayoutmethods: {
    '0': 'Cash',
    '1': 'Cheque',
    '2': 'Demand draft',
    '3': 'Bank transfer',
    '4': 'UPI',
    cash: 'Cash',
    cheque: 'Cheque',
    demanddraft: 'Demand draft',
    banktransfer: 'Bank transfer',
    upi: 'UPI',
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
  ruletype: {
    '0': 'No Proration',
    '1': 'Daily Proration',
    '2': 'Monthly Proration',
    '3': 'Full Month Charge',
    noproration: 'No Proration',
    dailyproration: 'Daily Proration',
    monthlyproration: 'Monthly Proration',
    fullmonthcharge: 'Full Month Charge',
    fullcharge: 'Full Charge',
    daily: 'Daily',
    monthlycutoff: 'Monthly Cut-off',
  },
  aftercutoffaction: {
    '0': 'Charge Next Month',
    '1': 'Half Charge',
    nocharge: 'Charge Next Month',
    halfcharge: '50% Half Month Charge',
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

const isGuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);

const unavailableReferenceLabel = (fieldKey: string) => {
  if (fieldKey === 'applicablefeeheadids' || fieldKey === 'latefeeapplyonfeeheads')
    return 'Fee head name not recorded';
  if (fieldKey === 'expensecategoryid') return 'Expense category name not recorded';
  if (fieldKey === 'defaultpayingbankaccountid') return 'Bank account name not recorded';
  return 'Name not recorded';
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

  if ((fieldKey === 'effectivefrom' || fieldKey === 'effectiveto') && typeof value === 'string') {
    const calendarDate = /^\d{4}-\d{2}-\d{2}/.exec(value)?.[0];
    if (calendarDate) {
      return { kind: 'text', text: fDate(calendarDate, 'DD-MM-YYYY') || value };
    }
  }

  if (fieldKey === 'feeheadscope' && context?.policyType === 'refund') {
    const scope = String(value).toLowerCase();
    if (scope === '0' || scope === 'allfeeheads') return { kind: 'text', text: 'All fee heads' };
    if (scope === '1' || scope === 'selectedfeeheads')
      return { kind: 'text', text: 'Selected fee heads' };
  }

  const enumLabel = ENUM_LABELS[fieldKey]?.[String(value).toLowerCase()];
  if (enumLabel) {
    return { kind: fieldKey === 'status' ? 'status' : 'text', text: enumLabel };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: 'empty', text: 'None' };

    const text = value
      .map((item) => {
        const itemEnumLabel = ENUM_LABELS[fieldKey]?.[String(item).toLowerCase()];
        if (itemEnumLabel) return itemEnumLabel;
        const referenceLabel = findReferenceLabel(item, context);
        if (referenceLabel) return referenceLabel;
        if (isGuid(item)) return unavailableReferenceLabel(fieldKey);
        if (item && typeof item === 'object') {
          return formatObject(item as Record<string, unknown>, context);
        }
        return String(deserializeVersionValue(item));
      })
      .join(fieldKey === 'applicablefeeheadids' ? '\n' : ', ');

    return { kind: 'text', text };
  }

  if (value && typeof value === 'object') {
    return { kind: 'text', text: formatObject(value as Record<string, unknown>, context) };
  }

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

  const referenceLabel = findReferenceLabel(value, context);
  if (referenceLabel) return { kind: 'text', text: referenceLabel };

  if (isGuid(value)) return { kind: 'text', text: unavailableReferenceLabel(fieldKey) };

  return { kind: 'text', text: String(value) };
};
