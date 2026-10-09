import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { it, expect } from 'vitest';

import {
  hasOfferingReadinessConflict,
  buildOfferingReadinessProfile,
} from './offering-readiness-model';
import {
  findOnboardingProfile,
  defaultOnboardingSettings,
  defaultOnboardingProfiles,
  getEffectiveReadinessRules,
  defaultReadinessAccessRules,
} from '../onboarding-settings-model';

const offering = {
  id: 'cbse-english-1',
  name: 'CBSE English Class 1',
  boardId: 'cbse',
  mediumId: 'english',
  standardId: 'class-1',
  stageId: 'primary',
} as AdmissionOfferingListItem;

it('uses Offering identity even when routes and academic paths differ', () => {
  const profile = buildOfferingReadinessProfile(
    defaultOnboardingProfiles[0],
    'Class 1 readiness',
    [offering],
    defaultReadinessAccessRules
  );
  expect(
    findOnboardingProfile([profile], 'Transfer student', { boardId: 'changed' }, offering.id)
  ).toBe(profile);
  expect(findOnboardingProfile([profile], 'Fresh admission', {}, 'unlinked')).toBeUndefined();
  expect(() =>
    getEffectiveReadinessRules(
      { ...defaultOnboardingSettings, onboardingProfiles: [profile] },
      'Fresh admission',
      {},
      'unlinked'
    )
  ).toThrow('exactly one readiness rule');
});

it('rejects multiple effective rules for one Offering rather than choosing an arbitrary rule', () => {
  const profile = buildOfferingReadinessProfile(
    defaultOnboardingProfiles[0],
    'First',
    [offering],
    defaultReadinessAccessRules
  );
  const second = { ...profile, id: 'second' };
  expect(hasOfferingReadinessConflict([profile], second.id, [offering.id])).toBe(true);
  expect(hasOfferingReadinessConflict([profile], profile.id, [offering.id])).toBe(false);
  expect(findOnboardingProfile([profile, second], '', {}, offering.id)).toBeUndefined();
  expect(() =>
    getEffectiveReadinessRules(
      { ...defaultOnboardingSettings, onboardingProfiles: [profile, second] },
      '',
      {},
      offering.id
    )
  ).toThrow('exactly one readiness rule');
});

it('derives academic context, enforces activation checks and prepares only selected email recipients', () => {
  const profile = buildOfferingReadinessProfile(
    defaultOnboardingProfiles[0],
    '  New readiness  ',
    [offering],
    {
      ...defaultReadinessAccessRules,
      requireDocuments: false,
      requireIdentifiers: false,
      blockActivation: false,
      sendStudentCredentialEmail: false,
      sendGuardianCredentialEmail: true,
      credentialSendingTime: 'completion',
      deliveryTiming: 'manual-release',
      checks: defaultReadinessAccessRules.checks.map((check) => ({
        ...check,
        required: false,
        blocking: false,
      })),
    }
  );
  expect(profile).toMatchObject({
    name: 'New readiness',
    offeringIds: [offering.id],
    admissionRoutes: [],
  });
  expect(profile.applicability).toMatchObject({
    boardIds: ['cbse'],
    academicMediumIds: ['english'],
    standardIds: ['class-1'],
    stageMode: 'all',
    divisionMode: 'all',
  });
  expect(profile.rules).toMatchObject({
    requireDocuments: true,
    requireIdentifiers: true,
    blockActivation: true,
    studentAccount: false,
    guardianAccount: true,
    credentialSendingTime: 'activation',
    deliveryTiming: 'after-activation',
  });
  expect(
    profile.rules.checks
      .filter((check) => check.key !== 'accounts')
      .every((check) => check.required && check.blocking)
  ).toBe(true);
  expect(profile.rules.checks.find((check) => check.key === 'accounts')?.blocking).toBe(false);
});
