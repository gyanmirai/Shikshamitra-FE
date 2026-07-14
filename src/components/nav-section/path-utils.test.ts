import { it, expect, describe } from 'vitest';

import { preservePathQueryParams } from './path-utils';

describe('preservePathQueryParams', () => {
  it('carries only explicitly allowed query parameters into a navigation link', () => {
    const current = new URLSearchParams('cycle=academic-year-2&applicant=private-lead-id');

    expect(
      preservePathQueryParams('/student/enrollment/settings/journey', ['cycle'], current)
    ).toBe('/student/enrollment/settings/journey?cycle=academic-year-2');
  });

  it('keeps existing target parameters and ignores missing values', () => {
    const current = new URLSearchParams('cycle=academic-year-2');

    expect(preservePathQueryParams('/target?panel=forms#content', ['missing'], current)).toBe(
      '/target?panel=forms#content'
    );
  });
});
