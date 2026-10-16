import type { TenantPasswordPolicy } from 'src/redux/host-tenants/password-policy';
import type { HostTenant, TenantDetails, CreateTenantInput } from 'src/redux/host-tenants/types';

import * as Yup from 'yup';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { normalizePermissionDeniedError } from 'src/utils/permission-denied';

import { tenantPasswordSchema } from './tenant-password';

export type TenantFormValues = Required<CreateTenantInput>;
export const emptyTenant: TenantFormValues = {
  name: '',
  instituteName: '',
  email: '',
  contactNumber: '',
  address1: '',
  address2: '',
  address3: '',
  city: '',
  state: '',
  country: 'India',
  postalCode: '',
  adminEmailAddress: '',
  adminPassword: '',
};
export const tenantFormValues = (tenant?: HostTenant): TenantFormValues =>
  tenant
    ? {
        ...emptyTenant,
        ...tenant,
        address2: tenant.address2 ?? '',
        address3: tenant.address3 ?? '',
      }
    : { ...emptyTenant };
export const tenantDetails = (values: TenantFormValues): TenantDetails => ({
  instituteName: values.instituteName.trim(),
  email: values.email.trim(),
  contactNumber: values.contactNumber.trim(),
  address1: values.address1.trim(),
  address2: values.address2?.trim(),
  address3: values.address3?.trim(),
  city: values.city.trim(),
  state: values.state.trim(),
  country: values.country.trim(),
  postalCode: values.postalCode.trim(),
});
const requiredText = (label: string, max: number) =>
  Yup.string().trim().max(max, `${label} is too long`).required(`${label} is required`);
export const tenantSchema = (creating: boolean, policy?: TenantPasswordPolicy) =>
  Yup.object({
    name: requiredText('School code', 64).matches(
      /^[A-Za-z0-9][A-Za-z0-9_-]*$/,
      'Use letters, numbers, underscores or hyphens'
    ),
    instituteName: requiredText('Institute name', 256),
    email: requiredText('Institute email', 256).email('Enter a valid institute email'),
    contactNumber: requiredText('Contact number', 32),
    address1: requiredText('Address', 256),
    address2: Yup.string().max(256),
    address3: Yup.string().max(256),
    city: requiredText('City', 128),
    state: requiredText('State', 128),
    country: requiredText('Country', 128),
    postalCode: requiredText('Postal code', 20),
    adminEmailAddress: creating
      ? requiredText('Administrator email', 256).email('Enter a valid administrator email')
      : Yup.string(),
    adminPassword: creating ? tenantPasswordSchema(policy) : Yup.string(),
  });

export function tenantError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Unable to save the tenant. Please retry.';
  const failure = error as {
    status?: number;
  };
  if (failure.status === 409)
    return 'The tenant changed since you opened it. Reload the latest details and try again.';
  const { detail } = parseApiProblemDetail(
    normalizePermissionDeniedError(error, {
      operation: 'manage schools',
      administrator: 'platform administrator',
    })
  );
  return detail === 'Something went wrong' ? 'Unable to save the tenant. Please retry.' : detail;
}
