import { it, expect, describe } from 'vitest';

import { salaryPreviewError } from './salary-preview-error';
import { parseApiProblemDetail } from './api-problem-details';
import { normalizeHrFailure } from '../screens/hr/recovery/hr-failure';

describe('salary preview business rule recovery', () => {
  const code = 'HR:Payroll:CompensationTargetNotSolvable';
  it.each(['problem', 'abp', 'axios'])(
    'explains Bug6475 using safe numeric evidence in %s',
    (format) => {
      const data = {
        salaryBasis: 'EMPLOYER_COST',
        target: 50000,
        fixedEarnings: 52000,
        reason: 'FIXED_EARNINGS_EXCEED_EMPLOYER_COST',
      };
      const body =
        format === 'abp'
          ? { error: { code, message: 'One or more business rules were violated.', data } }
          : { errorCode: code, detail: 'One or more business rules were violated.', data };
      const error =
        format === 'axios'
          ? { response: { data: body }, status: 400 }
          : { status: 400, data: body };
      const parsed = parseApiProblemDetail(error);
      expect(parsed.detail).toContain('INR 52000.00');
      expect(parsed.detail).toContain('INR 50000.00');
      expect(parsed.detail).toContain('INR 2000.00');
      expect(parsed.detail).toContain('Employee deductions do not reduce employer cost');
      const failure = normalizeHrFailure(error);
      expect(failure.message).toBe(parsed.detail);
      expect(failure.fields.map((field) => field.name)).toEqual(['monthly Amount', 'rules']);
      expect(failure.setup).toBe('templates');
    }
  );
  it.each([
    undefined,
    null,
    {},
    { target: '50000', fixedEarnings: '52000' },
    { target: NaN, fixedEarnings: Infinity },
    { target: 50000, fixedEarnings: 52000, message: 'Bearer secret must never be displayed' },
  ])('gives actionable fallback without trusting arbitrary data', (data) => {
    const result = salaryPreviewError(code, data);
    expect(result?.message).toContain('earnings must equal gross');
    expect(result?.message).not.toContain('Bearer');
    expect(result?.fields).toEqual(['monthlyAmount', 'rules']);
  });
  it.each([
    ['HR:Payroll:SalaryTemplateAllocationMismatch', 'gross salary', ['monthlyAmount', 'rules']],
    [
      'HR:Payroll:SalaryTemplateEarningsExceedGross',
      'Reduce fixed amounts',
      ['monthlyAmount', 'rules'],
    ],
    ['HR:Payroll:PfRuleNotEffective', 'preview month', ['pfRuleId', 'effectiveMonth']],
    ['HR:Payroll:PfRuleNotFound', 'available PF rule', ['pfRuleId']],
    ['HR:Payroll:SalaryTemplatePfFormulaRequired', 'PF deduction', ['deductions', 'pfRuleId']],
  ])('maps %s to correction fields', (errorCode, phrase, fields) => {
    expect(salaryPreviewError(errorCode)?.message).toContain(phrase);
    expect(salaryPreviewError(errorCode)?.fields).toEqual(fields);
  });
  it('does not invent a diagnosis for unknown errors', () => {
    expect(salaryPreviewError('Other:Unknown')).toBeUndefined();
    ['toString', '__proto__', 'constructor', 'hasOwnProperty'].forEach((unknownCode) => {
      expect(salaryPreviewError(unknownCode)).toBeUndefined();
    });
  });
  it('accepts the existing server enum spelling without changing error metadata contracts', () => {
    expect(
      salaryPreviewError(code, { salaryBasis: 'EmployerCost', target: 50000, fixedEarnings: 52000 })
        ?.message
    ).toContain('INR 52000.00');
  });
});
