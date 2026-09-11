import { it, expect, describe } from 'vitest';

import { evaluateAdmissionRule, isAdmissionRuleVisible } from './admission-visibility-rules';

describe('admission visibility rules', () => {
  it('supports nested ALL and ANY expressions', () => {
    expect(evaluateAdmissionRule({ operator: 'ALL', conditions: [
      { field: 'Applicant.Age', operator: 'GreaterThanOrEqual', value: 5 },
      { operator: 'ANY', conditions: [
        { field: 'Applicant.Gender', operator: 'Equals', value: 'Female' },
        { field: 'Applicant.Category', operator: 'In', value: ['General', 'OBC'] },
      ] },
    ] }, { 'Applicant.Age': '6', 'Applicant.Category': 'OBC' })).toBe(true);
  });

  it('fails closed for malformed or unsupported rules', () => {
    expect(isAdmissionRuleVisible('{bad json', {})).toBe(false);
    expect(evaluateAdmissionRule({ field: 'x', operator: 'Execute', value: 'y' }, { x: 'y' })).toBe(false);
  });

  it('supports text operators shared by form and workflow rules', () => {
    expect(evaluateAdmissionRule({ field: 'CODE', operator: 'StartsWith', value: 'AD' }, { CODE: 'ADMISSION' })).toBe(true);
    expect(evaluateAdmissionRule({ field: 'CODE', operator: 'EndsWith', value: 'ION' }, { CODE: 'ADMISSION' })).toBe(true);
    expect(evaluateAdmissionRule({ field: 'CODE', operator: 'NotContains', value: 'TEST' }, { CODE: 'ADMISSION' })).toBe(true);
  });
});
