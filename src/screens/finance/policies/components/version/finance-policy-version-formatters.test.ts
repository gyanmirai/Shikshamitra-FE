import { it, expect, describe } from 'vitest';

import {
  deserializeVersionValue,
  formatFinancePolicyVersionField,
  formatVersionTimestamp,
  formatFinancePolicyVersionValue,
} from './finance-policy-version-formatters';

describe('finance policy version formatters', () => {
  it('deserializes snapshot strings without leaving JSON quotes in the UI', () => {
    expect(deserializeVersionValue('"concession policy 1"')).toBe('concession policy 1');
    expect(formatFinancePolicyVersionValue('PolicyName', '"concession policy 1"')).toEqual({
      kind: 'text',
      text: 'concession policy 1',
    });
  });

  it.each([
    ['Status', 1, 'Active', 'status'],
    ['ValueSource', 1, 'Request Entered Within Limits', 'text'],
    ['CalculationMethod', 0, 'Percentage', 'text'],
    ['FeeHeadScope', 0, 'Entire Fee Structure', 'text'],
    ['ApplyOn', 0, 'All Outstanding Fees', 'text'],
    ['RoundingMethod', 0, 'None', 'text'],
  ])('formats the numeric %s enum', (field, value, text, kind) => {
    expect(formatFinancePolicyVersionValue(field, value)).toEqual({ kind, text });
  });

  it('keeps valid zero and false values instead of treating them as empty', () => {
    expect(formatFinancePolicyVersionValue('AllowMultipleConcessions', false)).toEqual({
      kind: 'boolean',
      text: 'No',
    });
    expect(formatFinancePolicyVersionValue('MaximumPercentage', 0)).toEqual({
      kind: 'text',
      text: '0%',
    });
  });

  it('keeps status labels distinct from record references with matching keys', () => {
    expect(
      formatFinancePolicyVersionValue('Status', 'Draft', {
        labelsById: { draft: 'Financial support policy' },
      })
    ).toEqual({ kind: 'status', text: 'Draft' });
  });

  it('uses friendly names for known ids and arrays', () => {
    const context = {
      labelsById: {
        'policy-id': 'Sibling concession policy',
        'year-id': '2026-27',
        'fee-head-id': 'Tuition Fee',
      },
    };

    expect(formatFinancePolicyVersionField('PolicyId')).toBe('Policy');
    expect(formatFinancePolicyVersionField('AcademicYearId')).toBe('Academic Year');
    expect(formatFinancePolicyVersionValue('PolicyId', '"policy-id"', context).text).toBe(
      'Sibling concession policy'
    );
    expect(formatFinancePolicyVersionValue('AcademicYearId', 'year-id', context).text).toBe(
      '2026-27'
    );
    expect(
      formatFinancePolicyVersionValue('ApplicableFeeHeadIds', '["fee-head-id"]', context).text
    ).toBe('Tuition Fee');
    expect(formatFinancePolicyVersionValue('ApplicableFeeHeadIds', '[]', context).text).toBe(
      'None'
    );
  });

  it('formats collection policy fee heads and effective calendar dates', () => {
    const context = {
      labelsById: {
        '3a23e578-2df7-465b-477d-80bf033233e3': 'FH 1',
        '3a23e578-3032-dd30-bce1-f2a9827af9a1': 'FH 2',
      },
    };

    expect(
      formatFinancePolicyVersionValue(
        'LateFeeApplyOnFeeHeads',
        '["3a23e578-2df7-465b-477d-80bf033233e3","3a23e578-3032-dd30-bce1-f2a9827af9a1"]',
        context
      ).text
    ).toBe('FH 1, FH 2');
    expect(
      formatFinancePolicyVersionValue(
        'LateFeeApplyOnFeeHeads',
        '["3a23e578-2df7-465b-477d-80bf033233e3"]'
      ).text
    ).toBe('Fee head unavailable');
    expect(formatFinancePolicyVersionValue('EffectiveFrom', '2026-06-01T00:00:00+00:00').text).toBe(
      '01-06-2026'
    );
    expect(formatFinancePolicyVersionValue('EffectiveTo', '2027-05-31T00:00:00+00:00').text).toBe(
      '31-05-2027'
    );
    expect(formatVersionTimestamp('2026-09-28T17:32:00+00:00')).toMatch(
      /^\d{2}-\d{2}-2026 \d{2}:\d{2} (AM|PM)$/
    );
  });
});
