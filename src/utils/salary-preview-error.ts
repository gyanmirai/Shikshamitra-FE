import { formatPayrollCurrency } from './payroll-currency';

export type SalaryPreviewRecovery = {
  message: string;
  fields: string[];
  guidance?: string;
  details?: string;
  action?: 'esiTreatment';
};

type DecimalEvidence = { units: bigint; scale: number };
type Amount = { value: number; exact: string; decimal: DecimalEvidence };
const maximumEvidenceAmount = 1_000_000_000;
const maximumEvidenceScale = 80;
const zero = BigInt(0);
const powerOfTen = (scale: number) => BigInt(`1${'0'.repeat(scale)}`);
const absolute = (value: bigint) => (value < zero ? -value : value);

// Bounded decimal arithmetic is only for evidence wording; payroll calculations stay on the server.
const decimalEvidence = (exact: string): DecimalEvidence | null => {
  const match = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(exact);
  if (!match) return null;
  const exponentText = match[4] ?? '0';
  if (exponentText.length > 4) return null;
  const exponent = Number(exponentText);
  if (Math.abs(exponent) > maximumEvidenceScale) return null;
  const scale = (match[3]?.length ?? 0) - exponent;
  if (Math.abs(scale) > maximumEvidenceScale) return null;
  const units = BigInt(`${match[1]}${match[2] || '0'}${match[3] ?? ''}`);
  const decimal = {
    units: scale < 0 ? units * powerOfTen(-scale) : units,
    scale: Math.max(0, scale),
  };
  return absolute(decimal.units) <= BigInt(maximumEvidenceAmount) * powerOfTen(decimal.scale)
    ? decimal
    : null;
};

const subtract = (left: DecimalEvidence, right: DecimalEvidence): DecimalEvidence => {
  const scale = Math.max(left.scale, right.scale);
  return {
    units:
      left.units * powerOfTen(scale - left.scale) - right.units * powerOfTen(scale - right.scale),
    scale,
  };
};
const isSubpaise = ({ units, scale }: DecimalEvidence) =>
  absolute(units) * BigInt(100) < powerOfTen(scale);
const decimalNumber = ({ units, scale }: DecimalEvidence) => Number(units) / 10 ** scale;

// Error metadata is evidence, never a source of free-text instructions or new financial rules.
const ownValue = (data: Record<string, unknown> | null | undefined, key: string): unknown =>
  data && typeof data === 'object' && !Array.isArray(data)
    ? Object.getOwnPropertyDescriptor(data, key)?.value
    : undefined;

const amount = (value: unknown): Amount | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const exact = String(value).trim();
  if (!exact || exact.length > 80 || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(exact))
    return null;
  const number = Number(exact);
  if (!Number.isFinite(number) || Math.abs(number) > maximumEvidenceAmount) return null;
  const decimal = decimalEvidence(exact);
  return decimal ? { value: number, exact, decimal } : null;
};

const magnitude = (value: Amount) => value.exact.replace(/^[+-]/, '').replace(/^\./, '0.');
const gap = (value: DecimalEvidence) =>
  isSubpaise(value) ? 'less than ₹0.01' : formatPayrollCurrency(Math.abs(decimalNumber(value)));

const messages: Record<string, SalaryPreviewRecovery> = {
  'HR:Payroll:CompensationTargetNotSolvable': {
    message: 'The monthly target cannot be reached.',
    guidance: 'Review the amount, earning rules and employer PF/ESIC contributions.',
    details:
      'Earnings must equal gross salary. Cost to school includes employer PF/ESIC contributions. Fixed earnings cannot scale automatically.',
    fields: ['monthlyAmount', 'rules'],
  },
  'HR:Payroll:SalaryTemplateAllocationMismatch': {
    message: 'Salary breakdown doesn’t match gross salary.',
    guidance: 'Review the amount or earning rules.',
    fields: ['monthlyAmount', 'rules'],
  },
  'HR:Payroll:SalaryTemplateEarningsExceedGross': {
    message: 'Earning rules exceed gross salary.',
    guidance: 'Review the amount or earning rules.',
    fields: ['monthlyAmount', 'rules'],
  },
  'HR:Payroll:PfRuleNotFound': {
    message: 'The selected PF rule is unavailable.',
    guidance: 'Choose an available PF rule, then preview again.',
    fields: ['pfRuleId'],
  },
  'HR:Payroll:PfRuleNotEffective': {
    message: 'The PF rule does not cover the preview month.',
    guidance: 'Choose an active PF rule effective for that month.',
    fields: ['pfRuleId', 'effectiveMonth'],
  },
  'HR:Payroll:SalaryTemplatePfFormulaRequired': {
    message: 'The salary template needs a PF deduction.',
    guidance: 'Add a deduction using the Employee Provident Fund formula before applying PF.',
    fields: ['deductions', 'pfRuleId'],
  },
  'HR:Payroll:SalaryTemplateRequiresOneBasic': {
    message: 'Choose exactly one Basic earning component.',
    guidance: 'Set its payroll purpose to Basic. Keep its entered amount or percentage.',
    fields: ['rules'],
  },
};

/** Safe recovery copy for salary preview business rules, including older API responses. */
export function salaryPreviewError(
  code: unknown,
  data?: Record<string, unknown> | null
): SalaryPreviewRecovery | undefined {
  if (code === 'HR:Payroll:SalaryTemplateSampleBlocked') {
    const issues = ownValue(data, 'issues');
    // Only evidence for this specific blocker owns inline recovery. Unknown/mixed blockers
    // retain global recovery rather than suggesting an unrelated classification change.
    if (
      Array.isArray(issues) &&
      issues.includes('ESI_WAGE_CLASSIFICATION_REQUIRED') &&
      issues.every((issue) =>
        ['ESI_WAGE_CLASSIFICATION_REQUIRED', 'ESI_RATE_OVERRIDE'].includes(issue)
      )
    )
      return {
        message: 'ESIC treatment is missing for this preview month.',
        guidance:
          'Classify the earnings for this month, then preview again. Later changes do not cover earlier months.',
        fields: [],
        action: 'esiTreatment',
      };
    return undefined;
  }
  if (typeof code !== 'string' || !Object.hasOwn(messages, code)) return undefined;
  const result = messages[code];
  if (code === 'HR:Payroll:SalaryTemplateAllocationMismatch') {
    const grossMetadata = ownValue(data, 'gross');
    const allocatedMetadata = ownValue(data, 'allocated');
    const differenceMetadata = ownValue(data, 'difference');
    const gross = amount(grossMetadata);
    const allocated = amount(allocatedMetadata);
    const difference = amount(differenceMetadata);
    if (
      !gross ||
      !allocated ||
      !difference ||
      gross.value < 0 ||
      allocated.value < 0 ||
      !difference.value
    )
      return result;
    if (
      typeof grossMetadata === 'string' &&
      typeof allocatedMetadata === 'string' &&
      typeof differenceMetadata === 'string'
    ) {
      // Exact strings retain their decimal evidence, including direction below Number precision.
      const discrepancy = subtract(subtract(gross.decimal, allocated.decimal), difference.decimal);
      if (discrepancy.units !== zero) return result;
    } else {
      // JSON numbers may already have lost decimal precision during transport.
      const tolerance =
        Math.max(gross.value, allocated.value, Math.abs(difference.value), 1) * Number.EPSILON * 8;
      if (Math.abs(gross.value - allocated.value - difference.value) > tolerance) return result;
    }
    const direction = difference.value > 0 ? 'below' : 'above';
    return {
      ...result,
      message: `Earnings are ${gap(difference.decimal)} ${direction} gross salary.`,
      details: isSubpaise(difference.decimal)
        ? `Exact difference: ₹${magnitude(difference)} ${direction} gross salary.`
        : `Gross: ${formatPayrollCurrency(gross.value)}. Earnings: ${formatPayrollCurrency(allocated.value)}.`,
    };
  }
  if (code === 'HR:Payroll:SalaryTemplateEarningsExceedGross') {
    const excess = amount(ownValue(data, 'excess'));
    if (!excess || excess.value <= 0) return result;
    return {
      ...result,
      message: `Earnings are ${gap(excess.decimal)} above gross salary.`,
      ...(isSubpaise(excess.decimal)
        ? { details: `Exact excess: ₹${magnitude(excess)} above gross salary.` }
        : {}),
    };
  }
  if (code === 'HR:Payroll:CompensationTargetNotSolvable') {
    const basis = ownValue(data, 'salaryBasis');
    const target = amount(ownValue(data, 'target'));
    const fixed = amount(ownValue(data, 'fixedEarnings'));
    if (
      (basis !== 'EMPLOYER_COST' && basis !== 'EmployerCost') ||
      !target ||
      !fixed ||
      target.decimal.units <= zero
    )
      return result;
    const excess = subtract(fixed.decimal, target.decimal);
    if (excess.units <= zero) return result;
    const exact = isSubpaise(excess);
    return {
      ...result,
      message: exact
        ? 'Fixed earnings are less than ₹0.01 above cost to school.'
        : `Fixed earnings exceed cost to school by ${formatPayrollCurrency(decimalNumber(excess))}.`,
      guidance: 'Reduce fixed earnings or review the monthly target.',
      details: `Cost to school: ${exact ? `₹${target.exact}` : formatPayrollCurrency(target.value)}. Fixed earnings: ${exact ? `₹${fixed.exact}` : formatPayrollCurrency(fixed.value)}, before employer PF/ESIC contributions. Employee deductions do not reduce employer cost.`,
    };
  }
  return result;
}
