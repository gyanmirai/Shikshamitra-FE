import { it, expect, describe } from 'vitest';
import { studentPaths } from 'src/constants/student-menu';

import {
  getAdmissionFormPreviewUrl,
  getAdmissionFormListReturnUrl,
  getAdmissionFormPreviewReturnUrl,
  readAdmissionFormListReturnState,
} from './form-preview-navigation';

const { forms } = studentPaths.enrollment.settings;

describe('admission form preview navigation', () => {
  it('round trips unified list criteria through preview', () => {
    const state = {
      page: 2,
      rowsPerPage: 25,
      search: 'Fresh & current',
      filters: [{ column: 'status', type: 'equals', value: 1, valueType: 'enum', label: 'Status' }],
    };
    const origin = getAdmissionFormListReturnUrl(state);
    const preview = new URL(getAdmissionFormPreviewUrl('form/1', origin), 'https://school.test');
    expect(preview.pathname).toBe(`${forms}/form%2F1/preview`);
    expect(getAdmissionFormPreviewReturnUrl(preview.searchParams.get('returnTo'))).toBe(origin);
    expect(new URL(origin, 'https://school.test').searchParams.get('view')).toBeNull();
    expect(
      readAdmissionFormListReturnState(new URL(origin, 'https://school.test').searchParams)
    ).toEqual(state);
  });

  it.each([
    null,
    'https://evil.test',
    '//evil.test',
    `${forms}/elsewhere`,
    `${forms}Extra`,
    // eslint-disable-next-line no-script-url -- Regression coverage for an unsafe return destination.
    'javascript:alert(1)',
  ])('uses a safe Forms fallback for %s', (origin) => {
    expect(getAdmissionFormPreviewReturnUrl(origin, 1)).toBe(forms);
    expect(getAdmissionFormPreviewReturnUrl(origin, 0)).toBe(forms);
  });

  it.each(['inquiry', 'registration'])(
    'accepts a legacy %s return URL and restores its criteria without type scope',
    (view) => {
      const origin = `${forms}?view=${view}&page=3&size=25&search=Fresh`;
      expect(getAdmissionFormPreviewReturnUrl(origin)).toBe(origin);
      expect(
        readAdmissionFormListReturnState(new URL(origin, 'https://school.test').searchParams)
      ).toEqual({ page: 2, rowsPerPage: 25, search: 'Fresh', filters: [] });
    }
  );

  it.each(['page=-1&size=500&columns=invalid', 'page=NaN&size=0&columns=%5Bnull%5D'])(
    'ignores invalid list criteria',
    (query) => {
      expect(readAdmissionFormListReturnState(new URLSearchParams(query))).toEqual({
        page: 0,
        rowsPerPage: 10,
        search: '',
        filters: [],
      });
    }
  );
});
