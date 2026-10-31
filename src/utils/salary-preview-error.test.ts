import { it, expect, describe } from 'vitest';

import { salaryPreviewError } from './salary-preview-error';
import { parseApiProblemDetail } from './api-problem-details';
import { normalizeHrFailure } from '../screens/hr/recovery/hr-failure';

describe('ESIC salary-preview recovery', () => {
  it('names HRA and its month after Basic has been classified, without inventing a treatment', () => {
    const data = {
      issues: ['ESI_WAGE_CLASSIFICATION_REQUIRED'],
      effectiveMonth: '2026-10',
      unclassifiedEarnings: [{ componentId: 'hra', name: 'HRA' }],
    };
    expect(salaryPreviewError('HR:Payroll:SalaryTemplateSampleBlocked', data)).toMatchObject({
      message: 'ESIC treatment needed: HRA (Oct 2026).',
      unclassifiedEarnings: [{ componentId: 'hra', name: 'HRA' }],
      action: 'esiTreatment',
    });
    expect(salaryPreviewError('HR:Unknown', data)).toBeUndefined();
  });
  it('keeps multiple missing earnings concise and deduplicates their identities', () => {
    const result = salaryPreviewError('HR:Payroll:SalaryTemplateSampleBlocked', {
      issues: ['ESI_WAGE_CLASSIFICATION_REQUIRED'],
      effectiveMonth: '2026-11',
      unclassifiedEarnings: [
        { componentId: 'basic', name: 'Basic' },
        { componentId: 'hra', name: 'HRA' },
        { componentId: 'hra', name: 'HRA' },
      ],
    });
    expect(result?.message).toBe('ESIC treatment needed: Basic and HRA (Nov 2026).');
    expect(result?.unclassifiedEarnings).toHaveLength(2);
  });
  it.each([
    'Bearer synthetic-value',
    'https://example.invalid/private',
    'HRA\ninternal',
    'x'.repeat(101),
  ])('falls back safely for unusable earning names: %s', (name) => {
    const result = salaryPreviewError('HR:Payroll:SalaryTemplateSampleBlocked', {
      issues: ['ESI_WAGE_CLASSIFICATION_REQUIRED'],
      effectiveMonth: '2026-99',
      unclassifiedEarnings: [{ componentId: 'hra', name }],
    });
    expect(result?.message).toBe('ESIC treatment is missing for this preview month.');
    expect(result?.unclassifiedEarnings).toEqual([]);
  });
  it('does not invoke metadata accessors or use malformed component identifiers', () => {
    const accessor = Object.defineProperty({}, 'name', {
      get() {
        throw new Error('Must not execute');
      },
    });
    expect(
      salaryPreviewError('HR:Payroll:SalaryTemplateSampleBlocked', {
        issues: ['ESI_WAGE_CLASSIFICATION_REQUIRED'],
        unclassifiedEarnings: [accessor, { componentId: '../outside', name: 'HRA' }],
      })?.unclassifiedEarnings
    ).toEqual([]);
  });
  it.each(['problem', 'abp', 'axios'])(
    'maps classification evidence through %s responses',
    (shape) => {
      const data = { issues: ['ESI_WAGE_CLASSIFICATION_REQUIRED'], message: 'Internal diagnostic' };
      const body =
        shape === 'abp'
          ? { error: { code: 'HR:Payroll:SalaryTemplateSampleBlocked', data } }
          : { errorCode: 'HR:Payroll:SalaryTemplateSampleBlocked', data };
      const error = shape === 'axios' ? { response: { data: body } } : { status: 400, data: body };
      expect(parseApiProblemDetail(error).detail).toBe(
        'ESIC treatment is missing for this preview month.'
      );
      expect(normalizeHrFailure(error)).toMatchObject({
        kind: 'salaryPreview',
        previewAction: 'esiTreatment',
        fields: [],
      });
    }
  );

  it.each([
    undefined,
    null,
    {},
    'ESI_WAGE_CLASSIFICATION_REQUIRED',
    [],
    ['UNKNOWN'],
    ['ESI_WAGE_CLASSIFICATION_REQUIRED', 'UNKNOWN'],
    ['ESI_WAGE_CLASSIFICATION_REQUIRED', 'ESI_COMPONENT_REQUIRED'],
  ])('keeps missing, malformed and mixed blocker evidence in global recovery: %j', (issues) => {
    expect(
      salaryPreviewError('HR:Payroll:SalaryTemplateSampleBlocked', { issues })
    ).toBeUndefined();
    expect(
      normalizeHrFailure({
        status: 400,
        data: {
          errorCode: 'HR:Payroll:SalaryTemplateSampleBlocked',
          data: { issues },
        },
      })
    ).not.toHaveProperty('kind');
  });
});

const allocationCode = 'HR:Payroll:SalaryTemplateAllocationMismatch';
const targetCode = 'HR:Payroll:CompensationTargetNotSolvable';
const excessCode = 'HR:Payroll:SalaryTemplateEarningsExceedGross';

describe('salary preview recovery copy', () => {
  it('keeps structural allocation errors concise without inventing numeric evidence', () => {
    expect(salaryPreviewError(allocationCode)).toEqual({
      message: 'Salary breakdown doesn’t match gross salary.',
      guidance: 'Review the amount or earning rules.',
      fields: ['monthlyAmount', 'rules'],
    });
  });

  it.each([
    [
      { gross: 50000, allocated: 48000, difference: 2000 },
      'Earnings are ₹2,000 below gross salary.',
      'Gross: ₹50,000. Earnings: ₹48,000.',
    ],
    [
      { gross: '50000', allocated: '52000', difference: '-2000' },
      'Earnings are ₹2,000 above gross salary.',
      'Gross: ₹50,000. Earnings: ₹52,000.',
    ],
    [
      { gross: ' 50000.25 ', allocated: '50000', difference: '0.25' },
      'Earnings are ₹0.25 below gross salary.',
      'Gross: ₹50,000.25. Earnings: ₹50,000.',
    ],
  ])('uses validated allocation metadata (%j)', (data, message, details) => {
    expect(salaryPreviewError(allocationCode, data as Record<string, unknown>)).toEqual({
      message,
      details,
      guidance: 'Review the amount or earning rules.',
      fields: ['monthlyAmount', 'rules'],
    });
  });

  it.each([
    [{ gross: 10000, allocated: 9999.999, difference: 0.001 }, 'below', '0.001'],
    [{ gross: '10000', allocated: '10000.001', difference: '-0.001' }, 'above', '0.001'],
    [
      { gross: '10000', allocated: '9999.99999999999999999', difference: '0.00000000000000001' },
      'below',
      '0.00000000000000001',
    ],
  ])(
    'does not hide a subpaise mismatch behind rounded equal totals (%j)',
    (data, direction, exact) => {
      const result = salaryPreviewError(allocationCode, data as Record<string, unknown>);
      expect(result?.message).toBe(`Earnings are less than ₹0.01 ${direction} gross salary.`);
      expect(result?.details).toBe(`Exact difference: ₹${exact} ${direction} gross salary.`);
      expect(result?.message).not.toContain('₹0.00');
      expect(result?.details).not.toContain('Gross:');
    }
  );

  it.each([
    undefined,
    null,
    {},
    { gross: 50000, allocated: 48000 },
    { gross: null, allocated: 48000, difference: 2000 },
    { gross: true, allocated: 48000, difference: 2000 },
    { gross: '', allocated: 48000, difference: 2000 },
    { gross: '   ', allocated: 48000, difference: 2000 },
    { gross: [], allocated: 48000, difference: 2000 },
    { gross: '0x10', allocated: 48000, difference: 2000 },
    { gross: NaN, allocated: 48000, difference: 2000 },
    { gross: 50000, allocated: Infinity, difference: 2000 },
    { gross: -50000, allocated: 48000, difference: 2000 },
    { gross: 50000, allocated: 48000, difference: 0 },
    { gross: 50000, allocated: 48000, difference: -2000 },
    { gross: 1e12, allocated: 0, difference: 1e12 },
    { message: 'Gross is INR 50000; missing INR 2000; Bearer secret' },
  ])('falls back safely for malformed or missing allocation metadata (%j)', (data) => {
    const result = salaryPreviewError(allocationCode, data);
    expect(result?.message).toBe('Salary breakdown doesn’t match gross salary.');
    expect(result?.details).toBeUndefined();
    expect(JSON.stringify(result)).not.toContain('Bearer');
  });

  it('does not inherit allocation metadata from a prototype', () => {
    const data = Object.create({ gross: 50000, allocated: 48000, difference: 2000 });
    expect(salaryPreviewError(allocationCode, data)?.details).toBeUndefined();
  });
  it.each([
    { gross: '10000', allocated: '9999.99999999999999999', difference: '-0.00000000000000001' },
    { gross: '10000', allocated: '10000.00000000000000001', difference: '0.00000000000000001' },
    { gross: '10000', allocated: '9999.990000000000000001', difference: '0.01' },
    { gross: '10000', allocated: '10000.009999999999999999', difference: '-0.01' },
    { gross: '50000.01', allocated: '50000', difference: '0.010000000000000001' },
  ])('does not explain contradictory exact decimal-string evidence (%j)', (data) => {
    const result = salaryPreviewError(allocationCode, data);
    expect(result?.message).toBe('Salary breakdown doesn’t match gross salary.');
    expect(result?.details).toBeUndefined();
  });
  it.each([
    [
      { gross: '10000', allocated: '9999.99999999999999999', difference: '0.00000000000000001' },
      'below',
    ],
    [
      { gross: '10000', allocated: '10000.00000000000000001', difference: '-0.00000000000000001' },
      'above',
    ],
    [
      { gross: '10000', allocated: '9999.990000000000000001', difference: '0.009999999999999999' },
      'below',
    ],
    [
      {
        gross: '10000',
        allocated: '10000.009999999999999999',
        difference: '-0.009999999999999999',
      },
      'above',
    ],
  ])('retains a consistent high-precision string mismatch (%j)', (data, direction) => {
    const result = salaryPreviewError(allocationCode, data as Record<string, unknown>);
    expect(result?.message).toBe(`Earnings are less than ₹0.01 ${direction} gross salary.`);
    expect(result?.details).toContain(` ${direction} gross salary.`);
  });

  it.each([2000, '2000'])('explains positive excess using metadata (%s)', (excess) => {
    expect(salaryPreviewError(excessCode, { excess })?.message).toBe(
      'Earnings are ₹2,000 above gross salary.'
    );
  });
  it('preserves a precise subpaise excess', () => {
    const result = salaryPreviewError(excessCode, { excess: '0.001' });
    expect(result?.message).toBe('Earnings are less than ₹0.01 above gross salary.');
    expect(result?.details).toBe('Exact excess: ₹0.001 above gross salary.');
  });
  it.each([0, -1, null, false, '', 'bad', [], Infinity])(
    'does not fabricate positive excess (%j)',
    (excess) => {
      expect(salaryPreviewError(excessCode, { excess })?.message).toBe(
        'Earning rules exceed gross salary.'
      );
    }
  );

  it.each(['EMPLOYER_COST', 'EmployerCost'])(
    'explains %s without changing the meaning of cost to school',
    (salaryBasis) => {
      const result = salaryPreviewError(targetCode, {
        salaryBasis,
        target: '50000',
        fixedEarnings: '52000',
      });
      expect(result?.message).toBe('Fixed earnings exceed cost to school by ₹2,000.');
      expect(result?.guidance).toBe('Reduce fixed earnings or review the monthly target.');
      expect(result?.details).toBe(
        'Cost to school: ₹50,000. Fixed earnings: ₹52,000, before employer PF/ESIC contributions. Employee deductions do not reduce employer cost.'
      );
    }
  );
  it('does not round a subpaise CTC excess to zero or equal totals', () => {
    const result = salaryPreviewError(targetCode, {
      salaryBasis: 'EmployerCost',
      target: 10000,
      fixedEarnings: 10000.001,
    });
    expect(result?.message).toBe('Fixed earnings are less than ₹0.01 above cost to school.');
    expect(result?.details).toContain('Cost to school: ₹10000. Fixed earnings: ₹10000.001');
  });
  it.each([
    ['50000.01', '50000.02'],
    [50000.01, 50000.02],
    ['0.07', '0.08'],
    [0.07, 0.08],
    ['7e-2', '8e-2'],
  ])(
    'keeps an exact one-paise CTC excess at the decimal boundary (%s to %s)',
    (target, fixedEarnings) => {
      expect(
        salaryPreviewError(targetCode, { salaryBasis: 'EmployerCost', target, fixedEarnings })
          ?.message
      ).toBe('Fixed earnings exceed cost to school by ₹0.01.');
    }
  );
  it.each([
    ['50000', '50000.009999999999999999'],
    ['0.07', '0.079999999999999999'],
    [0.07, 0.07999999999999999],
    ['50000', '50000.001'],
    ['10000', '10000.00000000000000001'],
  ])(
    'does not promote a genuine subpaise CTC difference to a whole paisa (%s to %s)',
    (target, fixedEarnings) => {
      expect(
        salaryPreviewError(targetCode, { salaryBasis: 'EmployerCost', target, fixedEarnings })
          ?.message
      ).toBe('Fixed earnings are less than ₹0.01 above cost to school.');
    }
  );
  it.each(['1e999999999', '1e-999999999', '0e999999999', '0e-999999999', '1e-81'])(
    'bounds decimal evidence exponent parsing (%s)',
    (target) => {
      expect(
        salaryPreviewError(targetCode, { salaryBasis: 'EmployerCost', target, fixedEarnings: '1' })
          ?.message
      ).toBe('The monthly target cannot be reached.');
    }
  );
  it('keeps subpaise excess metadata precise when Number would round it to a whole paisa', () => {
    const result = salaryPreviewError(excessCode, { excess: '0.00999999999999999999' });
    expect(result?.message).toBe('Earnings are less than ₹0.01 above gross salary.');
    expect(result?.details).toBe('Exact excess: ₹0.00999999999999999999 above gross salary.');
  });
  it.each([
    undefined,
    null,
    {},
    { salaryBasis: 'TAKE_HOME', target: 50000, fixedEarnings: 52000 },
    { salaryBasis: 'EMPLOYER_COST', target: 52000, fixedEarnings: 52000 },
    { salaryBasis: 'EMPLOYER_COST', target: null, fixedEarnings: 52000 },
    { salaryBasis: 'EMPLOYER_COST', target: 50000, fixedEarnings: [] },
    { salaryBasis: 'EMPLOYER_COST', target: 50000, fixedEarnings: Infinity },
  ])('keeps target fallback concise without unsafe CTC claims (%j)', (data) => {
    const result = salaryPreviewError(targetCode, data);
    expect(result?.message).toBe('The monthly target cannot be reached.');
    expect(result?.details).toContain('Cost to school includes employer PF/ESIC contributions');
  });

  it.each([
    ['HR:Payroll:PfRuleNotEffective', ['pfRuleId', 'effectiveMonth']],
    ['HR:Payroll:PfRuleNotFound', ['pfRuleId']],
    ['HR:Payroll:SalaryTemplatePfFormulaRequired', ['deductions', 'pfRuleId']],
    ['HR:Payroll:SalaryTemplateRequiresOneBasic', ['rules']],
  ])('retains correction fields for %s', (code, fields) => {
    expect(salaryPreviewError(code)?.fields).toEqual(fields);
    expect(salaryPreviewError(code)?.message.length).toBeLessThan(100);
  });
  it('does not invent a diagnosis for unknown or prototype keys', () => {
    [
      undefined,
      {},
      'Other:Unknown',
      'toString',
      '__proto__',
      'constructor',
      'hasOwnProperty',
    ].forEach((code) => {
      expect(salaryPreviewError(code)).toBeUndefined();
    });
  });

  it.each(['problem', 'abp', 'axios'])(
    'preserves code-driven copy through %s normalization',
    (format) => {
      const data = {
        salaryBasis: 'EMPLOYER_COST',
        target: 50000,
        fixedEarnings: 52000,
        message: 'Bearer secret',
      };
      const body =
        format === 'abp'
          ? {
              error: {
                code: targetCode,
                message: 'One or more business rules were violated.',
                data,
              },
            }
          : { errorCode: targetCode, detail: 'One or more business rules were violated.', data };
      const error =
        format === 'axios'
          ? { response: { data: body }, status: 400 }
          : { status: 400, data: body };
      const parsed = parseApiProblemDetail(error);
      expect(parsed.detail).toBe('Fixed earnings exceed cost to school by ₹2,000.');
      const failure = normalizeHrFailure(error);
      expect(failure.message).toBe(parsed.detail);
      expect(failure.fields).toEqual([]);
    }
  );
});
