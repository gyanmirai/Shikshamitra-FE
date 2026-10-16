import { it, expect } from 'vitest';

import { parseApiProblemDetail } from './api-problem-details';
import { tenantError } from '../screens/host-tenants/services/tenant-form';
import { setupError } from '../screens/initial-setup-screen/services/setup-error';

const generic = "You don't have permission to access this resource.";
const fallback = 'Your account cannot complete this action. Ask your administrator to review your permissions and assigned data access, then try again.';

it.each([
  { status: 403, data: { detail: generic } },
  { status: 403, data: { message: generic } },
  { status: 403, detail: generic, data: { requestId: 'retained' } },
  { response: { status: 403, data: { error: { code: 'Volo.Authorization:010002', message: generic } } } },
  generic,
])('gives recovery guidance for every shared parser envelope %#', (error) => {
  expect(parseApiProblemDetail(error).detail).toBe(fallback);
});

it('preserves bare problem details that contain their own metadata', () => {
  expect(parseApiProblemDetail({
    status: 403, title: 'Forbidden', detail: 'This record is outside your assigned classes.',
    errorCode: 'UserScope:AccessDenied', data: { requestId: 'kept' },
  })).toEqual({ detail: 'This record is outside your assigned classes.', errorCode: 'UserScope:AccessDenied' });
});

it('does not let a generic validation wrapper replace contextual access guidance', () => {
  expect(parseApiProblemDetail({ status: 403, data: {
    detail: generic, validationErrors: [{ message: generic }],
  } }).detail).toBe(fallback);
});

it('gives initial-setup and platform-management errors their own recovery context', () => {
  expect(setupError({ status: 403 })).toContain('cannot change institute setup. Ask your administrator');
  expect(tenantError({ status: 403 })).toContain('cannot manage schools. Ask your platform administrator');
});

it.each([setupError, tenantError])('preserves specific server403 explanations in custom handlers', (handler) => {
  expect(handler({ status: 403, data: { detail: 'This school is inactive.', errorCode: 'TENANT_INACTIVE' } })).toBe('This school is inactive.');
});
