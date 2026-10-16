import { it, expect } from 'vitest';

import { defaultReadinessAccessRules } from '../onboarding-settings-model';
import { getAppLoginSettingsValues, applyAppLoginSettingsValues } from './app-login-settings-model';

it('preserves legacy access choices and defaults missing delivery preferences to manual', () => {
  const legacy = { ...defaultReadinessAccessRules, studentAccount: false, guardianAccount: true };
  expect(getAppLoginSettingsValues(legacy)).toEqual({
    studentAccess: 'not-needed',
    guardianAccess: 'required',
    deliveryMode: 'manual',
    sendingTime: 'activation',
  });
  expect(getAppLoginSettingsValues({ ...legacy, studentAccount: true }).studentAccess).toBe(
    'required'
  );
});

it('round-trips optional access independently from the legacy required flag', () => {
  const saved = applyAppLoginSettingsValues(defaultReadinessAccessRules, {
    studentAccess: 'optional',
    guardianAccess: 'required',
    deliveryMode: 'manual',
    sendingTime: 'completion',
  });
  expect(saved).toMatchObject({
    studentAccountAccess: 'optional',
    studentAccount: false,
    guardianAccountAccess: 'required',
    guardianAccount: true,
    sendStudentCredentialEmail: false,
    sendGuardianCredentialEmail: false,
    credentialSendingTime: 'activation',
  });
  expect(getAppLoginSettingsValues(saved)).toEqual({
    studentAccess: 'optional',
    guardianAccess: 'required',
    deliveryMode: 'manual',
    sendingTime: 'activation',
  });
  expect(saved.checks).toEqual(defaultReadinessAccessRules.checks);
  expect(saved.approvalTriggers).toEqual(defaultReadinessAccessRules.approvalTriggers);
});

it('enables automatic emails only for available accounts and preserves the chosen timing', () => {
  const saved = applyAppLoginSettingsValues(defaultReadinessAccessRules, {
    studentAccess: 'not-needed',
    guardianAccess: 'optional',
    deliveryMode: 'automatic',
    sendingTime: 'completion',
  });
  expect(saved).toMatchObject({
    studentAccount: false,
    guardianAccount: false,
    sendStudentCredentialEmail: false,
    sendGuardianCredentialEmail: true,
    credentialProvisioningMode: 'automatic',
    credentialSendingTime: 'completion',
  });
});
