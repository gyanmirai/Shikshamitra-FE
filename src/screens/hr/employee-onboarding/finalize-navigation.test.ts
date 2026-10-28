import { it, expect } from 'vitest';
import { hrPaths } from 'src/constants/hr-menus';

import {
  onboardingReturnHref,
  onboardingFinalizeHref,
  isEmployeeApplicationId,
  readOnboardingListContext,
  resolveOnboardingReturnHref,
} from './finalize-navigation';

const id = '11111111-1111-1111-1111-111111111111';
const origin = 'https://school.example';

it('round-trips the actual list/search/status/page and optional application context', () => {
  const context = { page: 3, pageSize: 25, search: 'Synthetic staff & team', status: '5' };
  const back = onboardingReturnHref(context, id);
  const target = new URL(onboardingFinalizeHref(id, back), origin);
  expect(target.pathname).toBe(`${hrPaths.employee.onboarding}/${id}/finalize`);
  const resolved = resolveOnboardingReturnHref(target.searchParams.get('returnTo'), origin);
  const params = Object.fromEntries(new URL(resolved, origin).searchParams);
  expect(readOnboardingListContext(params)).toEqual(context);
  expect(params.application).toBe(id);
});

it.each([
  'https://evil.example/hr/employee/onboarding',
  '//evil.example/hr/employee/onboarding',
  // eslint-disable-next-line no-script-url -- malicious return target must be rejected
  'javascript:alert(1)',
  '/hr/employee',
  '/hr/employee/onboarding/other/finalize',
  'https://user:password@school.example/hr/employee/onboarding',
])('rejects unsafe or unrelated return navigation %s', (href) => {
  expect(resolveOnboardingReturnHref(href, origin)).toBe(hrPaths.employee.onboarding);
});

it('drops unknown and recursive query fields instead of carrying arbitrary draft data or redirects', () => {
  const href = resolveOnboardingReturnHref(
    '/hr/employee/onboarding/?page=-1&pageSize=9000&status=no&application=bad&bankAccount=private&returnTo=https://evil.example',
    origin
  );
  expect(href).toBe(`${hrPaths.employee.onboarding}?page=1&pageSize=10`);
});

it('accepts Guid identifiers without restricting the Guid version and rejects path fragments', () => {
  expect(isEmployeeApplicationId(id)).toBe(true);
  expect(isEmployeeApplicationId('ABCDEFAB-1234-ABCD-5678-ABCDEFABCDEF')).toBe(true);
  expect(isEmployeeApplicationId('../employee-applications')).toBe(false);
  expect(isEmployeeApplicationId(`${id}/../staff`)).toBe(false);
});
