import type { TenantPasswordPolicy } from 'src/redux/host-tenants/password-policy';

import * as Yup from 'yup';

const characterRules = [
  { key: 'requireLowercase', pattern: /[a-z]/, label: 'a lowercase letter' },
  { key: 'requireUppercase', pattern: /[A-Z]/, label: 'an uppercase letter' },
  { key: 'requireDigit', pattern: /[0-9]/, label: 'a digit' },
  { key: 'requireNonAlphanumeric', pattern: /[^a-zA-Z0-9]/, label: 'a special character' },
] as const;

export function tenantPasswordSchema(policy?: TenantPasswordPolicy) {
  const length = policy?.requiredLength ?? 8;
  let schema = Yup.string()
    .required('Initial password is required')
    .min(length, `Use at least ${length} characters`)
    .max(128, 'Use at most 128 characters');
  if (!policy) return schema;
  characterRules.forEach(({ key, pattern, label }) => {
    if (policy[key]) schema = schema.matches(pattern, `Include ${label}`);
  });
  if (policy.requiredUniqueChars > 1)
    schema = schema.test(
      'unique-characters',
      `Use at least ${policy.requiredUniqueChars} different characters`,
      (value) => new Set(value?.split('')).size >= policy.requiredUniqueChars
    );
  return schema;
}

export function tenantPasswordHelp(policy?: TenantPasswordPolicy) {
  if (!policy) return 'Loading password requirements…';
  const parts: string[] = characterRules.filter(({ key }) => policy[key]).map(({ label }) => label);
  if (policy.requiredUniqueChars > 1)
    parts.push(`at least ${policy.requiredUniqueChars} different characters`);
  return `At least ${policy.requiredLength} characters${parts.length ? `; include ${parts.join(', ')}` : ''}.`;
}
