import { it, expect, describe } from 'vitest';

import { preservePathQueryParams, isPlainPrimaryNavigationClick } from './path-utils';

describe('preservePathQueryParams', () => {
  it('carries only explicitly allowed query parameters into a navigation link', () => {
    const current = new URLSearchParams('cycle=academic-year-2&applicant=private-lead-id');

    expect(
      preservePathQueryParams('/student/enrollment/settings/journey', ['cycle'], current)
    ).toBe('/student/enrollment/settings/journey?cycle=academic-year-2');
  });

  it('keeps existing target parameters and ignores missing values', () => {
    const current = new URLSearchParams('cycle=academic-year-2&panel=forms');

    expect(
      preservePathQueryParams(
        '/target?cycle=explicit-cycle&panel=capture#content',
        ['cycle', 'panel', 'missing'],
        current
      )
    ).toBe('/target?cycle=explicit-cycle&panel=capture#content');
  });

  it('keeps modified link clicks available to the browser', () => {
    const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
    expect(isPlainPrimaryNavigationClick(click)).toBe(true);
    expect(isPlainPrimaryNavigationClick({ ...click, ctrlKey: true })).toBe(false);
    expect(isPlainPrimaryNavigationClick({ ...click, metaKey: true })).toBe(false);
    expect(isPlainPrimaryNavigationClick({ ...click, button: 1 })).toBe(false);
  });
});
