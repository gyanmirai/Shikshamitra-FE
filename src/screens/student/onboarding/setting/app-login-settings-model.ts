import type { AppLoginAccess, ReadinessAccessRules } from '../onboarding-settings-model';

export type AppLoginSettingsValues = {
  studentAccess: AppLoginAccess;
  guardianAccess: AppLoginAccess;
  deliveryMode: 'manual' | 'automatic';
  sendingTime: 'activation' | 'completion';
};

export const appLoginAccessOptions = [
  { value: 'not-needed', label: 'Not needed', description: 'No app account is prepared.' },
  {
    value: 'optional',
    label: 'Optional',
    description: 'Create when needed; does not block setup.',
  },
  { value: 'required', label: 'Required', description: 'Account must be ready to complete setup.' },
];

export const appLoginTimingOptions = [
  { value: 'activation', label: 'After student activation' },
  { value: 'completion', label: 'After setup is complete' },
];

const readAccess = (access: AppLoginAccess | undefined, required: boolean): AppLoginAccess =>
  appLoginAccessOptions.some((option) => option.value === access)
    ? access!
    : required
      ? 'required'
      : 'not-needed';

export const getAppLoginSettingsValues = (rules: ReadinessAccessRules): AppLoginSettingsValues => ({
  studentAccess: readAccess(rules.studentAccountAccess, rules.studentAccount),
  guardianAccess: readAccess(rules.guardianAccountAccess, rules.guardianAccount),
  deliveryMode: rules.credentialProvisioningMode ?? 'manual',
  sendingTime: rules.credentialSendingTime ?? 'activation',
});

export const applyAppLoginSettingsValues = (
  rules: ReadinessAccessRules,
  values: AppLoginSettingsValues
): ReadinessAccessRules => ({
  ...rules,
  studentAccountAccess: values.studentAccess,
  guardianAccountAccess: values.guardianAccess,
  studentAccount: values.studentAccess === 'required',
  guardianAccount: values.guardianAccess === 'required',
  credentialProvisioningMode: values.deliveryMode,
  // Manual Send Credentials means staff chooses when to release the email.
  credentialSendingTime: values.deliveryMode === 'automatic' ? values.sendingTime : 'activation',
  sendStudentCredentialEmail:
    values.deliveryMode === 'automatic' && values.studentAccess !== 'not-needed',
  sendGuardianCredentialEmail:
    values.deliveryMode === 'automatic' && values.guardianAccess !== 'not-needed',
});
