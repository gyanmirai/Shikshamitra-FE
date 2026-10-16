import { it, expect, describe } from 'vitest';

import {
  formatPermissionDenied,
  getPermissionOperation,
  isPermissionDeniedMessage,
  isGenericPermissionMessage,
  normalizePermissionDeniedError,
} from './permission-denied';

const generic = "You don't have permission to access this resource.";
const context = { operation: 'view payroll policies' };
const contextual =
  'Your account cannot view payroll policies. Ask your administrator to review your permissions and assigned data access, then try again.';
const abpDefaults = [
  ['Volo.Authorization:010001', 'Authorization failed! Given policy has not granted'],
  ['Volo.Authorization:010002', 'Authorization failed! Given policy has not granted: Internal.Policy'],
  ['Volo.Authorization:010003', 'Authorization failed! Given policy has not granted for given resource: private-resource-id'],
  ['Volo.Authorization:010004', 'Authorization failed! Given requirement has not granted for given resource: private-resource-id'],
  ['Volo.Authorization:010005', 'Authorization failed! Given requirements has not granted for given resource: private-resource-id'],
];

describe('permission denial feedback', () => {
  it.each(abpDefaults)('replaces the technical ABP default for %s', (code, message) => {
    const error = { status: 403, data: { error: { code, message } } };
    expect(isGenericPermissionMessage(message)).toBe(true);
    expect(normalizePermissionDeniedError(error, context)).toMatchObject({
      status: 403,
      data: { detail: contextual, message: contextual, error: { code, message: contextual } },
    });
    expect(error.data.error.message).toBe(message);
  });

  it.each(abpDefaults)('preserves a specific scope reason even with ABP code %s', (code) => {
    const error = {
      status: 403,
      data: { error: { code, message: 'Only the assigned teacher can update this class.' } },
    };
    expect(normalizePermissionDeniedError(error, context)).toBe(error);
  });

  it('does not assume an unknown authorization code uses the installed ABP defaults', () => {
    const error = { status: 403, data: { error: { code: 'Volo.Authorization:019999', message: generic } } };
    expect(normalizePermissionDeniedError(error, context)).toBe(error);
  });

  it.each([
    generic,
    'You do not have permission to perform this action.',
    'You do not have permission to make this change.',
    'You don’t have permission to access this resource.',
    'Forbidden',
    '403 Forbidden',
    'Access denied.',
    'Authorization failed! Given policy has not granted.',
    'Authorization failed! Given policies have not been granted: Internal.Permission.Name',
  ])('recognizes generic authorization text: %s', (message) => {
    expect(isGenericPermissionMessage(message)).toBe(true);
    expect(normalizePermissionDeniedError(message, context)).toBe(contextual);
  });

  it.each([
    'Permission denied for this stage.',
    'You can only update students in your assigned divisions.',
    'This school is inactive. Contact the platform administrator.',
    'You do not have permission to approve your own request.',
    'Unauthorized access',
    undefined,
  ])('preserves a specific or nonpermission message: %s', (message) => {
    expect(isGenericPermissionMessage(message)).toBe(false);
    expect(normalizePermissionDeniedError(message, context)).toBe(message);
  });

  it('uses an honest fallback and supports the platform administrator context', () => {
    expect(formatPermissionDenied()).toBe(
      'Your account cannot complete this action. Ask your administrator to review your permissions and assigned data access, then try again.'
    );
    expect(formatPermissionDenied({ administrator: 'platform administrator' })).toContain(
      'Ask your platform administrator'
    );
  });

  it.each([
    ['getPayrollPolicies', 'view payroll policies'],
    ['addFuelType', 'add fuel types'],
    ['updateSectionManagement', 'update library sections'],
    ['deleteBoard', 'delete academic boards'],
    ['getEmployeeAssignableRoles', 'view assignable staff roles'],
    ['downloadHrReportExport', 'download HR reports'],
  ])('provides a reviewed operation for %s', (endpoint, operation) => {
    expect(getPermissionOperation(endpoint)).toBe(operation);
  });

  it.each(['unknownEndpoint', '/employees/private-id?token=secret', 'toString', '__proto__'])(
    'does not infer operations or reflect unknown endpoint names: %s',
    (endpoint) => {
      expect(getPermissionOperation(endpoint)).toBeUndefined();
      expect(formatPermissionDenied({ operation: getPermissionOperation(endpoint) })).not.toContain(
        endpoint
      );
    }
  );

  it('normalizes RFC7807 and legacy fields without mutating business metadata or the source', () => {
    const metadata = { correlationId: 'trace-123', missingPermissions: ['HR.Policies.View'] };
    const error = {
      status: 403,
      data: { errorCode: 'Volo.Authorization:010002', detail: generic, message: generic, data: metadata },
    };
    expect(normalizePermissionDeniedError(error, context)).toEqual({
      status: 403,
      data: {
        errorCode: 'Volo.Authorization:010002',
        detail: contextual,
        message: contextual,
        data: metadata,
      },
    });
    expect(error.data.detail).toBe(generic);
    expect(metadata).toEqual({ correlationId: 'trace-123', missingPermissions: ['HR.Policies.View'] });
  });

  it('synchronizes nested ABP messages and generic reasons for legacy readers', () => {
    const error = {
      status: 403,
      data: {
        error: {
          code: 'Volo.Authorization:010002',
          message: generic,
          details: generic,
          data: { Reason: generic, permissionNames: ['Private.Permission'] },
        },
      },
    };
    const normalized = normalizePermissionDeniedError(error, context);
    expect(normalized.data).toMatchObject({
      detail: contextual,
      message: contextual,
      error: {
        code: 'Volo.Authorization:010002',
        message: contextual,
        details: contextual,
        data: { Reason: contextual, permissionNames: ['Private.Permission'] },
      },
    });
    expect(error.data.error.data.Reason).toBe(generic);
  });

  it('retains the bare problem-details shape, including its metadata', () => {
    const error = { status: 403, title: 'Forbidden', detail: generic, data: { requestId: 'abc' } };
    expect(normalizePermissionDeniedError(error, context)).toEqual({
      status: 403,
      title: contextual,
      detail: contextual,
      message: contextual,
      data: { requestId: 'abc' },
    });
  });

  it('normalizes a bare ABP error and a statusless legacy data wrapper', () => {
    expect(normalizePermissionDeniedError({ error: { message: generic } }, context)).toMatchObject({
      detail: contextual,
      message: contextual,
      error: { message: contextual },
    });
    expect(normalizePermissionDeniedError({ data: { message: generic } }, context)).toMatchObject({
      data: { detail: contextual, message: contextual },
    });
  });

  it('normalizes Axios-like failures without changing response metadata', () => {
    const error = {
      message: 'Request failed with status code 403',
      response: { status: 403, headers: { 'x-request-id': 'abc' }, data: { message: generic } },
    };
    expect(normalizePermissionDeniedError(error, context)).toEqual({
      message: contextual,
      response: {
        status: 403,
        headers: { 'x-request-id': 'abc' },
        data: { message: contextual, detail: contextual },
      },
    });
  });

  it.each([undefined, null, '', {}, { title: 'Forbidden' }, { detail: 'Something went wrong' }])(
    'handles a forbidden response without a useful body: %s',
    (data) => {
      expect(normalizePermissionDeniedError({ status: 403, data }, context)).toMatchObject({
        status: 403,
        data: { message: contextual, detail: contextual },
      });
    }
  );

  it('normalizes a bodyless response and retains a parsing-error status for callers', () => {
    expect(normalizePermissionDeniedError({ status: 403 }, context)).toMatchObject({
      status: 403,
      data: { detail: contextual, message: contextual },
    });
    expect(
      normalizePermissionDeniedError({ status: 'PARSING_ERROR', originalStatus: 403, data: '' }, context)
    ).toMatchObject({ status: 'PARSING_ERROR', originalStatus: 403, data: { detail: contextual } });
  });

  it.each([400, 401, 404, 409, 500, 503, 'FETCH_ERROR'])(
    'does not rewrite a non403 transport failure (%s)',
    (status) => {
      const error = { status, data: { detail: generic } };
      expect(normalizePermissionDeniedError(error, context)).toBe(error);
    }
  );

  it.each([
    { detail: 'Only records in your assigned divisions are available.' },
    { error: { message: generic, data: { Reason: 'Select an available academic year.' } } },
    { detail: generic, validationErrors: [{ message: 'The school is outside your assigned scope.' }] },
    { detail: generic, errors: { division: ['Your assigned divisions do not include this class.'] } },
    { errorCode: 'TENANT_INACTIVE', detail: generic },
    { errorCode: 'UserScope:Denied', detail: generic },
    { errorCode: 1001, detail: generic },
    { error: { code: 'HR:Employee:010043', message: generic, data: { missingPermissions: [] } } },
  ])('preserves specific business, scope, tenant and prerequisite failures: %j', (data) => {
    const error = { status: 403, data };
    expect(normalizePermissionDeniedError(error, context)).toBe(error);
  });

  it('preserves a specific outer message when its metadata is in data', () => {
    const error = {
      status: 403,
      message: 'Only the assigned teacher can update this class.',
      data: { requestId: 'abc' },
    };
    expect(normalizePermissionDeniedError(error, context)).toBe(error);
  });

  it('recognizes canonical frontend and backend messages without repeating guidance', () => {
    const backend =
      'Access denied for Payroll Policies: View. Ask your administrator to review your permissions and assigned data access, then try again.';
    [contextual, backend, formatPermissionDenied({ administrator: 'platform administrator' })].forEach((message) => {
      expect(isPermissionDeniedMessage(message)).toBe(true);
      const error = { status: 403, data: { detail: message } };
      expect(normalizePermissionDeniedError(error, context)).toBe(error);
    });
    expect(isPermissionDeniedMessage(generic)).toBe(false);
    expect(isPermissionDeniedMessage(`${contextual}\nUnexpected text`)).toBe(false);
  });

  it('replaces the backend metadata-unavailable fallback with the reviewed frontend operation', () => {
    const message =
      'Access denied for this action. Ask your administrator to review your permissions and assigned data access, then try again.';
    expect(isPermissionDeniedMessage(message)).toBe(true);
    expect(isGenericPermissionMessage(message)).toBe(true);
    expect(normalizePermissionDeniedError({ status: 403, data: { detail: message } }, context)).toMatchObject({
      data: { detail: contextual, message: contextual },
    });
  });
});
