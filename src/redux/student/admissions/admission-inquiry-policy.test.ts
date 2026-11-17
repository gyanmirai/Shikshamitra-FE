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
    { firstContactDueInHours: 0 },
    { qualificationDueInDays: 366 },
    { followUpDueInDays: 91 },
    { maxOpenFollowUps: 21 },
    { qualificationChecklist: [{ code: 'bad code', name: 'Identity', required: true }] },
  ])('rejects invalid managed settings %j', (change) => {
    expect(
      getInquiryConfigurationError(json({ ...DEFAULT_INQUIRY_POLICY, ...change }))
    ).toBeTruthy();
  });

  it('preserves allowed sources and a qualification checklist while retiring legacy routing', () => {
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

  it.each([
    { counsellorPoolUserIds: [] },
    { counsellorPoolUserIds: ['11111111-1111-4111-8111-111111111111'] },
  ])(
    'retires legacy intake gates and routing while preserving timing and allowed sources (%j)',
    ({ counsellorPoolUserIds }) => {
      const legacyPolicy: typeof DEFAULT_INQUIRY_POLICY = {
        ...DEFAULT_INQUIRY_POLICY,
        applicationStartRequirement: 2,
        duplicateRule: 2,
        requireGuardianEmail: true,
        requireApplicantDateOfBirth: true,
        assignmentMode: 1,
        defaultCounsellorId: '11111111-1111-4111-8111-111111111111',
        counsellorPoolUserIds,
        restrictActionsToAssignedCounsellor: true,
        allowedSources: [0],
        requireSourceDetailFor: [3],
        firstContactDueInHours: 12,
      };
      const original = json(legacyPolicy);
      const policy = readAdmissionInquiryPolicy(original)!;
      expect(policy).toMatchObject({
        applicationStartRequirement: 0,
        duplicateRule: 1,
        requireGuardianEmail: false,
        requireApplicantDateOfBirth: false,
        requireSourceDetailFor: [],
        assignmentMode: 0,
        defaultCounsellorId: null,
        counsellorPoolUserIds: [],
        restrictActionsToAssignedCounsellor: false,
        allowedSources: [0],
        firstContactDueInHours: 12,
      });
      expect(getInquiryConfigurationError(original)).toBeUndefined();
      expect(JSON.parse(writeAdmissionInquiryPolicy(original, legacyPolicy)).inquiry).toMatchObject(
        policy
      );
    }
  );
});
