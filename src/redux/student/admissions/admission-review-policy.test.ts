import { it, expect, describe } from 'vitest';

import { getReviewConfigurationError } from './admission-review-validation';
import {
  DEFAULT_REVIEW_POLICY,
  readAdmissionReviewPolicy,
  writeAdmissionReviewPolicy,
} from './admission-review-policy';

const json = (review: unknown) => JSON.stringify({ review });
describe('managed review policy', () => {
  it.each([
    '3a23fde8-e828-85d1-26e0-55e29d527b88',
    '3A23FDE8-E828-85D1-26E0-55E29D527B88',
    '11111111-1111-4111-8111-111111111111',
    null,
  ])('accepts backend reviewer GUIDs and an unassigned reviewer: %s', (assignedReviewerId) => {
    expect(
      getReviewConfigurationError(json({ ...DEFAULT_REVIEW_POLICY, assignedReviewerId }))
    ).toBeUndefined();
  });

  it.each([
    '00000000-0000-0000-0000-000000000000',
    '3a23fde8-e828-85d1-26e0-55e29d527b8',
    '3a23fde8-e828-85d1-26e0-55e29d527b8z',
    '',
  ])('rejects empty and malformed reviewer GUIDs: %s', (assignedReviewerId) => {
    expect(
      getReviewConfigurationError(json({ ...DEFAULT_REVIEW_POLICY, assignedReviewerId }))
    ).toBe('Choose a valid assigned reviewer.');
  });

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
