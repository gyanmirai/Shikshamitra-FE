import { it, expect, describe } from 'vitest';

import {
  getPublicAdmissionsPortalUrl,
  getPublicAdmissionsCoreLanguage,
  getPublicAdmissionsLanguageOptions,
} from './public-admissions-portal';

describe('public admissions portal configuration', () => {
  it('builds the tenant-scoped public portal endpoint', () => {
    expect(getPublicAdmissionsPortalUrl('/api', 'tenant-1')).toBe(
      '/api/public/student-enrollment/admissions-crm/tenant-1/portal'
    );
  });

  it('keeps safe configured locales and guarantees an English fallback', () => {
    expect(getPublicAdmissionsLanguageOptions(['mr', 'fr-ca', 'mr', '../bad'])).toEqual([
      'en',
      'mr',
      'fr-ca',
    ]);
  });

  it('falls back to bundled English UI copy for an extensible locale', () => {
    expect(getPublicAdmissionsCoreLanguage('mr-IN')).toBe('en');
    expect(getPublicAdmissionsCoreLanguage('gu-IN')).toBe('gu');
  });
});
