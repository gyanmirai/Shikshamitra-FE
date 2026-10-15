import { it, expect, describe } from 'vitest';

import { parseApiProblemDetail } from './api-problem-details';

const code = 'ShikshaMitra.TenantSettings:DuplicateStandardName';

describe('duplicate standard API feedback', () => {
  it('supports the legacy shared duplicate code only for standards', () => {
    expect(
      parseApiProblemDetail({
        data: {
          errorCode: 'ShikshaMitra.TenantSettings:00001',
          detail: 'One or more business rules were violated.',
          data: { entityName: 'standard', name: 'Class 3' },
        },
      }).detail
    ).toBe("A standard named 'Class 3' already exists in this academic stage.");
    expect(
      parseApiProblemDetail({
        data: {
          errorCode: 'ShikshaMitra.TenantSettings:00001',
          detail: 'This division already exists.',
          data: { entityName: 'division', name: 'A' },
        },
      }).detail
    ).toBe('This division already exists.');
  });
  it('maps a generic ProblemDetails conflict using its code and standard name', () => {
    expect(
      parseApiProblemDetail({
        data: {
          errorCode: code,
          detail: 'One or more business rules were violated.',
          data: { name: 'Class 3' },
        },
      }).detail
    ).toBe("A standard named 'Class 3' already exists in this academic stage.");
  });
  it('also supports an ABP remote error envelope', () => {
    expect(
      parseApiProblemDetail({
        data: {
          error: {
            code,
            message: 'One or more business rules were violated.',
            data: { name: 'Class 3' },
          },
        },
      }).detail
    ).toBe("A standard named 'Class 3' already exists in this academic stage.");
  });
  it('provides actionable duplicate copy when the API omits the name', () => {
    expect(parseApiProblemDetail({ data: { errorCode: code, title: 'Conflict' } }).detail).toBe(
      'A standard with this name already exists in this academic stage.'
    );
  });
  it('preserves unrelated specific errors', () => {
    expect(
      parseApiProblemDetail({ data: { detail: 'Permission denied for this stage.' } }).detail
    ).toBe('Permission denied for this stage.');
  });
});
