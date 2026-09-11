import { it, expect, describe } from 'vitest';

import { getReviewConfigurationError } from './admission-review-validation';
import {
  DEFAULT_REVIEW_POLICY,
  readAdmissionReviewPolicy,
  writeAdmissionReviewPolicy,
} from './admission-review-policy';

const json = (review: unknown) => JSON.stringify({ review });
describe('managed review policy', () => {
  it('round-trips a minimal backend-valid policy using optional defaults', () => {
    const original = JSON.stringify({
      layout: 'compact',
      review: { version: 1, enabled: true, futureOption: 'kept' },
    });
    const policy = readAdmissionReviewPolicy(original);
    expect(policy).toMatchObject(DEFAULT_REVIEW_POLICY);
    expect(getReviewConfigurationError(original)).toBeUndefined();
    expect(
      JSON.parse(writeAdmissionReviewPolicy(original, { ...policy!, dueInDays: 4 }))
    ).toMatchObject({
      layout: 'compact',
      review: { ...DEFAULT_REVIEW_POLICY, dueInDays: 4, futureOption: 'kept' },
    });
    expect(
      readAdmissionReviewPolicy(
        json({ version: 1, enabled: true, checklist: [{ code: 'CHECK', name: 'Identity' }] })
      )?.checklist[0].required
    ).toBe(false);
  });
  it('keeps missing settings basic and preserves sibling settings and future same-version fields', () => {
    expect(readAdmissionReviewPolicy()).toBeNull();
    expect(getReviewConfigurationError()).toBeUndefined();
    const original = JSON.stringify({
      layout: 'compact',
      review: { ...DEFAULT_REVIEW_POLICY, futureOption: 'kept' },
    });
    const saved = writeAdmissionReviewPolicy(original, { ...DEFAULT_REVIEW_POLICY, dueInDays: 5 });
    expect(JSON.parse(saved)).toMatchObject({
      layout: 'compact',
      review: { dueInDays: 5, futureOption: 'kept' },
    });
    expect(
      readAdmissionReviewPolicy(json({ ...DEFAULT_REVIEW_POLICY, enabled: false }))?.enabled
    ).toBe(false);
  });

  it.each([
    null,
    { ...DEFAULT_REVIEW_POLICY, version: 2 },
    { ...DEFAULT_REVIEW_POLICY, checklist: null },
    { version: 1, enabled: true, requireIndependentApprover: null },
  ])('preserves unsupported or incomplete saved policy without replacing it', (policy) => {
    expect(getReviewConfigurationError(json(policy))).toContain('preserved');
    expect(() => writeAdmissionReviewPolicy(json(policy), DEFAULT_REVIEW_POLICY)).toThrow(
      'unsupported'
    );
  });

  it.each([
    { dueInDays: 0 },
    { dueInDays: 366 },
    { dueInDays: 1.5 },
    { assignedReviewerId: 'invalid' },
    { reviewerRole: ' ' },
    { checklist: [{ code: 'bad code', name: 'Identity', required: true }] },
    { checklist: [{ code: 'CHECK', name: ' ', required: true }] },
    {
      prerequisites: [
        { kind: 'documents', sourceStageCode: 'DOCS' },
        { kind: 'documents', sourceStageCode: 'DOCS' },
      ],
    },
  ])('rejects invalid enabled settings %j', (change) => {
    expect(getReviewConfigurationError(json({ ...DEFAULT_REVIEW_POLICY, ...change }))).toBeTruthy();
  });

  it('accepts optional evidence and checklist with a bounded due date', () => {
    expect(
      getReviewConfigurationError(
        json({
          ...DEFAULT_REVIEW_POLICY,
          dueInDays: 365,
          checklist: [{ code: 'IDENTITY', name: 'Identity confirmed', required: false }],
        })
      )
    ).toBeUndefined();
  });
});
