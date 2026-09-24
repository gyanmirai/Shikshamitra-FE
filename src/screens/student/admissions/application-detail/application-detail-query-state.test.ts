import { describe, expect, it } from 'vitest';

import { isAdmissionApplicationNotFound } from './application-detail-query-state';

describe('admission application detail query state', () => {
  it('recognizes a missing application response', () => {
    expect(isAdmissionApplicationNotFound({ status: 404 })).toBe(true);
  });

  it('does not treat other failures or malformed values as missing applications', () => {
    expect(isAdmissionApplicationNotFound({ status: 403 })).toBe(false);
    expect(isAdmissionApplicationNotFound({ status: '404' })).toBe(false);
    expect(isAdmissionApplicationNotFound(null)).toBe(false);
  });
});
