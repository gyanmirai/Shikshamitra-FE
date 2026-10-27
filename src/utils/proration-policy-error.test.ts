import { it, expect, describe } from 'vitest';

import { parseApiProblemDetail } from './api-problem-details';

describe('proration policy action errors', () => {
  it.each(['problem', 'abp'])('explains archived clone-name conflicts in %s responses', (format) => {
    const code = 'Finance:ProrationPolicy:010005';
    const businessData = { Name: 'Admission Copy', Location: 'Archived' };
    const data = format === 'problem'
      ? { errorCode: code, detail: 'One or more business rules were violated.', data: businessData }
      : { error: { code, message: 'One or more business rules were violated.', data: businessData } };
    const result = parseApiProblemDetail({ status: 400, data });
    expect(result.detail).toContain('Admission Copy');
    expect(result.detail).toContain('Archived');
    expect(result.detail).toContain('different name');
    expect(result.errorCode).toBe(code);
  });

  it.each([
    ['010006', 'different code'],
    ['010007', 'Draft or Active'],
    ['010013', 'fee head'],
    ['010014', 'Review'],
    ['010020', 'default'],
    ['010025', 'Active'],
    ['010026', 'another Active'],
    ['010027', 'reactivate'],
  ])('provides a corrective action for generic proration error %s', (code, action) => {
    expect(parseApiProblemDetail({ status: 400, data: {
      errorCode: `Finance:ProrationPolicy:${code}`,
      detail: 'One or more business rules were violated.',
    } }).detail).toContain(action);
  });

  it('preserves the specific server rule and corrective action', () => {
    const detail = 'Transport fee is inactive. Reactivate it before cloning this policy.';
    expect(parseApiProblemDetail({ status: 400, data: {
      errorCode: 'Finance:ProrationPolicy:010027', detail,
    } }).detail).toBe(detail);
  });

  it('uses the corrective rule instead of a generic HTTP title', () => {
    const result = parseApiProblemDetail({ status: 400, data: {
      errorCode: 'Finance:ProrationPolicy:010005',
      detail: 'One or more business rules were violated.', title: 'Bad Request',
      data: { Name: 'Copy', Location: 'Archived' },
    } });
    expect(result.detail).toContain('Copy');
    expect(result.detail).toContain('Archived');
    expect(result.detail).toContain('different name');
  });

  it('preserves the server reason when a generic HTTP title is also present', () => {
    const reason = 'Transport fee is inactive. Reactivate it before cloning this policy.';
    expect(parseApiProblemDetail({ status: 400, data: {
      errorCode: 'Finance:ProrationPolicy:010027',
      detail: 'One or more business rules were violated.', title: 'Bad Request',
      data: { Reason: reason },
    } }).detail).toBe(reason);
  });

  it('explains that every head must be valid when an older API uses FeeHeadRequired', () => {
    expect(parseApiProblemDetail({ status: 400, data: {
      errorCode: 'Finance:ProrationPolicy:010013',
      detail: 'One or more business rules were violated.', title: 'Bad Request',
    } }).detail).toContain('every selected fee head');
  });
});
