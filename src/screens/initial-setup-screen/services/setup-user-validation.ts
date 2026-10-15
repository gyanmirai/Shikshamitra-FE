import type { TenantPasswordPolicy } from 'src/redux/host-tenants/password-policy';

import * as Yup from 'yup';
import {
  tenantPasswordHelp,
  tenantPasswordSchema,
} from 'src/screens/host-tenants/services/tenant-password';

export type SetupUserValues = {
  userName: string;
  email: string;
  password: string;
  roleNames: string[];
};
export type SetupUserErrors = Partial<Record<keyof SetupUserValues, string>>;

export function setupUserSchema(policy?: TenantPasswordPolicy) {
  return Yup.object({
    userName: Yup.string()
      .trim()
      .required('User name is required')
      .min(3, 'Username must be at least 3 characters long and contain no spaces.')
      .matches(/^\S+$/, 'Username must be at least 3 characters long and contain no spaces.')
      .max(256, 'Use at most 256 characters'),
    email: Yup.string()
      .trim()
      .required('Email is required')
      .email('Please enter a valid email address (e.g., name@school.com).')
      .max(256, 'Use at most 256 characters'),
    password: tenantPasswordSchema(policy),
    roleNames: Yup.array().of(Yup.string()),
  });
}

export function setupPasswordFeedback(value: string, policy?: TenantPasswordPolicy) {
  if (!value || !policy) return tenantPasswordHelp(policy);
  try {
    tenantPasswordSchema(policy).validateSync(value, { abortEarly: false });
    return 'Password meets all requirements.';
  } catch (error) {
    return error instanceof Yup.ValidationError
      ? `${error.errors.join('; ')}.`
      : tenantPasswordHelp(policy);
  }
}
