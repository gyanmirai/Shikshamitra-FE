import { it, expect, describe } from 'vitest';

import { getInquiryConfigurationError } from './admission-inquiry-validation';
import {
  DEFAULT_INQUIRY_POLICY,
  readAdmissionInquiryPolicy,
  writeAdmissionInquiryPolicy,
} from './admission-inquiry-policy';

const json = (inquiry: unknown) => JSON.stringify({ inquiry });

describe('managed inquiry policy', () => {
  it('keeps missing configuration in the basic flow and preserves sibling and future settings', () => {
    expect(readAdmissionInquiryPolicy()).toBeNull();
    expect(getInquiryConfigurationError()).toBeUndefined();
    const original = JSON.stringify({
      layout: 'compact',
      inquiry: { version: 1, enabled: true, future: 'kept' },
    });
    const policy = readAdmissionInquiryPolicy(original);
    const saved = writeAdmissionInquiryPolicy(original, { ...policy!, qualificationDueInDays: 5 });
    expect(JSON.parse(saved)).toMatchObject({
      layout: 'compact',
      inquiry: { future: 'kept', qualificationDueInDays: 5 },
    });
  });

  it.each([
    { assignmentMode: 1, counsellorPoolUserIds: [] },
    { firstContactDueInHours: 0 },
    { qualificationDueInDays: 366 },
    { followUpDueInDays: 91 },
    { maxOpenFollowUps: 21 },
    { allowedSources: [0], requireSourceDetailFor: [3] },
    { qualificationChecklist: [{ code: 'bad code', name: 'Identity', required: true }] },
  ])('rejects invalid managed settings %j', (change) => {
    expect(
      getInquiryConfigurationError(json({ ...DEFAULT_INQUIRY_POLICY, ...change }))
    ).toBeTruthy();
  });

  it('accepts round robin, source rules and a qualification checklist', () => {
    expect(
      getInquiryConfigurationError(
        json({
          ...DEFAULT_INQUIRY_POLICY,
          assignmentMode: 1,
          counsellorPoolUserIds: ['11111111-1111-4111-8111-111111111111'],
          allowedSources: [0, 3],
          requireSourceDetailFor: [3],
          qualificationChecklist: [
            { code: 'AGE', name: 'Age eligibility confirmed', required: true },
          ],
        })
      )
    ).toBeUndefined();
  });

  it('preserves unreadable same-version settings', () => {
    const value = json({ ...DEFAULT_INQUIRY_POLICY, allowedSources: null });
    expect(getInquiryConfigurationError(value)).toContain('preserved');
    expect(() => writeAdmissionInquiryPolicy(value, DEFAULT_INQUIRY_POLICY)).toThrow('unsupported');
  });
});
